import { Typography, TypographyProps } from '@mui/joy'

import { mergeSx } from '@utils/styles'
import { useCopyToClipboard } from '@utils/hooks'

interface CopyableTextProps extends Omit<TypographyProps, "children" | "onClick"> {
  text: string,
  notificationText?: string,
}

const CopyableText = (props: CopyableTextProps) => {
  const { text, notificationText, ...typographyProps } = props
  const [, copy] = useCopyToClipboard()

  return (
    <Typography
      onClick={() => {
        copy(text, notificationText ?? text)
      }}
      {...typographyProps}
      sx={mergeSx(
        {
          cursor: "pointer",
          py: 1,
        },
        typographyProps.sx,
      )}
    >
      {text}
    </Typography>
  )
}

export { CopyableText, type CopyableTextProps}
