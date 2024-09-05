import BigNumber from 'bignumber.js'

import { NTRN_DENOM, NTRN_CONFIG } from '@config/environment'
import { formatToSignificantDigits, unitsToValue, valueToUnits } from './number'

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN })
export const SIGNIFICANT_DIGITS = 5

export type Denom = string

abstract class Asset {
  public symbol: string
  public units: BigNumber
  protected exponent: number
  protected maxDecimalPlaces: number

  constructor(symbol: string, units: BigNumber.Value, exponent: number, maxDecimalPlaces: number) {
    this.symbol = symbol
    this.units = BigNumber(units)
    this.exponent = exponent
    this.maxDecimalPlaces = maxDecimalPlaces
  }

  toInput(): string {
    return this.getValue().decimalPlaces(this.maxDecimalPlaces).toFixed()
  }

  getValue(): BigNumber {
    return unitsToValue(this.units, this.exponent)
  }
}

class NTRN extends Asset {
  static denom = NTRN_DENOM
  static symbol = NTRN_CONFIG.symbol
  static exponent = NTRN_CONFIG.exponent

  protected constructor(units: BigNumber.Value) {
    super(NTRN.symbol, units, NTRN.exponent, NTRN.exponent)
  }

  toUsd(price: BigNumber): USD {
    return new USD(this.units.times(price).dividedBy(Math.pow(10, this.exponent)))
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

  toFullPrecision(withSuffix: boolean): string {
    return `${this.getValue().toFormat(this.exponent)}${withSuffix ? ` ${this.symbol}` : ""}`
  }

  static fromUnits(units: BigNumber.Value): NTRN {
    return new NTRN(units)
  }

  static fromValue(value: BigNumber.Value): NTRN {
    const units = valueToUnits(value, NTRN.exponent)
    return NTRN.fromUnits(units)
  }
}

class USD extends Asset {
  static symbol = "USD"
  static maxDecimalPlaces = 2

  constructor(value: BigNumber.Value) {
    super(USD.symbol, value, 0, USD.maxDecimalPlaces)
  }

  toNtrn(ntrnPrice: BigNumber): NTRN {
    return NTRN.fromUnits(this.units.dividedBy(ntrnPrice).times(Math.pow(10, NTRN.exponent)))
  }

  toFormat(withSuffix: boolean): string {
    return `${this.getValue().toFormat(USD.maxDecimalPlaces)}${withSuffix ? ` ${this.symbol}` : ""}`
  }
}

export { Asset, NTRN, USD }
