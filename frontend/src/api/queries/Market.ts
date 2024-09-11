import { BigNumber } from 'bignumber.js'
import { queryOptions } from '@tanstack/react-query'

import lvnLogo from '@assets/brand/logo.png'
import { NETWORK_ID } from '@config/chain'
import { CONTRACT_ADDRESS } from '@config/environment'
import { fetchQuerier } from '@api/querier'
import { Nanoseconds, sleep } from '@utils/time'
import { USD } from '@utils/tokens'

interface ResponseMarket {
  id: number,
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
  id: number,
  label: string,
  pool_tokens: string,
  total_tokens: string,
  wallets: number,
}

interface Market {
  id: MarketId,
  title: string,
  description: string,
  image: string,
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
  id: OutcomeId,
  label: string,
  poolTokens: BigNumber,
  totalTokens: BigNumber,
  wallets: number,
  price: USD,
}

type MarketId = string
type OutcomeId = string

const marketFromResponse = (response: ResponseMarket): Market => {
  return {
    id: `${response.id}`,
    title: response.title,
    image: lvnLogo, // ToDo: use real image from each market
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
    id: `${response.id}`,
    label: response.label,
    poolTokens: BigNumber(response.pool_tokens),
    totalTokens: BigNumber(response.total_tokens),
    wallets: response.wallets,
    price: new USD(0.45), // ToDo: use real price from each outcome
  }
}

const fetchMarket = async (marketId: MarketId): Promise<Market> => {
  await sleep(3000)
  return await fetchQuerier(
    "/v1/predict/market",
    marketFromResponse,
    {
      network: NETWORK_ID,
      contract: CONTRACT_ADDRESS,
      market_id: marketId,
    }
  )
}

const MARKET_KEYS = {
  all: ["market"] as const,
  market: (marketId: MarketId) => [...MARKET_KEYS.all, marketId] as const,
}

const marketQuery = (marketId: string) => queryOptions({
  queryKey: MARKET_KEYS.market(marketId),
  queryFn: () => fetchMarket(marketId),
})

export { marketQuery, type Market, type MarketOutcome, type MarketId, type OutcomeId }
