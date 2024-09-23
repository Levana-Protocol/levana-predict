import { useActiveWalletType, useCosmWasmSigningClient } from "graz"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"

import { useCurrentAccount } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { querierAwaitCacheAnd, querierBroadcastAndWait } from "@api/querier"
import type { MarketId } from "@api/queries/Market"
import { POSITIONS_KEYS } from "@api/queries/Positions"
import { BALANCES_KEYS } from "@api/queries/Balances"
import { trackFailure, trackSuccess } from "@utils/analytics"
import { AppError, errorsMiddleware } from "@utils/errors"

interface ClaimEarningsRequest {
  collect: {
    id: number
  }
}

const putClaimEarnings = (
  address: string,
  signer: SigningCosmWasmClient,
  marketId: MarketId,
) => {
  const msg: ClaimEarningsRequest = {
    collect: {
      id: Number(marketId),
    },
  }

  return querierBroadcastAndWait(address, signer, { payload: msg })
}

const CLAIM_EARNINGS_KEYS = {
  all: ["claim_earnings"] as const,
  address: (address: string) => [...CLAIM_EARNINGS_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...CLAIM_EARNINGS_KEYS.address(address), marketId] as const,
}

const useClaimEarnings = (marketId: MarketId) => {
  const account = useCurrentAccount()
  const walletName = useActiveWalletType().walletType
  const signer = useCosmWasmSigningClient()
  const queryClient = useQueryClient()
  const notifications = useNotifications()

  const mutation = useMutation({
    mutationKey: CLAIM_EARNINGS_KEYS.market(account.bech32Address, marketId),
    mutationFn: () => {
      if (signer.data) {
        return errorsMiddleware(
          "claim",
          putClaimEarnings(account.bech32Address, signer.data, marketId),
        )
      } else {
        return Promise.reject()
      }
    },
    onSuccess: () => {
      notifications.notifySuccess("Successfully claimed earnings.")

      trackSuccess("claim_earnings", {
        market_id: marketId,
        wallet: walletName,
      })

      return querierAwaitCacheAnd(
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
    onError: (err) => {
      notifications.notifyError(
        AppError.withCause("Failed to claim earnings.", err),
      )

      trackFailure(
        "claim_earnings",
        {
          market_id: marketId,
          wallet: walletName,
        },
        err,
      )
    },
  })

  return mutation
}

export { useClaimEarnings }
