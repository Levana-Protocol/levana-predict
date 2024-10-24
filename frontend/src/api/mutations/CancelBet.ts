import { useActiveWalletType, useCosmWasmSigningClient } from "graz"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"

import { useCurrentAccount } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { querierAwaitCacheAnd, querierBroadcastAndWait } from "@api/querier"
import { MARKET_KEYS, type MarketId, type OutcomeId } from "@api/queries/Market"
import { POSITIONS_KEYS } from "@api/queries/Positions"
import { BALANCES_KEYS } from "@api/queries/Balances"
import { trackCancelBet } from "@utils/analytics"
import { AppError, errorsMiddleware } from "@utils/errors"
import type { Shares } from "@utils/shares"

interface CancelBetRequest {
  withdraw: {
    id: number
    outcome: number
    tokens: string
  }
}

interface CancelBetArgs {
  outcomeId: OutcomeId
  sharesAmount: Shares
}

const putCancelBet = (
  address: string,
  signer: SigningCosmWasmClient,
  marketId: MarketId,
  args: CancelBetArgs,
) => {
  const msg: CancelBetRequest = {
    withdraw: {
      id: Number(marketId),
      outcome: Number(args.outcomeId),
      tokens: args.sharesAmount.units.toFixed(),
    },
  }

  return querierBroadcastAndWait(address, signer, { payload: msg })
}

const CANCEL_BET_KEYS = {
  all: ["cancel_bet"] as const,
  address: (address: string) => [...CANCEL_BET_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...CANCEL_BET_KEYS.address(address), marketId] as const,
}

const useCancelBet = (marketId: MarketId) => {
  const account = useCurrentAccount()
  const walletName = useActiveWalletType().walletType
  const signer = useCosmWasmSigningClient()
  const queryClient = useQueryClient()
  const notifications = useNotifications()

  const mutation = useMutation({
    mutationKey: CANCEL_BET_KEYS.market(account.bech32Address, marketId),
    mutationFn: (args: CancelBetArgs) => {
      if (signer.data) {
        return errorsMiddleware(
          "sell",
          putCancelBet(account.bech32Address, signer.data, marketId, args),
        )
      } else {
        return Promise.reject()
      }
    },
    onSuccess: (_, args) => {
      notifications.notifySuccess(
        `Successfully cancelled bet of ${args.sharesAmount.toFormat(true)}.`,
      )

      trackCancelBet({
        marketId: marketId,
        outcomeId: args.outcomeId,
        shares: args.sharesAmount,
        walletName: walletName,
      })

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
          `Failed to cancel bet of ${args.sharesAmount.toFormat(true)}.`,
          err,
        ),
      )

      trackCancelBet(
        {
          marketId: marketId,
          outcomeId: args.outcomeId,
          shares: args.sharesAmount,
          walletName: walletName,
        },
        err,
      )
    },
  })

  return mutation
}

export { useCancelBet }
