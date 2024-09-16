import { queryOptions } from "@tanstack/react-query"

import { NETWORK_ID } from "@config/chain"
import { fetchQuerier } from "@api/querier"
import { type Denom, Tokens } from "@utils/tokens"

type BalancesResponse = Record<string, string>
type Balances = Map<Denom, Tokens>

const balancesFromResponse = (response: BalancesResponse): Balances => {
  return new Map(
    Object.entries(response).map(([denom, units]) => [
      denom,
      Tokens.fromUnits(denom, units),
    ]),
  )
}

const fetchBalances = (address: string): Promise<Balances> => {
  return fetchQuerier("/v1/bank/all-balances", balancesFromResponse, {
    network: NETWORK_ID,
    address: address,
  })
}

const BALANCES_KEYS = {
  all: ["balances"] as const,
  address: (address: string) => [...BALANCES_KEYS.all, address] as const,
}

const balancesQuery = (address: string) =>
  queryOptions({
    queryKey: BALANCES_KEYS.address(address),
    queryFn: () => fetchBalances(address),
  })

export { balancesQuery, BALANCES_KEYS, type Balances }
