import { match } from 'ts-pattern'
import { Coin, calculateFee } from '@cosmjs/stargate'
import { ExecuteResult , MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { CONTRACT_ADDRESS, IS_TESTNET, QUERIER_ADDRESS } from '@config/environment'
import { DEFAULT_GAS_PRICE, GAS_MULTIPLIER, NETWORK_ID } from '@config/chain'
import { axiosClient } from '@config/queries'
import { signedBytesEncode, utf8Encode } from '@utils/encoding'
import { MS_IN_SECOND, sleep } from '@utils/time'
import { AppError } from '@utils/errors.ts'
import { poll } from './utils.ts'

export const QUERIER_CACHE_TIME = MS_IN_SECOND * 2

const fetchQuerier = async <R, T>(path: string, transform: (res: R) => T, params?: Record<string, any>) => {
  try {
    const res = await axiosClient.get<R>(path, {
      baseURL: QUERIER_ADDRESS,
      params: params,
      paramsSerializer: {
        indexes: null,
      },
    })

    return transform(res.data)
  } catch (err) {
    console.log(`Error on 'fetch' to querier at "${path}"`, err)
    throw err
  }
}

const putQuerier = async <D, T>(path: string, data: D, params?: Record<string, any>) => {
  try {
    const res = await axiosClient.put<T>(
      path,
      data,
      {
        baseURL: QUERIER_ADDRESS,
        params: params,
      }
    )

    return res.data
  } catch (err) {
    console.log(`Error on 'put' to querier at "${path}"`, err)
    throw err
  }
}

interface ExecuteMsg {
  payload: any,
  funds?: Coin[],
}

const encodeMsgObject = (from: string, msg: ExecuteMsg): MsgExecuteContractEncodeObject => {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: {
      sender: from,
      contract: CONTRACT_ADDRESS,
      msg: utf8Encode(msg.payload),
      funds: msg.funds ?? [],
    },
  }
}

interface QuerierGasPriceResponse {
  base_fee: number,
}

const querierGetMainnetGasPrice = () => {
  return fetchQuerier(
    "/v1/chain/osmosis-mainnet-gas-price",
    (res: QuerierGasPriceResponse) => res.base_fee,
  )
}

interface QuerierSimulateTxRequest {
  messages: {
    execute_contract: {
      sender?: string,
      contract?: string,
      msg?: string,
      funds?: Coin[],
    },
  }[],
}

interface QuerierSimulateTxResponse {
  gas_used: number,
}

const querierSimulate = async (encodedMsgObjects: MsgExecuteContractEncodeObject[]) => {
  const gasPrice = `${IS_TESTNET ? DEFAULT_GAS_PRICE : await querierGetMainnetGasPrice()}uosmo`
  const gasMultiplier = GAS_MULTIPLIER

  const msgs = encodedMsgObjects.map((msgObject) => ({
    execute_contract: {
      ...msgObject.value,
      msg: msgObject.value.msg ? signedBytesEncode(msgObject.value.msg) : undefined,
    }
  }))

  const res = await putQuerier<
    QuerierSimulateTxRequest,
    QuerierSimulateTxResponse
  >(
    "/v1/chain/simulate",
    { messages: msgs },
    { network: NETWORK_ID },
  )

  const gasLimit = Math.round(res.gas_used * gasMultiplier)
  return calculateFee(gasLimit, gasPrice)
}

interface EncodedTx {
  body_bytes: string,
  auth_info_bytes: string,
  signatures: string[],
}

interface QuerierBroadcastTxResponse {
  txhash: string,
}

const querierExecuteTx = async (address: string, signer: SigningCosmWasmClient, msgs: ExecuteMsg | ExecuteMsg[]) => {
  if (!(Array.isArray(msgs))) {
    msgs = [msgs]
  }
  const encodedMsgs = msgs.map(msg => encodeMsgObject(address, msg))

  const fee = await querierSimulate(encodedMsgs)

  const txRaw = await signer
    .sign(address, encodedMsgs, fee, "")
    .catch((err) => {
      if (err instanceof Error && err.message === "Request rejected") {
        throw new AppError("Transaction rejected.", { level: "suppress", cause: err })
      } else {
        throw err
      }
    })

  const encodedTx: EncodedTx = {
    body_bytes: signedBytesEncode(txRaw.bodyBytes),
    auth_info_bytes: signedBytesEncode(txRaw.authInfoBytes),
    signatures: txRaw.signatures.map(signedBytesEncode),
  }

  const res = await putQuerier<EncodedTx, QuerierBroadcastTxResponse>(
    "/v1/chain/broadcast",
    encodedTx,
    { network: NETWORK_ID },
  )

  return res
}

type QuerierWaitForTxResponse =
  | { found: QuerierExecuteTxResult }
  | { not_found: {} }

interface QuerierExecuteTxResult extends ExecuteResult {
  timestamp: string,
  code: number,
  fee_amount: Coin[],
}

const isFound = (res: QuerierWaitForTxResponse): res is { found: QuerierExecuteTxResult } => {
  return "found" in res
}

const querierWaitForTx = (txHash: string) => {
  const waitForTx = () => fetchQuerier(
    "/v1/chain/wait-for-tx",
    (res: QuerierWaitForTxResponse) => res,
    {
      network: NETWORK_ID,
      txhash: txHash,
    }
  )

  return poll(waitForTx, isFound)
    .catch((err) => {
      throw AppError.withCause("Transaction not found in time. The chain might be congested.", err)
    })
    .then(res => res.found)
}

const querierBroadcastAndWait = async (address: string, signer: SigningCosmWasmClient, msgs: ExecuteMsg | ExecuteMsg[]) => {
  const { txhash } = await querierExecuteTx(address, signer, msgs)
  const res = await querierWaitForTx(txhash)

  // https://github.com/Levana-Protocol/levana-cosmos-rs/blob/ff8937f440a5485b73110cc04180215f81973a77/packages/cosmos/src/error.rs#L379-L404
  return match(res)
    .with({ code: 0 }, () => res)
    .with({ code: 5 }, () => { throw AppError.withCause("You don't have enough gas funds.", res) })
    .with({ code: 11 }, () => { throw AppError.withCause("The transaction ran out of gas.", res) })
    .otherwise(() => { throw AppError.withCause(`The transaction failed (code ${res.code}).`, res) })
}

const querierAwaitCacheAnd = async (...actions: (() => Promise<any>)[]) => {
  await sleep(QUERIER_CACHE_TIME)
  await Promise.all(actions.map(action => action()))
}

export { fetchQuerier, querierExecuteTx, querierWaitForTx, querierBroadcastAndWait, querierAwaitCacheAnd }
