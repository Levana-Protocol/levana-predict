import BigNumber from 'bignumber.js'

import { NETWORK_ID } from '@config/chain'
import { CONTRACT_ADDRESS } from '@config/environment'
import { fetchQuerier } from '@api/querier'
import { MarketId, OutcomeId } from './Market'
import { queryOptions } from '@tanstack/react-query'

interface PositionsResponse {
  outcomes: string[],
}

type Positions = Map<OutcomeId, BigNumber>

const positionsFromResponse = (response: PositionsResponse): Positions => {
  const entries = response.outcomes.map((amount, index) => [`${index}`, BigNumber(amount)] as const)
  return new Map(entries)
}

const fetchPositions = (address: string, marketId: MarketId): Promise<Positions> => {
  return fetchQuerier(
    "/v1/predict/positions",
    positionsFromResponse,
    {
      network: NETWORK_ID,
      contract: CONTRACT_ADDRESS,
      addr: address,
      market_id: marketId,
    }
  )
}

const POSITIONS_KEYS = {
  all: ["positions"] as const,
  address: (address: string) => [...POSITIONS_KEYS.all, address] as const,
  market: (address: string, marketId: MarketId) => [...POSITIONS_KEYS.address(address), marketId] as const,
}

const positionsQuery = (address: string, marketId: MarketId) => queryOptions({
  queryKey: POSITIONS_KEYS.market(address, marketId),
  queryFn: () => fetchPositions(address, marketId),
})

export { positionsQuery, type Positions }
