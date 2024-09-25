import type { MarketId, OutcomeId } from "@api/queries/Market"
import type { Coins } from "./coins"
import type { Shares } from "./shares"

type EventName = "place_bet" | "cancel_bet" | "claim_earnings"

const trackSuccess = (eventName: EventName, params: Gtag.CustomParams) => {
  gtag("event", eventName, {
    ...params,
    result: "success",
  })
}

const trackFailure = (
  eventName: EventName,
  params: Gtag.CustomParams,
  reason: Error,
) => {
  gtag("event", eventName, {
    ...params,
    result: "failure",
    failure_reason: reason.message,
  })
}

const trackEvent = (
  eventName: EventName,
  params: Gtag.CustomParams,
  failure?: Error,
) => {
  if (failure) {
    trackFailure(eventName, params, failure)
  } else {
    trackSuccess(eventName, params)
  }
}

interface TrackPlaceBetParams {
  marketId: MarketId
  outcomeId: OutcomeId
  coins: Coins
  walletName: string
}

const trackPlaceBet = (params: TrackPlaceBetParams, failure?: Error) => {
  trackEvent(
    "place_bet",
    {
      market_id: params.marketId,
      outcome_id: params.outcomeId,
      tokens_amount: params.coins.units.toFixed(0),
      denom: params.coins.denom,
      wallet: params.walletName,
    },
    failure,
  )
}

interface TrackCancelBetParams {
  marketId: MarketId
  outcomeId: OutcomeId
  shares: Shares
  walletName: string
}

const trackCancelBet = (params: TrackCancelBetParams, failure?: Error) => {
  trackEvent(
    "cancel_bet",
    {
      market_id: params.marketId,
      outcome_id: params.outcomeId,
      shares_amount: params.shares.units.toFixed(0),
      wallet: params.walletName,
    },
    failure,
  )
}

interface TrackClaimEarningsParams {
  marketId: MarketId
  walletName: string
}

const trackClaimEarnings = (
  params: TrackClaimEarningsParams,
  failure?: Error,
) => {
  trackEvent(
    "cancel_bet",
    {
      market_id: params.marketId,
      wallet: params.walletName,
    },
    failure,
  )
}

export { trackPlaceBet, trackCancelBet, trackClaimEarnings }
