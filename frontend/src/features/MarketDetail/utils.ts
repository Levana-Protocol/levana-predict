import { useParams } from 'react-router-dom'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Market, marketQuery } from '@api/queries/Market'

const useCurrentMarketQuery = () => {
  const { marketId } = useParams()
  if (!marketId) {
    throw new Error("Market ID not found")
  }

  return marketQuery(marketId)
}

const useSuspenseCurrentMarket = (): Market => {
  const query = useCurrentMarketQuery()
  return useSuspenseQuery(query).data
}

export { useCurrentMarketQuery, useSuspenseCurrentMarket }
