import BigNumber from "bignumber.js"
import { useCosmWasmSigningClient } from "graz"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"

import { useCurrentAccount } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { querierAwaitCacheAnd, querierBroadcastAndWait } from "@api/querier"
import { MARKET_KEYS, type MarketId, type OutcomeId } from "@api/queries/Market"
import { POSITIONS_KEYS } from "@api/queries/Positions"
import { BALANCES_KEYS } from "@api/queries/Balances"
import type { Coins } from "@utils/coins"
import { AppError, errorsMiddleware } from "@utils/errors"

interface ProvideRequest {
  provide: {
    id: number
  }
}

interface PlaceBetRequest {
  deposit: {
    id: number
    outcome: number
  }
}

interface PlaceBetArgs {
  outcomeId: OutcomeId
  coinsAmount: Coins
}

/// Hard-coded proportion of deposits that are provided as liquidity.
const PROVIDE_PORTION = BigNumber("0.1")

const putPlaceBet = (
  address: string,
  signer: SigningCosmWasmClient,
  marketId: MarketId,
  args: PlaceBetArgs,
) => {
  const provideMsg: ProvideRequest = {
    provide: {
      id: Number(marketId),
    },
  }
  const depositMsg: PlaceBetRequest = {
    deposit: {
      id: Number(marketId),
      outcome: Number(args.outcomeId),
    },
  }

  const provideAmount = args.coinsAmount.units.times(PROVIDE_PORTION)
  const depositAmount = args.coinsAmount.units.minus(provideAmount)

  return querierBroadcastAndWait(address, signer, [
    {
      payload: provideMsg,
      funds: [
        { denom: args.coinsAmount.denom, amount: provideAmount.toFixed(0) },
      ],
    },
    {
      payload: depositMsg,
      funds: [
        { denom: args.coinsAmount.denom, amount: depositAmount.toFixed(0) },
      ],
    },
  ])
}

const PLACE_BET_KEYS = {
  all: ["place_bet"] as const,
  address: (address: string) => [...PLACE_BET_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...PLACE_BET_KEYS.address(address), marketId] as const,
}

const usePlaceBet = (marketId: MarketId) => {
  const account = useCurrentAccount()
  const signer = useCosmWasmSigningClient()
  const queryClient = useQueryClient()
  const notifications = useNotifications()

  const mutation = useMutation({
    mutationKey: PLACE_BET_KEYS.market(account.bech32Address, marketId),
    mutationFn: (args: PlaceBetArgs) => {
      if (signer.data) {
        return errorsMiddleware(
          "buy",
          putPlaceBet(account.bech32Address, signer.data, marketId, args),
        )
      } else {
        return Promise.reject()
      }
    },
    onSuccess: (_, args) => {
      notifications.notifySuccess(
        `Successfully bet ${args.coinsAmount.toFormat(true)}.`,
      )

      return querierAwaitCacheAnd(
        () =>
          queryClient.invalidateQueries({
            queryKey: MARKET_KEYS.market(marketId),
          }),
        () =>
          queryClient.invalidateQueries({
            queryKey: POSITIONS_KEYS.market(account.bech32Address, marketId),
          }),
        () =>
          queryClient.invalidateQueries({
            queryKey: BALANCES_KEYS.address(account.bech32Address),
          }),
      )
    },
    onError: (err, args) => {
      notifications.notifyError(
        AppError.withCause(
          `Failed to bet ${args.coinsAmount.toFormat(true)}.`,
          err,
        ),
      )
    },
  })

  return mutation
}

export { usePlaceBet }
