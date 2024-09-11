import { BigNumber } from 'bignumber.js'
import { queryOptions } from '@tanstack/react-query'

import lvnLogo from '@assets/brand/logo.png'
import { NETWORK_ID } from '@config/chain'
import { CONTRACT_ADDRESS } from '@config/environment'
import { fetchQuerier } from '@api/querier'
import { Nanoseconds, sleep } from '@utils/time'

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
  pool_size: string,
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
  poolSize: BigNumber,
}

interface MarketOutcome {
  id: OutcomeId,
  label: string,
  totalTokens: BigNumber,
  wallets: number,
  /// This is the amount of collateral you'd have to bet on an outcome
  /// to receive 1 collateral of winnings.
  price: BigNumber,
  /// What percentage of the vote this outcome received
  percentage: BigNumber,
}

type MarketId = string
type OutcomeId = string

const marketFromResponse = (response: ResponseMarket): Market => {
  return {
    id: `${response.id}`,
    title: response.title,
    image: lvnLogo, // ToDo: use real image from each market
    description: response.description,
    possibleOutcomes: response.outcomes.map((outcome) => outcomeFromResponse(response, outcome)),
    denom: response.denom,
    depositFee: BigNumber(response.deposit_fee),
    withdrawalFee: BigNumber(response.withdrawal_fee),
    depositStopDate: new Nanoseconds(response.deposit_stop_date),
    withdrawalStopDate: new Nanoseconds(response.withdrawal_stop_date),
    winnerOutcome: response.winner ?? undefined,
    totalWallets: response.total_wallets,
    poolSize: BigNumber(response.pool_size),
  }
}

const outcomeFromResponse = (market: ResponseMarket, response: ResponseMarketOutcome): MarketOutcome => {
  let totalTokens = BigNumber(0);
  for (const outcome of market.outcomes) {
    totalTokens = totalTokens.plus(outcome.total_tokens)
  }
  const outcomeTotalTokens = BigNumber(response.total_tokens);
  return {
    id: `${response.id}`,
    label: response.label,
    totalTokens: outcomeTotalTokens,
    wallets: response.wallets,
    price: totalTokens.isZero() ? BigNumber(1) : outcomeTotalTokens.div(totalTokens),
    percentage: totalTokens.isZero() ? BigNumber(0) : outcomeTotalTokens.times(100).div(totalTokens)
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

export { marketQuery, MARKET_KEYS, type Market, type MarketOutcome, type MarketId, type OutcomeId }
