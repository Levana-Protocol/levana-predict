/**
 * If the count is 1, returns the given singular string.
 * Otherwise, it returns the plural string.
 * If no plural is provided, the singular string with 's' appended is the default.
 * If `inclusive` is true, the result will be prefixed with the given count.
 *
 * @example
 * // returns "days"
 * pluralize("day", "2", false)
 *
 * @example
 * // returns "1 day"
 * pluralize("day", 1, true)
 */
const pluralize = (
  singular: string,
  count: number,
  inclusive = false,
  plural = `${singular}s`,
): string => {
  // TODO: use the [Pluralize library](https://github.com/plurals/pluralize)?
  const pluralized = count === 1 ? singular : plural
  return inclusive ? `${count} ${pluralized}` : pluralized
}

/**
 * Puts an ellipsis in the center of the given wallet address.
 * @param address The wallet address to abbreviate.
 * @param startLength The number of characters to show starting from the left.
 * @param endLength The number of characters to show starting from the right.
 */
const abbreviateWalletAddress = (
  address: string,
  startLength = 9,
  endLength = 4,
): string => {
  if (startLength + endLength >= address.length) {
    return address
  }

  const start = address.slice(0, startLength)
  const end = address.slice(-endLength, address.length)

  return `${start}...${end}`
}

const matchesRegex = (str: string, regex: string | RegExp): boolean => {
  return str.match(regex) !== null
}

export { pluralize, abbreviateWalletAddress, matchesRegex }
