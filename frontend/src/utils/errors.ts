import { AxiosError } from "axios"
import { P, match } from "ts-pattern"
import { isRouteErrorResponse } from "react-router-dom"

import { ENV } from "@config/environment"
import { CHAIN_ID } from "@config/chain"

type SeverityLevel = "error" | "suppress"

interface AppErrorOptions extends ErrorOptions {
  level?: SeverityLevel
}

/**
 * An extension of the `Error` class that should contain user-friendly error messages.
 */
class AppError extends Error {
  readonly name = "AppError"
  readonly level: SeverityLevel

  constructor(message: string, options?: AppErrorOptions) {
    super(message, options)
    this.level = options?.level ?? "error"
  }

  /**
   * Creates an error with the given cause as the underlying failure reason.
   * If the cause is another `AppError`, its severity level is replicated.
   */
  static withCause(message: string, cause: unknown) {
    return new AppError(message, {
      level: cause instanceof AppError ? cause.level : "error",
      cause: cause,
    })
  }
}

type UserAction = "connect" | "buy" | "sell" | "claim"

/**
 * @returns user-friendly errors (if possible), based on the action that is being performed.
 */
const errorForAction = (err: any, actionType?: UserAction): AppError | any => {
  if (actionType === "connect") {
    return match(err)
      .with(
        { message: P.string.regex("Request rejected") },
        () =>
          new AppError("User rejected the connection.", {
            cause: err,
            level: "suppress",
          }),
      )
      .with(
        { message: P.string.regex("User closed wallet connect") },
        () =>
          new AppError("User rejected the connection.", {
            cause: err,
            level: "suppress",
          }),
      )
      .with({ message: P.string.regex("There is no chain info for .+") }, () =>
        AppError.withCause(
          `Your app or extension doesn't have the necessary chain info for ${CHAIN_ID}. Please add the necessary chain and try again.`,
          err,
        ),
      )
      .otherwise(() => err)
  }

  if (err instanceof AxiosError) {
    const message = match(err.response?.data)
      .with(P.string, (msg) => msg)
      .with({ message: P.string }, (data) => data.message)
      .otherwise(() => undefined)

    if (!message) {
      return err
    }

    // TODO: add known contract errors
    return match({ actionType, message })
      .with(
        {
          actionType: "buy",
          message: P.string.regex("Deposits for market .+ have been stopped."),
        },
        () => AppError.withCause("You can no longer bet on this market.", err),
      )
      .with({ message: P.string.regex("out of gas") }, () =>
        AppError.withCause("The transaction doesn't have enough gas.", err),
      )
      .with(
        { message: P.string.regex("Tried to use .+, but .+ available") },
        () => AppError.withCause("You don't have enough balance.", err),
      )
      .with(
        {
          message: P.string.regex("spendable balance .+ is smaller than .+"),
        },
        () => AppError.withCause("You don't have enough gas funds.", err),
      )
      .otherwise(() => err)
  }

  return err
}

/**
 * Intercepts a promise's errors and makes them more user-friendly.
 * @throws the new error, or the original one if no parsing was done.
 */
const errorsMiddleware = <T>(
  actionType: UserAction,
  action: Promise<T>,
): Promise<T> => {
  return action.catch((err) => {
    throw errorForAction(err, actionType)
  })
}

interface ErrorDisplay {
  title: string
  description?: string
}

/**
 * @returns an user-friendly version of the given error.
 */
const displayError = <T>(err: T): ErrorDisplay => {
  if (err instanceof AppError) {
    const causeMsg =
      err.cause instanceof AppError
        ? err.cause.message
        : "Something went wrong."
    return { title: err.message, description: causeMsg }
  } else if (isRouteErrorResponse(err) && err.status === 404) {
    return { title: "We can't find what you're looking for." }
  } else {
    return { title: "Something went wrong." }
  }
}

/**
 * @returns a stringified report from an error.
 */
const getErrorReport = <T>(err: T): string => {
  let currentErr: unknown = err
  let report = err instanceof Error && err.stack ? [err.stack] : []

  let wrappers: string[] = []
  // Unwrap the possible `AppError`s containing the underlying error.
  while (currentErr instanceof AppError) {
    wrappers.push(`${currentErr}`)
    currentErr = currentErr.cause
  }

  if (wrappers) {
    report.push(`Wrappers:\n${wrappers.join("\n")}`)
  }

  // Handle the underlying error variants.
  if (currentErr instanceof AxiosError) {
    report.push(
      `Underlying error:\n${currentErr}\nCause:\n${currentErr.cause}\nResponse:\n${JSON.stringify(currentErr.response?.data)}`,
    )
  } else if (currentErr instanceof Error) {
    report.push(`Underlying error:\n${currentErr}\nCause:\n${currentErr.cause}`)
  } else if (currentErr) {
    report.push(`Underlying error:\n${JSON.stringify(currentErr)}`)
  }

  report.push(
    `Environment:\n${JSON.stringify({ env: ENV, host: window.location.host, chain: CHAIN_ID })}`,
  )

  return `${report.join("\n\n---\n\n")}\n`
}

export { AppError, errorsMiddleware, displayError, getErrorReport }
