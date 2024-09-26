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
  /// Tokens returned to the user's ownership
  returnedTokens: Shares[]
  /// Funds returned to the user
  funds: Coins
  /// Funds taken as fees by the house
  fees: Coins
  /// Calculated price received for each outcome token sold
  price: Coins
}

const getSaleResult = (
  market: Market,
  selectedOutcomeString: OutcomeId,
  sharesAmount: Shares,
): SaleResult | undefined => {
  // For now, we only support selling in 2-outcome markets
  if (market.possibleOutcomes.length !== 2) {
    return undefined
  }

  // We need to swap some of the selected outcome token for the unselected token.
  // We want the two values to be as close to each other as possible to maximize
  // the collateral we can withdraw. To do that, we use some math to determine
  // how much of the selected token to swap for unselected. Proofs provided elsewhere,
  // but if you're wondering what the a/b/c nomenclature is: we're using the qudaratic
  // equation to solve for the amount to burn.

  const [selectedOutcome, unselectedOutcome] = (() => {
    switch (selectedOutcomeString) {
      case "0":
        return [0, 1]
      case "1":
        return [1, 0]
      default:
        throw new Error(`Impossible selected outcome: ${selectedOutcomeString}`)
    }
  })()

  const poolSelected = market.possibleOutcomes[selectedOutcome].poolShares.units
  const poolUnselected =
    market.possibleOutcomes[unselectedOutcome].poolShares.units

  // If we put all of the tokens we're trying to liquidate in the pool,
  // what would be the size?
  const newPoolSelected = poolSelected.plus(sharesAmount.units)

  // Quadratic equation coefficients
  const a = BigNumber(1)
  // b is always negative, and Decimal256 (in Rust) only supports positive values.
  // Mirroring the decision in the contract to just deal with the negative version.
  const negb = newPoolSelected.plus(poolUnselected)
  const c = newPoolSelected
    .times(poolUnselected)
    .minus(poolSelected.times(poolUnselected))

  // // There are two roots for quadratic equations, but we always take the lower value.
  const negbSquared = negb.times(negb)
  const fourAC = a.times(c).times(4)
  const radical = negbSquared.minus(fourAC).sqrt()
  const selectedToBurnUnrounded = negb.minus(radical).div(a.times(2))
  const selectedToSellUnrounded = sharesAmount.units.minus(
    selectedToBurnUnrounded,
  )

  // We can only sell integer values, not fractions. We want to round down the amount
  // we're going to sell.
  const selectedToSell = selectedToSellUnrounded.integerValue(
    BigNumber.ROUND_DOWN,
  )
  const selectedToBurn = sharesAmount.units.minus(selectedToSell)

  // Now calculate how many unselected tokens we end up buying. This is determined
  // by respecting the CPMM invariant.
  const invariant = poolSelected.times(poolUnselected)
  const finalPoolSelected = poolSelected.plus(selectedToSell)
  const finalPoolUnselected = invariant.div(finalPoolSelected)

  const unselectedToBuy = poolUnselected
    .minus(finalPoolUnselected)
    .integerValue(BigNumber.ROUND_DOWN)

  // We'll redeem as many of these tokens as possible for collateral.
  // The remainder will be given back to the user.
  const toRedeem = selectedToBurn.isLessThan(unselectedToBuy)
    ? selectedToBurn
    : unselectedToBuy

  const selectedReturned = Shares.fromUnits(
    selectedToBurn.minus(toRedeem),
    sharesAmount.exponent,
  )
  const unselectedReturned = Shares.fromUnits(
    unselectedToBuy.minus(toRedeem),
    sharesAmount.exponent,
  )
  const returnedTokens =
    selectedOutcome === 0
      ? [selectedReturned, unselectedReturned]
      : [unselectedReturned, selectedReturned]

  const fees = toRedeem
    .times(market.withdrawalFee)
    .integerValue(BigNumber.ROUND_UP)
  const funds = toRedeem.minus(fees)

  return {
    returnedTokens,
    fees: Coins.fromUnits(market.denom, fees),
    funds: Coins.fromUnits(market.denom, funds),
    price: Coins.fromUnits(market.denom, toRedeem.div(sharesAmount.units)),
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
