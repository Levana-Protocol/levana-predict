import { useCallback } from "react"
import { useParams } from "react-router-dom"
import { useSuspenseQuery } from "@tanstack/react-query"

import { useTimedMemo } from "@state/timestamps"
import {
  type Market,
  type MarketOutcome,
  marketQuery,
} from "@api/queries/Market"
import { getTimeBetween, type Nanoseconds } from "@utils/time"

const useCurrentMarketQuery = () => {
  const { marketId } = useParams()
  if (!marketId) {
    throw new Error("Market ID not found")
  }

  return marketQuery(marketId)
}

const useSuspenseCurrentMarket = (): Market => {
  const query = useCurrentMarketQuery()
  return useSuspenseQuery(query).data
}

type MarketStatus =
  | { state: "withdrawals"; timeLeft: string }
  | { state: "deposits"; timeLeft: string }
  | { state: "deciding" }
  | { state: "decided"; winner: MarketOutcome }

const getMarketStatus = (
  market: Market,
  timestamp: Nanoseconds,
): MarketStatus => {
  if (market.winnerOutcome) {
    return { state: "decided", winner: market.winnerOutcome }
  }

  if (timestamp.gte(market.depositStopDate)) {
    return { state: "deciding" }
  }

  if (timestamp.gte(market.withdrawalStopDate)) {
    return {
      state: "deposits",
      timeLeft: getTimeBetween(timestamp, market.depositStopDate),
    }
  }

  return {
    state: "withdrawals",
    timeLeft: getTimeBetween(timestamp, market.withdrawalStopDate),
  }
}

const useMarketStatus = (market: Market): MarketStatus => {
  const getStatus = useCallback(
    (timestmap: Nanoseconds) => getMarketStatus(market, timestmap),
    [market],
  )

  return useTimedMemo("marketsStatus", getStatus, [
    market.winnerOutcome,
    market.depositStopDate,
    market.withdrawalStopDate,
  ])
}

export {
  useCurrentMarketQuery,
  useSuspenseCurrentMarket,
  useMarketStatus,
  type MarketStatus,
}
