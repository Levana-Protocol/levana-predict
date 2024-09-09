import { Button, ButtonProps } from '@mui/joy'

import { CopyIcon } from '@assets/icons/Copy'
import { TickIcon } from '@assets/icons/Tick'
import { getErrorReport } from '@utils/errors'
import { mergeSx } from '@utils/styles'
import { useCopyToClipboard } from '@utils/hooks'

interface CopyableErrorButtonProps<T> extends Omit<ButtonProps, "children" | "onClick"> {
  error: T,
}

const CopyableErrorButton = <T,>(props: CopyableErrorButtonProps<T>) => {
  const { error, ...buttonProps } = props
  const [copied, copy] = useCopyToClipboard()

  return (
    <Button
      size="sm"
      variant="plain"
      color="neutral"
      startDecorator={copied ? <TickIcon fontSize="sm" /> : <CopyIcon fontSize="sm" />}
      aria-label="Copy error report to clipboard"
      {...buttonProps}
      sx={mergeSx({ minHeight: 0, p: 0 }, buttonProps.sx)}
      onClick={() => {
        const report = getErrorReport(error)
        copy(report)
      }}
    >
      {copied ? "Copied error report" : "Copy error report"}
    </Button>
  )
}

export { CopyableErrorButton, type CopyableErrorButtonProps }
