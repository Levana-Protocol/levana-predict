import { DependencyList, PropsWithChildren, useEffect, useMemo } from "react"
import { Store, useStore } from "@tanstack/react-store"

import { MS_IN_SECOND, Nanoseconds } from "@utils/time"

export const MARKET_STATUS_REFRESH_RATE = MS_IN_SECOND * 5
export const STAKINGS_STATUS_REFRESH_RATE = MS_IN_SECOND * 10
export const UNSTAKINGS_STATUS_REFRESH_RATE = MS_IN_SECOND * 10
export const VESTINGS_STATUS_REFRESH_RATE = MS_IN_SECOND * 10

const now = Nanoseconds.fromDate(new Date())

const timestampsStore = new Store({
  marketsStatus: now,
})

type TimestampKey = keyof typeof timestampsStore.state

const updateTimestamp = (key: TimestampKey) => {
  return timestampsStore.setState((state) => ({
    ...state,
    [key]: Nanoseconds.fromDate(new Date()),
  }))
}

const getTimestamp = (key: TimestampKey) => timestampsStore.state[key]

const useTimestamps = () => useStore(timestampsStore)

const useRefreshPeriodically = (key: TimestampKey, refreshRate: number) => {
  useEffect(() => {
    const callback = () => updateTimestamp(key)
    const interval = setInterval(callback, refreshRate)
    return () => {
      clearInterval(interval)
    }
  }, [refreshRate])
}

const TimestampsHandler = (props: PropsWithChildren) => {
  useRefreshPeriodically("marketsStatus", MARKET_STATUS_REFRESH_RATE)

  return props.children
}

/**
 * Stores a memoized value that is recalculated every time the given timestamp refreshes, or whenever the list of dependencies changes.
 *
 * @param key The identifier of the timestamp to use for updates.
 * @param getValue The callback that calculates a new value. Can receive the updated timestamp.
 * @param deps The list of dependencies that cause the value to be recalculated.
 */
const useTimedMemo = <T,>(
  key: TimestampKey,
  getValue: (ts: Nanoseconds) => T,
  deps: DependencyList,
): T => {
  const timestamp = useTimestamps()[key]
  const value = useMemo(() => getValue(timestamp), [timestamp, ...deps])

  return value
}

export {
  TimestampsHandler,
  updateTimestamp,
  getTimestamp,
  useTimestamps,
  useTimedMemo,
}
