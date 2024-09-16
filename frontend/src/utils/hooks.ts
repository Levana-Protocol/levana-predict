import { useCallback, useRef, useState } from "react"

import { useNotifications } from "@config/notifications"
import { MS_IN_SECOND } from "./time"

/**
 * A wrapper around `useState` that alternates between two values.
 * The state is updated to a "new" value when the setter is called, and it's reset to the original value after a given delay.
 *
 * @param initialValue the default value that the state is reset to.
 * @param newValue the value the state is switched to.
 * @param delayMs the delay after which the state is reset to its default value.
 */
const useResettingState = <T>(
  initialValue: T,
  newValue: T | (() => T),
  delayMs: number,
) => {
  const [value, setValue] = useState(initialValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const changeState = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setValue(newValue)
    timeoutRef.current = setTimeout(() => setValue(initialValue), delayMs)
  }, [initialValue, newValue, delayMs])

  return [value, changeState] as const
}

const COPIED_NOTIFICATION_KEY = (content: string) => `copied_${content}`

/**
 * Provides a callback that copies text to the clipboard, and optionally displays a notification.
 * Also returns a "copied" state that is reset automatically, for displaying indicators.
 */
const useCopyToClipboard = () => {
  const [copied, setCopied] = useResettingState(false, true, 1.5 * MS_IN_SECOND)
  const notifications = useNotifications()

  const copy = useCallback((content: string, notification?: string) => {
    return navigator.clipboard.writeText(content).then(() => {
      setCopied()
      if (!!notification) {
        notifications.notifySuccess(`Copied ${notification}.`, {
          // https://notistack.com/features/basic#prevent-duplicate
          key: COPIED_NOTIFICATION_KEY(content),
          preventDuplicate: true,
        })
      }
    })
  }, [])

  return [copied, copy] as const
}

export { useCopyToClipboard }
