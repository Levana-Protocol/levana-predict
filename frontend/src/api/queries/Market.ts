import { BigNumber } from 'bignumber.js'
import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'

import { NETWORK_ID } from '@config/chain'
import { CONTRACT_ADDRESS } from '@config/environment'
import { fetchQuerier } from '@api/querier'
import { Nanoseconds } from '@utils/time'
import { globalInfoQuery } from './GlobalInfo'

interface ResponseMarket {
  id: string,
  title: string,
  description: string,
  outcomes: ResponseMarketOutcome[],
  denom: string,
  deposit_fee: string,
  withdrawal_fee: string,
  deposit_stop_date: string,
  withdrawal_stop_date: string,
  winner: string | null,
  total_wallets: number,
}

interface ResponseMarketOutcome {
  id: string,
  label: string,
  pool_tokens: string,
  total_tokens: string,
  wallets: number,
}

interface Market {
  id: string,
  title: string,
  description: string,
  possibleOutcomes: MarketOutcome[],
  denom: string,
  depositFee: BigNumber,
  withdrawalFee: BigNumber,
  depositStopDate: Nanoseconds,
  withdrawalStopDate: Nanoseconds,
  winnerOutcome: string | undefined,
  totalWallets: number,
}

interface MarketOutcome {
  id: string,
  label: string,
  poolTokens: BigNumber,
  total_tokens: BigNumber,
  wallets: number,
}

const marketFromResponse = (response: ResponseMarket): Market => {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    possibleOutcomes: response.outcomes.map(outcomeFromResponse),
    denom: response.denom,
    depositFee: BigNumber(response.deposit_fee),
    withdrawalFee: BigNumber(response.withdrawal_fee),
    depositStopDate: new Nanoseconds(response.deposit_stop_date),
    withdrawalStopDate: new Nanoseconds(response.withdrawal_stop_date),
    winnerOutcome: response.winner ?? undefined,
    totalWallets: response.total_wallets,
  }
}

const outcomeFromResponse = (response: ResponseMarketOutcome): MarketOutcome => {
  return {
    id: response.id,
    label: response.label,
    poolTokens: BigNumber(response.pool_tokens),
    total_tokens: BigNumber(response.total_tokens),
    wallets: response.wallets,
  }
}

const fetchMarket = (marketId: string): Promise<Market> => {
  return fetchQuerier(
    "/v1/predict/market",
    marketFromResponse,
    {
      network: NETWORK_ID,
      contract: CONTRACT_ADDRESS,
      market_id: marketId,
    }
  )
}

const MARKET_KEY = (marketId: string) => ["market", marketId] as const

const marketQuery = (marketId: string) => queryOptions({
  queryKey: MARKET_KEY(marketId),
  queryFn: () => fetchMarket(marketId),
})

const useAllMarkets = () => {
  const globalInfo = useQuery(globalInfoQuery)
  const marketIds = globalInfo.data
    ? [...Array(globalInfo.data.latestMarketId).keys()].map(index => `${index + 1}`)
    : []

  const markets = useQueries({
    queries: marketIds.map(marketQuery),
  })

  return markets
}

export { marketQuery, useAllMarkets, type Market, type MarketOutcome }
