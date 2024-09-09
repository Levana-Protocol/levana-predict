import { queryOptions } from '@tanstack/react-query'

import { NETWORK_ID } from '@config/chain'
import { NTRN_DENOM } from '@config/environment'
import { fetchQuerier } from '@api/querier'
import { NTRN } from '@utils/tokens'

type BalancesResponse = Record<string, string>

const ntrnBalanceFromResponse = (response: BalancesResponse): NTRN => {
  return NTRN.fromUnits(response[NTRN_DENOM] ?? 0)
}

const fetchNtrnBalance = (address: string): Promise<NTRN> => {
  return fetchQuerier(
    "/v1/bank/all-balances",
    ntrnBalanceFromResponse,
    {
      network: NETWORK_ID,
      address: address,
    }
  )
}

const BALANCE_KEYS = {
  all: ["balance"] as const,
  address: (address: string) => [...BALANCE_KEYS.all, address] as const,
}

const ntrnBalanceQuery = (address: string) => queryOptions({
  queryKey: BALANCE_KEYS.address(address),
  queryFn: () => fetchNtrnBalance(address),
})

export { ntrnBalanceQuery, BALANCE_KEYS }
