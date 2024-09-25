import BigNumber from "bignumber.js"

import type { Market, OutcomeId } from "@api/queries/Market"
import type { Positions } from "@api/queries/Positions"
import { LIQUDITY_PORTION } from "@api/mutations/PlaceBet"
import {
  Asset,
  Coins,
  getCoinConfig,
  SIGNIFICANT_DIGITS,
  type Denom,
} from "./coins"
import { formatToSignificantDigits, unitsToValue, valueToUnits } from "./number"

export const SLIPPAGE_THRESHOLD = 5

class Shares extends Asset {
  static symbol = "shares"

  protected constructor(units: BigNumber.Value, exponent: number) {
    super(Shares.symbol, units, exponent, exponent)
  }

  static fromUnits(units: BigNumber.Value, exponent: number): Shares {
    return new Shares(units, exponent)
  }

  static fromValue(value: BigNumber.Value, exponent: number): Shares {
    const units = valueToUnits(value, exponent)
    return Shares.fromUnits(units, exponent)
  }

  static fromCollateralUnits(
    collateralDenom: Denom,
    units: BigNumber.Value,
  ): Shares {
    const coinConfig = getCoinConfig(collateralDenom)
    return Shares.fromUnits(units, coinConfig.exponent)
  }

  static fromCollateralValue(
    collateralDenom: Denom,
    units: BigNumber.Value,
  ): Shares {
    const coinConfig = getCoinConfig(collateralDenom)
    return Shares.fromValue(units, coinConfig.exponent)
  }

  toFormat(withSuffix: boolean): string {
    const value = unitsToValue(this.units, this.exponent)
    const formatted = formatToSignificantDigits(
      value,
      SIGNIFICANT_DIGITS,
      this.exponent,
    )

    return `${formatted}${withSuffix ? ` ${this.symbol}` : ""}`
  }

  plus(shares: Shares): Shares {
    return new Shares(this.units.plus(shares.units), this.exponent)
  }

  minus(shares: Shares): Shares {
    return new Shares(this.units.minus(shares.units), this.exponent)
  }

  times(value: BigNumber.Value): Shares {
    return new Shares(this.units.times(value), this.exponent)
  }

  dividedBy(value: BigNumber.Value): Shares {
    return new Shares(this.units.dividedBy(value), this.exponent)
  }
}

const getShares = (positions: Positions, outcomeId: OutcomeId): Shares => {
  const exponent = positions.shares.exponent
  return positions.outcomes.get(outcomeId) ?? Shares.fromUnits(0, exponent)
}

const getPotentialWinnings = (market: Market, positionSize: Shares): Coins => {
  return Coins.fromUnits(market.denom, positionSize.units)
}

const getOddsForOutcome = (
  outcomePoolTokens: BigNumber.Value,
  outcomesPoolTokens: BigNumber.Value[],
): BigNumber => {
  // Taken from: https://docs.gnosis.io/conditionaltokens/docs/introduction3/
  // oddsWeightForOutcome = product(numOutcomeTokensInInventoryForOtherOutcome for every otherOutcome)
  // oddsForOutcome = oddsWeightForOutcome / sum(oddsWeightForOutcome for every outcome)

  const oddsWeights = []
  let totalProduct = BigNumber(1)
  for (let i = 0; i < outcomesPoolTokens.length; ++i) {
    totalProduct = totalProduct.times(outcomesPoolTokens[i])
    let oddsWeight = BigNumber(1)
    for (let j = 0; j < outcomesPoolTokens.length; ++j) {
      if (i !== j) {
        oddsWeight = oddsWeight.times(outcomesPoolTokens[j])
      }
    }
    oddsWeights.push(oddsWeight)
  }

  const totalOddsWeights = oddsWeights.reduce(
    (sum, value) => sum.plus(value),
    BigNumber(0),
  )

  const oddsForOutcome = totalProduct
    .div(outcomePoolTokens)
    .div(totalOddsWeights)

  return oddsForOutcome
}

interface PoolSize {
  pool: BigNumber[]
  returned: BigNumber[]
}

interface PurchaseResult {
  shares: Shares
  liquidity: Coins
  fees: Coins
  price: Coins
}

const addToPool = (poolInit: BigNumber[], amount: BigNumber): PoolSize => {
  const poolWeight = poolInit.reduce(
    (prev, curr) => (prev.isGreaterThan(curr) ? prev : curr),
    BigNumber(0),
  )
  const pool = []
  const returned = []
  for (let i = 0; i < poolInit.length; ++i) {
    const init = poolInit[i]
    const added = amount
      .times(init)
      .div(poolWeight)
      .integerValue(BigNumber.ROUND_DOWN)
    pool.push(init.plus(added))
    returned.push(amount.minus(added))
  }
  return { pool, returned }
}

const getPurchaseResult = (
  market: Market,
  outcomeId: OutcomeId,
  coinsAmount: Coins,
): PurchaseResult => {
  // To calculate the shares properly, we need to follow the same steps as
  // are taken by the contract, namely:
  //
  // 1. Take off the fee and add it to the liquidity pool,
  //    ignoring returned tokens (they go to the house).
  //
  // 2. Take off the liquidity portion and add it to the pool.
  //    Keep any leftover tokens from that for the swap step.
  //
  // 3. Swap all returned tokens from (2) plus minted tokens from the
  //    remaining buy amount for the selected token.

  // Step 0: convert all values to raw integers
  const selectedOutcome = Number.parseInt(outcomeId)
  const buyAmountTotal = coinsAmount.units
  const poolBeforeFees = market.possibleOutcomes.map(
    (outcome) => outcome.poolShares.units,
  )

  // Step 1: take off the fees and add to pool
  const fees = buyAmountTotal
    .times(market.depositFee)
    .integerValue(BigNumber.ROUND_DOWN)
  const buyAmountWithoutFees = buyAmountTotal.minus(fees)
  const { pool: poolAfterFees } = addToPool(poolBeforeFees, fees)

  // Step 2: take off the liquidity, add to pool, prepare to use the remainder
  const liquidity = buyAmountWithoutFees
    .times(BigNumber(LIQUDITY_PORTION))
    .integerValue(BigNumber.ROUND_DOWN)
  const buyAmount = buyAmountWithoutFees.minus(liquidity)
  const { pool, returned } = addToPool(poolAfterFees, liquidity)
  const invariantStep2 = pool.reduce(
    (prod, outcome) => prod.times(outcome),
    BigNumber(1),
  )

  // Step 3: add the new tokens to the pool and then adjust to match
  // the invariant
  let invariant = BigNumber(1)
  let productOthers = BigNumber(1)
  for (let i = 0; i < pool.length; ++i) {
    invariant = invariant.times(pool[i])
    pool[i] = pool[i].plus(buyAmount).plus(returned[i])
    if (i !== selectedOutcome) {
      productOthers = productOthers.times(pool[i])
    }
  }
  const selectedPool = invariantStep2
    .div(productOthers)
    .integerValue(BigNumber.ROUND_DOWN)
  const purchasedShares = pool[selectedOutcome].minus(selectedPool)

  return {
    shares: Shares.fromCollateralUnits(market.denom, purchasedShares),
    price: coinsAmount.dividedBy(purchasedShares),
    liquidity: Coins.fromUnits(market.denom, liquidity),
    fees: Coins.fromUnits(market.denom, fees),
  }
}

interface SaleResult {
  coins: Coins
  liquidity: Coins
  fees: Coins
  price: Coins
}

const getSaleResult = (
  market: Market,
  outcomeId: OutcomeId,
  sharesAmount: Shares,
): SaleResult => {
  // To calculate the coins properly, we need to follow the same steps as
  // are taken by the contract, namely:
  //
  // 1. Take off the fee and add it to the liquidity pool,
  //    ignoring returned tokens (they go to the house).
  //
  // 2. Take off the liquidity portion and add it to the pool.
  //    Keep any leftover tokens from that for the swap step.
  //
  // 3. Swap all returned tokens from (2) plus minted tokens from the
  //    remaining buy amount for the selected token.

  // Step 0: convert all values to raw integers
  const selectedOutcome = Number.parseInt(outcomeId)
  const sellAmountTotal = sharesAmount.units
  const poolBeforeFees = market.possibleOutcomes.map(
    (outcome) => outcome.poolShares.units,
  )

  // Step 1: take off the fees and add to pool
  const fees = sellAmountTotal
    .times(market.depositFee)
    .integerValue(BigNumber.ROUND_DOWN)
  const sellAmountWithoutFees = sellAmountTotal.minus(fees)
  const { pool: poolAfterFees } = addToPool(poolBeforeFees, fees)

  // Step 2: take off the liquidity, add to pool, prepare to use the remainder
  const liquidity = sellAmountWithoutFees
    .times(BigNumber(LIQUDITY_PORTION))
    .integerValue(BigNumber.ROUND_DOWN)
  const sellAmount = sellAmountWithoutFees.minus(liquidity)
  const { pool, returned } = addToPool(poolAfterFees, liquidity)
  const invariantStep2 = pool.reduce(
    (prod, outcome) => prod.times(outcome),
    BigNumber(1),
  )

  // Step 3: add the new tokens to the pool and then adjust to match
  // the invariant
  let invariant = BigNumber(1)
  let productOthers = BigNumber(1)
  for (let i = 0; i < pool.length; ++i) {
    invariant = invariant.times(pool[i])
    pool[i] = pool[i].plus(sellAmount).plus(returned[i])
    if (i !== selectedOutcome) {
      productOthers = productOthers.times(pool[i])
    }
  }
  const selectedPool = invariantStep2
    .div(productOthers)
    .integerValue(BigNumber.ROUND_DOWN)
  const purchasedCoins = pool[selectedOutcome].minus(selectedPool)

  return {
    coins: Coins.fromUnits(market.denom, purchasedCoins),
    price: Coins.fromUnits(market.denom, purchasedCoins).dividedBy(
      sharesAmount.units,
    ),
    liquidity: Coins.fromUnits(market.denom, liquidity),
    fees: Coins.fromUnits(market.denom, fees),
  }
}

export {
  Shares,
  type PurchaseResult,
  type SaleResult,
  getShares,
  getPotentialWinnings,
  getOddsForOutcome,
  getPurchaseResult,
  getSaleResult,
}
