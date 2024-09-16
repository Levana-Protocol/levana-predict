import { BigNumber } from "bignumber.js"

import { pluralize } from "./string"

export const NS_IN_MS = 1000000
export const MS_IN_SECOND = 1000
export const MS_IN_MINUTE = 60 * MS_IN_SECOND
export const MS_IN_HOUR = 60 * MS_IN_MINUTE
export const MS_IN_DAY = 24 * MS_IN_HOUR

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  return date.toLocaleString(undefined, {
    timeStyle: "short",
    dateStyle: "short",
    hour12: false,
    ...options,
  })
}

const getTimeBetween = (from: Nanoseconds, to: Nanoseconds) => {
  const ns = to.minus(from)
  return nsToLargestTimeUnit(ns)
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

const nsToLargestTimeUnit = (ns: Nanoseconds) => {
  const ms = ns.dividedBy(NS_IN_MS)
  const units = [
    { key: "day", ms: MS_IN_DAY },
    { key: "hour", ms: MS_IN_HOUR },
    { key: "minute", ms: MS_IN_MINUTE },
    { key: "second", ms: MS_IN_SECOND },
  ]

  for (const unit of units) {
    if (ms.gte(unit.ms)) {
      return pluralize(
        unit.key,
        ms.dividedToIntegerBy(unit.ms).toNumber(),
        true,
      )
    }
  }

  return "0 days" // TODO: do we want to display this everywhere?
}

export { Nanoseconds, sleep, formatDate, getTimeBetween }
