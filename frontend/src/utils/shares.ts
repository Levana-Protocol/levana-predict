import BigNumber from "bignumber.js"

import type { Market, OutcomeId } from "@api/queries/Market"
import type { Positions } from "@api/queries/Positions"
import {
  Asset,
  Coins,
  getCoinConfig,
  SIGNIFICANT_DIGITS,
  type Denom,
} from "./coins"
import { formatToSignificantDigits, unitsToValue, valueToUnits } from "./number"

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

export { Shares, getShares, getPotentialWinnings, getOddsForOutcome }
