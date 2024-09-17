import { queryOptions } from "@tanstack/react-query"

import { NETWORK_ID } from "@config/chain"
import { CONTRACT_ADDRESS } from "@config/environment"
import { fetchQuerier } from "@api/querier"
import { Shares } from "@utils/shares"
import type { MarketId, OutcomeId } from "./Market"

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

const positionsFromResponse = (response: PositionsResponse): Positions => {
  const entries = response.outcomes.map(
    (amount, index) => [`${index}`, Shares.fromValue(amount)] as const,
  )
  return {
    outcomes: new Map(entries),
    claimed: response.claimed_winnings,
    shares: Shares.fromValue(response.shares),
  }
}

const fetchPositions = (
  address: string,
  marketId: MarketId,
): Promise<Positions> => {
  return fetchQuerier("/v1/predict/positions", positionsFromResponse, {
    network: NETWORK_ID,
    contract: CONTRACT_ADDRESS,
    addr: address,
    market_id: marketId,
  })
}

const POSITIONS_KEYS = {
  all: ["positions"] as const,
  address: (address: string) => [...POSITIONS_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) =>
    [...POSITIONS_KEYS.address(address), marketId] as const,
}

const positionsQuery = (address: string, marketId: MarketId) =>
  queryOptions({
    queryKey: POSITIONS_KEYS.market(address, marketId),
    queryFn: () => fetchPositions(address, marketId),
  })

export { positionsQuery, POSITIONS_KEYS, type Positions }
