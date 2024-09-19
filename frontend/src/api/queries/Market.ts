import { BigNumber } from "bignumber.js"
import { queryOptions } from "@tanstack/react-query"

import lvnLogo from "@assets/brand/logo.png"
import { NETWORK_ID } from "@config/chain"
import { CONTRACT_ADDRESS } from "@config/environment"
import { fetchQuerier } from "@api/querier"
import { Nanoseconds } from "@utils/time"
import { Coins } from "@utils/coins"
import { getOddsForOutcome, Shares } from "@utils/shares"

interface ResponseMarket {
  id: number
  title: string
  description: string
  outcomes: ResponseMarketOutcome[]
  denom: string
  deposit_fee: string
  withdrawal_fee: string
  deposit_stop_date: string
  withdrawal_stop_date: string
  winner: number | null
  total_wallets: number
  pool_size: string
  lp_shares: string
  lp_wallets: number
}

interface ResponseMarketOutcome {
  id: number
  label: string
  pool_tokens: string
  wallets: number
}

interface Market {
  id: MarketId
  title: string
  description: string
  image: string
  possibleOutcomes: MarketOutcome[]
  denom: string
  depositFee: BigNumber
  withdrawalFee: BigNumber
  depositStopDate: Nanoseconds
  withdrawalStopDate: Nanoseconds
  winnerOutcome: MarketOutcome | undefined
  totalWallets: number
  poolSize: Coins
  lpShares: BigNumber
  lpWallets: number
}

interface MarketOutcome {
  id: OutcomeId
  label: string
  poolShares: Shares
  wallets: number
  /// This is the amount of collateral you'd have to bet on an outcome to receive 1 collateral of winnings.
  price: Coins
  /// What percentage of the vote this outcome received
  percentage: BigNumber
}

type MarketId = string
type OutcomeId = string

const marketFromResponse = (response: ResponseMarket): Market => {
  const outcomes = response.outcomes.map((outcome) =>
    outcomeFromResponse(outcome, response),
  )
  return {
    id: `${response.id}`,
    title: response.title,
    image: lvnLogo, // ToDo: use real image from each market
    description: response.description,
    possibleOutcomes: outcomes,
    denom: response.denom,
    depositFee: BigNumber(response.deposit_fee),
    withdrawalFee: BigNumber(response.withdrawal_fee),
    depositStopDate: new Nanoseconds(response.deposit_stop_date),
    withdrawalStopDate: new Nanoseconds(response.withdrawal_stop_date),
    winnerOutcome:
      response.winner === null
        ? undefined
        : outcomes.find((outcome) => outcome.id === `${response.winner}`),
    totalWallets: response.total_wallets,
    poolSize: Coins.fromUnits(response.denom, response.pool_size),
    lpShares: BigNumber(response.lp_shares),
    // Checking for missing data is just for testing with older contracts.
    // That code can be removed in the future.
    lpWallets: response.lp_wallets || 1,
  }
}

const outcomeFromResponse = (
  response: ResponseMarketOutcome,
  market: ResponseMarket,
): MarketOutcome => {
  const oddsForOutcome = getOddsForOutcome(
    response.pool_tokens,
    market.outcomes.map((outcome) => outcome.pool_tokens),
  )

  return {
    id: `${response.id}`,
    label: response.label,
    poolShares: Shares.fromCollateralUnits(market.denom, response.pool_tokens),
    wallets: response.wallets,
    price: Coins.fromValue(market.denom, oddsForOutcome),
    percentage: oddsForOutcome.times(100),
  }
}

const fetchMarket = (marketId: MarketId): Promise<Market> => {
  return fetchQuerier("/v1/predict/market", marketFromResponse, {
    network: NETWORK_ID,
    contract: CONTRACT_ADDRESS,
    market_id: marketId,
  })
}

const MARKET_KEYS = {
  all: ["market"] as const,
  market: (marketId: MarketId) => [...MARKET_KEYS.all, marketId] as const,
}

const marketQuery = (marketId: string) =>
  queryOptions({
    queryKey: MARKET_KEYS.market(marketId),
    queryFn: () => fetchMarket(marketId),
  })

export {
  marketQuery,
  MARKET_KEYS,
  type Market,
  type MarketOutcome,
  type MarketId,
  type OutcomeId,
}
