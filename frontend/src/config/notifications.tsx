import { PropsWithChildren, useCallback } from "react"
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  SnackbarProvider,
  useSnackbar,
} from "notistack"

import { AppError, displayError } from "@utils/errors"
import { NotificationContent } from "@lib/Notification/Content"
import { CopyableErrorButton } from "@lib/Copyable/ErrorButton"

declare module "notistack" {
  interface VariantOverrides {
    default: false
    info: false

    success: true
    warning: true
    error: {
      extraInfo: string | undefined
    }
  }
}

const NotificationsProvider = (props: PropsWithChildren) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      Components={{
        success: NotificationContent,
        warning: NotificationContent,
        error: NotificationContent,
      }}
    >
      {props.children}
    </SnackbarProvider>
  )
}

const useNotifications = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const notifySuccess = useCallback(
    (message: SnackbarMessage, options?: OptionsObject<"success">) => {
      return enqueueSnackbar({
        variant: "success",
        message: message,
        ...options,
      })
    },
    [enqueueSnackbar],
  )

  const notifyError = useCallback(
    (error: Error, options?: OptionsObject<"error">) => {
      const shouldSupress =
        error instanceof AppError && error.level === "suppress"

      if (!shouldSupress) {
        const { title, description } = displayError(error)
        return enqueueSnackbar({
          variant: "error",
          message: title,
          extraInfo: description,
          action: <CopyableErrorButton error={error} sx={{ mt: 0.5 }} />,
          ...options,
        })
      }
    },
    [enqueueSnackbar],
  )

  const dismiss = useCallback(
    (key?: SnackbarKey) => {
      return closeSnackbar(key)
    },
    [closeSnackbar],
  )

  return { notifySuccess, notifyError, dismiss }
}

export { NotificationsProvider, useNotifications }
