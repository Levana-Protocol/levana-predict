import { sleep } from "@utils/time"

/**
 * Polls a request until its result is valid, and returns that result.
 *
 * @param fetchFn the callback through which the request is made.
 * @param isValid a callback that decides if the result is valid and polling can end.
 * @param maxAttempts the max number of attempts before failing. 10 by default.
 * @param getDelayMs a number of ms to wait between attempts, or a callback to get the delay based on the attempt number. By default, it's an exponential backoff starting from 200ms.
 */
const poll = async <N, V>(
  fetchFn: () => Promise<N | V>,
  isValid: (res: N | V) => res is V,
  maxAttempts: number = 8,
  getDelayMs: number | ((attemp: number) => number) = (attempt) =>
    Math.pow(2, attempt) * 200,
) => {
  let attempt = 0
  while (attempt < maxAttempts) {
    if (attempt > 0) {
      const delayMs =
        typeof getDelayMs === "number" ? getDelayMs : getDelayMs(attempt)
      await sleep(delayMs)
    }

    try {
      const fetchRes = await fetchFn()

      if (isValid(fetchRes)) {
        return fetchRes
      }
    } catch {}

    attempt += 1
  }

  return Promise.reject()
}

export { poll }
