import { queryOptions } from "@tanstack/react-query"

import { NETWORK_ID } from "@config/chain"
import { CONTRACT_ADDRESS } from "@config/environment"
import { fetchQuerier } from "@api/querier"
import { Shares } from "@utils/shares"
import type { Market, MarketId, OutcomeId } from "./Market"

interface PositionsResponse {
  outcomes: string[]
  claimed_winnings: boolean
  shares: string
}

interface Positions {
  outcomes: Map<OutcomeId, Shares>
  claimed: boolean
  shares: Shares
}

const positionsFromResponse = (
  response: PositionsResponse,
  market: Market,
): Positions => {
  const entries = response.outcomes.map(
    (amount, index) =>
      [`${index}`, Shares.fromCollateralUnits(market.denom, amount)] as const,
  )
  return {
    outcomes: new Map(entries),
    claimed: response.claimed_winnings,
    shares: Shares.fromCollateralUnits(market.denom, response.shares),
  }
}

const fetchPositions = (
  address: string,
  market: Market,
): Promise<Positions> => {
  return fetchQuerier(
    "/v1/predict/positions",
    (res: PositionsResponse) => positionsFromResponse(res, market),
    {
      network: NETWORK_ID,
      contract: CONTRACT_ADDRESS,
      addr: address,
      market_id: market.id,
    },
  )
}

const POSITIONS_KEYS = {
  all: ["positions"] as const,
  address: (address: string) => [...POSITIONS_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...POSITIONS_KEYS.address(address), marketId] as const,
}

const positionsQuery = (address: string, market: Market) =>
  queryOptions({
    queryKey: POSITIONS_KEYS.market(address, market.id),
    queryFn: () => fetchPositions(address, market),
  })

export { positionsQuery, POSITIONS_KEYS, type Positions }
