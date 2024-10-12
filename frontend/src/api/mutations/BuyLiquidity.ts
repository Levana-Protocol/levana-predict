import { useActiveWalletType, useCosmWasmSigningClient } from "graz"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"

import { useCurrentAccount } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { querierAwaitCacheAnd, querierBroadcastAndWait } from "@api/querier"
import { MARKET_KEYS, type MarketId, type OutcomeId } from "@api/queries/Market"
import { POSITIONS_KEYS } from "@api/queries/Positions"
import { BALANCES_KEYS } from "@api/queries/Balances"
import { trackBuyLiquidity } from "@utils/analytics"
import type { Coins } from "@utils/coins"
import { AppError, errorsMiddleware } from "@utils/errors"

export const LIQUIDITY_PORTION = "1"

interface BuyLiquidityRequest {
  deposit: {
    id: number
    outcome: number
    liquidity: string
  }
}

interface BuyLiquidityArgs {
  outcomeId: OutcomeId
  coinsAmount: Coins
}

const putBuyLiquidity = (
  address: string,
  signer: SigningCosmWasmClient,
  marketId: MarketId,
  args: BuyLiquidityArgs,
) => {
  const depositMsg: BuyLiquidityRequest = {
    deposit: {
      id: Number(marketId),
      outcome: Number(args.outcomeId),
      liquidity: LIQUIDITY_PORTION,
    },
  }

  return querierBroadcastAndWait(address, signer, [
    {
      payload: depositMsg,
      funds: [
        {
          denom: args.coinsAmount.denom,
          amount: args.coinsAmount.units.toFixed(0),
        },
      ],
    },
  ])
}

const BUY_LIQUIDITY_KEYS = {
  all: ["buy_liquidity"] as const,
  address: (address: string) => [...BUY_LIQUIDITY_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...BUY_LIQUIDITY_KEYS.address(address), marketId] as const,
}

const useBuyLiquidity = (marketId: MarketId) => {
  const account = useCurrentAccount()
  const walletName = useActiveWalletType().walletType
  const signer = useCosmWasmSigningClient()
  const queryClient = useQueryClient()
  const notifications = useNotifications()

  const mutation = useMutation({
    mutationKey: BUY_LIQUIDITY_KEYS.market(account.bech32Address, marketId),
    mutationFn: (args: BuyLiquidityArgs) => {
      if (signer.data) {
        return errorsMiddleware(
          "buy",
          putBuyLiquidity(account.bech32Address, signer.data, marketId, args),
        )
      } else {
        return Promise.reject()
      }
    },
    onSuccess: (_, args) => {
      notifications.notifySuccess(
        `Successfully bet ${args.coinsAmount.toFormat(true)}.`,
      )

      trackBuyLiquidity({
        marketId: marketId,
        outcomeId: args.outcomeId,
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
          `Failed to buy ${args.coinsAmount.toFormat(true)} of liquidity.`,
          err,
        ),
      )

      trackBuyLiquidity(
        {
          marketId: marketId,
          outcomeId: args.outcomeId,
          coins: args.coinsAmount,
          walletName: walletName,
        },
        err,
      )
    },
  })

  return mutation
}

export { useBuyLiquidity }
