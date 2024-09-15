import { BigNumber } from "bignumber.js"
import { queryOptions } from "@tanstack/react-query"

import lvnLogo from "@assets/brand/logo.png"
import { NETWORK_ID } from "@config/chain"
import { CONTRACT_ADDRESS } from "@config/environment"
import { fetchQuerier } from "@api/querier"
import { Nanoseconds, sleep } from "@utils/time"

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
}

interface ResponseMarketOutcome {
  id: number
  label: string
  pool_tokens: string
  total_tokens: string
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
  poolSize: BigNumber
  lpShares: BigNumber
}

interface MarketOutcome {
  id: OutcomeId
  label: string
  poolTokens: BigNumber
  totalTokens: BigNumber
  wallets: number
  /// This is the amount of collateral you'd have to bet on an outcome
  /// to receive 1 collateral of winnings.
  price: BigNumber
  /// What percentage of the vote this outcome received
  percentage: BigNumber
}

type MarketId = string
type OutcomeId = string

const marketFromResponse = (response: ResponseMarket): Market => {
  const outcomes = response.outcomes.map((outcome) =>
    outcomeFromResponse(response, outcome),
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
    winnerOutcome: response.winner
      ? outcomes.find((outcome) => outcome.id === `${response.winner}`)
      : undefined,
    totalWallets: response.total_wallets,
    poolSize: BigNumber(response.pool_size),
    lpShares: BigNumber(response.lp_shares),
  }
}

const outcomeFromResponse = (
  market: ResponseMarket,
  response: ResponseMarketOutcome,
): MarketOutcome => {
  let totalPoolTokens = BigNumber(0)
  for (const outcome of market.outcomes) {
    totalPoolTokens = totalPoolTokens.plus(outcome.pool_tokens)
  }
  const outcomeTotalTokens = BigNumber(response.total_tokens)
  const outcomePoolTokens = BigNumber(response.pool_tokens)

  // Taken from: https://docs.gnosis.io/conditionaltokens/docs/introduction3/
  // oddsWeightForOutcome = product(numOutcomeTokensInInventoryForOtherOutcome for every otherOutcome)
  // oddsForOutcome = oddsWeightForOutcome / sum(oddsWeightForOutcome for every outcome)

  const oddsWeights = []
  let totalOddsWeights = BigNumber(0)
  let totalProduct = BigNumber(1)
  for (let i = 0; i < market.outcomes.length; ++i) {
    totalProduct = totalProduct.times(market.outcomes[i].pool_tokens)
    let oddsWeight = BigNumber(1)
    for (let j = 0; j < market.outcomes.length; ++j) {
      if (i !== j) {
        oddsWeight = oddsWeight.times(market.outcomes[j].pool_tokens)
      }
    }
    oddsWeights.push(oddsWeight)
    totalOddsWeights = totalOddsWeights.plus(oddsWeight)
  }
  const oddsForOutcome = totalProduct
    .div(response.pool_tokens)
    .div(totalOddsWeights)
  let oddsWeightForOutcome = BigNumber(1)
  for (const outcome of market.outcomes) {
    oddsWeightForOutcome = oddsWeightForOutcome.times(outcome.pool_tokens)
  }
  oddsWeightForOutcome = oddsWeightForOutcome.div(response.pool_tokens)

  return {
    id: `${response.id}`,
    label: response.label,
    poolTokens: outcomePoolTokens,
    totalTokens: outcomeTotalTokens,
    wallets: response.wallets,
    price: oddsForOutcome,
    percentage: oddsForOutcome,
  }
}

const fetchMarket = async (marketId: MarketId): Promise<Market> => {
  await sleep(3000)
  return await fetchQuerier("/v1/predict/market", marketFromResponse, {
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
