import BigNumber from "bignumber.js"

import type { Market, OutcomeId } from "@api/queries/Market"
import type { Positions } from "@api/queries/Positions"
import type { Coins } from "./coins"

class Shares {
  static precision = 3
  value: BigNumber

  protected constructor(value: BigNumber) {
    this.value = value
  }

  static fromValue(value: BigNumber.Value): Shares {
    return new Shares(BigNumber(value).decimalPlaces(Shares.precision))
  }

  toFormat(withSuffix: boolean): string {
    return `${this.value.toFormat(Shares.precision)}${withSuffix ? " shares" : ""}`
  }

  toInput(): string {
    return this.value.decimalPlaces(Shares.precision).toFixed()
  }

  plus(shares: BigNumber.Value): Shares {
    return Shares.fromValue(this.value.plus(shares))
  }

  minus(shares: BigNumber.Value): Shares {
    return Shares.fromValue(this.value.minus(shares))
  }

  times(value: BigNumber.Value): Shares {
    return Shares.fromValue(this.value.times(value))
  }

  dividedBy(value: BigNumber.Value): Shares {
    return Shares.fromValue(this.value.dividedBy(value))
  }
}

const getShares = (positions: Positions, outcomeId: OutcomeId): Shares => {
  return positions.outcomes.get(outcomeId) ?? Shares.fromValue(0)
}

const getPotentialWinnings = (market: Market, positionSize: Shares): Coins => {
  return market.poolSize.times(positionSize.value)
}

export { Shares, getShares, getPotentialWinnings }