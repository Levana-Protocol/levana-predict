import { forwardRef } from "react"
import {
  Box,
  BoxProps,
  Input,
  InputProps,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/joy"

import { mergeSx } from "@utils/styles"

interface AssetInputProps extends Omit<InputProps, "slotProps"> {
  assetSymbol: string
  slotProps?: {
    container?: BoxProps
  }
}

/**
 * An input field for an asset, that places the suffix next to the value.
 */
const AssetInput = forwardRef((props: AssetInputProps, _ref: any) => {
  const { assetSymbol, slotProps, ...inputProps } = props

  const inputFontSx = { fontWeight: 600, fontSize: "xl2" } as const
  const hiddenSx = {
    visibility: "hidden",
    userSelect: "none",
    pointerEvents: "none",
  } as const

  return (
    <Box
      {...slotProps?.container}
      sx={mergeSx(slotProps?.container?.sx, { position: "relative" })}
    >
      <Stack
        direction="row"
        columnGap="0.5rem"
        alignItems="center"
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          fontWeight: inputFontSx.fontWeight,
          fontSize: (theme) => theme.fontSize[inputFontSx.fontSize],
        }}
      >
        <Box // Invisible replication of input content to shift the suffix according to its width
          component="span"
          aria-hidden="true"
          sx={mergeSx(
            { textOverflow: "ellipsis", overflow: "hidden" },
            hiddenSx,
          )}
        >
          {inputProps.value ? inputProps.value : inputProps.placeholder}
        </Box>
        <Suffix // Actual suffix being displayed
          textColor="text.secondary"
          assetSymbol={assetSymbol}
        />
      </Stack>
      <Input
        {...inputProps}
        variant="plain"
        autoComplete="off"
        sx={mergeSx(
          {
            p: 0,
            fontWeight: inputFontSx.fontWeight,
            fontSize: (theme) => theme.fontSize[inputFontSx.fontSize],
          },
          inputProps.sx,
        )}
        slotProps={{
          input: {
            inputMode: "decimal",
          },
        }}
        endDecorator={
          <Suffix // Invisible suffix to occupy space
            assetSymbol={assetSymbol}
            aria-hidden="true"
            sx={hiddenSx}
          />
        }
      />
    </Box>
  )
})

const Suffix = (props: { assetSymbol: string } & TypographyProps) => {
  const { assetSymbol, ...typographyProps } = props
  return <Typography {...typographyProps}>{assetSymbol}</Typography>
}

export { AssetInput, type AssetInputProps }
