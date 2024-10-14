import { useActiveWalletType, useCosmWasmSigningClient } from "graz"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"

import { useCurrentAccount } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { querierAwaitCacheAnd, querierBroadcastAndWait } from "@api/querier"
import { MARKET_KEYS, type MarketId } from "@api/queries/Market"
import { POSITIONS_KEYS } from "@api/queries/Positions"
import { BALANCES_KEYS } from "@api/queries/Balances"
import { trackProvideLiquidity } from "@utils/analytics"
import type { Coins } from "@utils/coins"
import { AppError, errorsMiddleware } from "@utils/errors"

interface ProvideLiquidityRequest {
  provide: {
    id: number
  }
}

interface ProvideLiquidityArgs {
  coinsAmount: Coins
}

const putProvideLiquidity = (
  address: string,
  signer: SigningCosmWasmClient,
  marketId: MarketId,
  args: ProvideLiquidityArgs,
) => {
  const provideMsg: ProvideLiquidityRequest = {
    provide: {
      id: Number(marketId),
    },
  }

  return querierBroadcastAndWait(address, signer, [
    {
      payload: provideMsg,
      funds: [
        {
          denom: args.coinsAmount.denom,
          amount: args.coinsAmount.units.toFixed(0),
        },
      ],
    },
  ])
}

const PROVIDE_LIQUIDITY_KEYS = {
  all: ["provide_liquidity"] as const,
  address: (address: string) =>
    [...PROVIDE_LIQUIDITY_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...PROVIDE_LIQUIDITY_KEYS.address(address), marketId] as const,
}

const useProvideLiquidity = (marketId: MarketId) => {
  const account = useCurrentAccount()
  const walletName = useActiveWalletType().walletType
  const signer = useCosmWasmSigningClient()
  const queryClient = useQueryClient()
  const notifications = useNotifications()

  const mutation = useMutation({
    mutationKey: PROVIDE_LIQUIDITY_KEYS.market(account.bech32Address, marketId),
    mutationFn: (args: ProvideLiquidityArgs) => {
      if (signer.data) {
        return errorsMiddleware(
          "provide",
          putProvideLiquidity(
            account.bech32Address,
            signer.data,
            marketId,
            args,
          ),
        )
      } else {
        return Promise.reject()
      }
    },
    onSuccess: (_, args) => {
      notifications.notifySuccess(
        `Successfully provided ${args.coinsAmount.toFormat(true)} of liquidity.`,
      )

      trackProvideLiquidity({
        marketId: marketId,
        coins: args.coinsAmount,
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
          `Failed to provide ${args.coinsAmount.toFormat(true)} of liquidity.`,
          err,
        ),
      )

      trackProvideLiquidity(
        {
          marketId: marketId,
          coins: args.coinsAmount,
          walletName: walletName,
        },
        err,
      )
    },
  })

  return mutation
}

export { useProvideLiquidity }
