import { useCallback } from 'react'

const useCopyToClipboard = () => {
  const copy = useCallback((content: string) => {
    return navigator.clipboard
      .writeText(content)
  }, [])

  return copy
}

export { useCopyToClipboard }
