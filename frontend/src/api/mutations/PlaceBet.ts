import { useCosmWasmSigningClient } from 'graz'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { useCurrentAccount } from '@config/chain'
import { NTRN_DENOM } from '@config/environment'
import { querierAwaitCacheAnd, querierBroadcastAndWait } from '@api/querier'
import { MarketId, OutcomeId } from '@api/queries/Market'
import { POSITIONS_KEYS } from '@api/queries/Positions'
import { NTRN } from '@utils/tokens'
import { errorsMiddleware } from '@utils/errors'

interface PlaceBetRequest {
  deposit: {
    id: number,
    outcome: number,
  },
}

interface PlaceBetArgs {
  outcomeId: OutcomeId,
  ntrnAmount: NTRN,
}

const putPlaceBet = (address: string, signer: SigningCosmWasmClient, marketId: MarketId, args: PlaceBetArgs) => {
  const msg: PlaceBetRequest = {
    deposit: {
      id: Number(marketId),
      outcome: Number(args.outcomeId),
    },
  }

  return querierBroadcastAndWait(
    address,
    signer,
    {
      payload: msg,
      funds: [{ denom: NTRN_DENOM, amount: args.ntrnAmount.units.toFixed(0) }],
    }
  )
}

const PLACE_BET_KEYS = {
  all: ["place_bet"] as const,
  address: (address: string) => [...PLACE_BET_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) => [...PLACE_BET_KEYS.address(address), marketId] as const,
}

const usePlaceBet = (marketId: MarketId) => {
  const account = useCurrentAccount()
  const signer = useCosmWasmSigningClient()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: PLACE_BET_KEYS.market(account.bech32Address, marketId),
    mutationFn: (args: PlaceBetArgs) => {
      if (signer.data) {
        return errorsMiddleware("buy", putPlaceBet(account.bech32Address, signer.data, marketId, args))
      } else {
        return Promise.reject()
      }
    },
    onSuccess: () => {
      return querierAwaitCacheAnd(
        () => queryClient.invalidateQueries({ queryKey: POSITIONS_KEYS.market(account.bech32Address, marketId)}),
      )
    },
  })

  return mutation
}

export { usePlaceBet }
