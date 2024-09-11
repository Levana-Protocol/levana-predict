import { BigNumber } from 'bignumber.js'

export const NS_IN_MS = 1000000
export const MS_IN_SECOND = 1000
export const MS_IN_MINUTE = 60 * MS_IN_SECOND
export const MS_IN_HOUR = 60 * MS_IN_MINUTE
export const MS_IN_DAY = 24 * MS_IN_HOUR

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleString(undefined, {
    timeStyle: "short",
    dateStyle: "short",
    hour12: false,
    ...options,
  })
}

/**
 * A `BigNumber` that represents a number of nanoseconds, to make APIs more readable.
 */
class Nanoseconds extends BigNumber {
  static fromDate(date: Date): Nanoseconds {
    return new Nanoseconds(BigNumber(date.getTime()).times(NS_IN_MS))
  }

  static fromMs(ms: BigNumber.Value): Nanoseconds {
    return new Nanoseconds(BigNumber(ms).times(NS_IN_MS))
  }

  toDate(): Date {
    return new Date(this.dividedBy(NS_IN_MS).toNumber())
  }

  toSeconds(): BigNumber {
    return this.dividedBy(NS_IN_MS).dividedBy(MS_IN_SECOND)
  }

  plus(ns: BigNumber.Value): Nanoseconds {
    return new Nanoseconds(BigNumber(this).plus(ns))
  }

  minus(ns: BigNumber.Value): Nanoseconds {
    return new Nanoseconds(BigNumber(this).minus(ns))
  }

  times(ns: BigNumber.Value): Nanoseconds {
    return new Nanoseconds(BigNumber(this).times(ns))
  }
}

export { Nanoseconds, sleep, formatDate }
