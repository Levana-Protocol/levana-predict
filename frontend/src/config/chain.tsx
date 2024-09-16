import { PropsWithChildren } from "react"
import {
  GrazProvider,
  WalletType,
  useAccount,
  useConnect,
  useSuggestChainAndConnect,
  ConfigureGrazArgs,
} from "graz"
import { neutron, neutrontestnet } from "graz/chains"

import { errorsMiddleware } from "@utils/errors"
import { IS_TESTNET } from "./environment"

type ChainInfo = ConfigureGrazArgs["chains"][number]

export const MAINNET_CHAIN_NAME = "neutron"
export const TESTNET_CHAIN_NAME = "neutrontestnet"
export const CHAIN_NAME = IS_TESTNET ? "neutrontestnet" : "neutron"
export const MAINNET_NETWORK_ID = "neutron-mainnet"
export const TESTNET_NETWORK_ID = "neutron-testnet"
export const NETWORK_ID = IS_TESTNET ? TESTNET_NETWORK_ID : MAINNET_NETWORK_ID

export const CHAIN_INFO: ChainInfo = (() => {
  const chainInfo = IS_TESTNET ? neutrontestnet : neutron

  // `graz generate` is misconfiguring a field, so we fix it manually:
  const currenciesWithFix = chainInfo.feeCurrencies.map((feeCurrency) => ({
    ...feeCurrency,
    coinGeckoId:
      feeCurrency.coinGeckoId === "" ? undefined : feeCurrency.coinGeckoId,
  }))

  return {
    ...chainInfo,
    feeCurrencies: currenciesWithFix,
  }
})()
export const CHAIN_ID = CHAIN_INFO.chainId

export const WALLET_CONNECT_ID = "0739280223ce943edb2c9fbbaefafdb6"

export const TESTNET_RPC_URL =
  "https://querier-testnet.levana.finance/rpc/neutron-testnet"
export const GAS_MULTIPLIER = 1.4
export const DEFAULT_GAS_PRICE = 0.0025

const ChainProvider = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <GrazProvider
      grazOptions={{
        chains: [CHAIN_INFO],
        walletConnect: {
          options: { projectId: WALLET_CONNECT_ID },
        },
      }}
    >
      {children}
    </GrazProvider>
  )
}

/**
 * @returns the currently connected account, throwing an error if no wallet is connected.
 */
const useCurrentAccount = () => {
  const account = useAccount()

  if (!account.data) {
    throw new Error("Your wallet must be connected.")
  }

  return account.data
}

const useConnectWallet = () => {
  const { connectAsync } = useConnect()
  const { suggestAndConnectAsync } = useSuggestChainAndConnect()

  const connectWallet = (wallet: WalletType) => {
    if (wallet === WalletType.KEPLR || wallet === WalletType.LEAP) {
      return suggestAndConnectAsync({
        chainInfo: CHAIN_INFO,
        walletType: wallet,
      })
    } else {
      return connectAsync({ chainId: CHAIN_ID, walletType: wallet })
    }
  }

  return (wallet: WalletType) =>
    errorsMiddleware("connect", connectWallet(wallet))
}

export { ChainProvider, useCurrentAccount, useConnectWallet }
