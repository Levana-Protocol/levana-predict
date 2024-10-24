import BigNumber from "bignumber.js"

const VALID_DECIMAL_REGEX = (maxDecimals: number) =>
  RegExp(`^\\d*(?:(?=\\.)\\.\\d{0,${maxDecimals}}|)$`)

const getProportion = (
  value: BigNumber.Value,
  total: BigNumber.Value,
): number => {
  const bigTotal = BigNumber(total)

  if (bigTotal.isZero()) {
    return 0
  } else {
    const bigValue = BigNumber(value)
    return bigValue.dividedBy(bigTotal).toNumber()
  }
}

const getPercentage = (
  value: BigNumber.Value,
  total: BigNumber.Value,
): number => {
  if (BigNumber(total).isZero()) {
    return 0
  } else {
    return BigNumber(value).dividedBy(total).times(100).toNumber()
  }
}

const getDifferencePercentage = (
  valueA: BigNumber.Value,
  valueB: BigNumber.Value,
) => {
  const difference = BigNumber(valueA).minus(valueB).abs()
  const average = BigNumber(valueA).plus(valueB).dividedBy(2)

  return getPercentage(difference, average)
}

/**
 * @returns the index of the first non-zero digit using the decimal point as reference.
 */
const getFirstSignificantDigitIndex = (value: BigNumber): number => {
  const integerPart = value.abs().integerValue(BigNumber.ROUND_DOWN)
  let index = 0

  if (integerPart.isZero()) {
    const regexMatch = value
      .abs()
      .toFixed()
      .match(/0\.(0*[^0])/)
    const length = regexMatch?.at(1)?.length

    if (length !== undefined) {
      index = length - 1
    }
  } else {
    index = -integerPart.toFixed().length
  }

  return index
}

const formatToSignificantDigits = (
  value: BigNumber,
  significantDigits: number,
  maxDigits: number,
): string => {
  if (value.isZero()) {
    return "0"
  }

  const decimalPlaces = Math.min(
    Math.max(getFirstSignificantDigitIndex(value) + significantDigits, 0),
    maxDigits,
  )

  return value.toFormat(decimalPlaces)
}

const unitsToValue = (units: BigNumber.Value, exponent: number): BigNumber => {
  return BigNumber(units).dividedBy(10 ** exponent)
}

const valueToUnits = (value: BigNumber.Value, exponent: number): BigNumber => {
  return BigNumber(value).times(10 ** exponent)
}

export {
  getProportion,
  getPercentage,
  getDifferencePercentage,
  VALID_DECIMAL_REGEX,
}
export { formatToSignificantDigits, unitsToValue, valueToUnits }
