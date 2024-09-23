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

export { trackSuccess, trackFailure, type EventName }
