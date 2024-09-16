import { Stack, type StackProps } from "@mui/joy"

import { DESKTOP_BREAKPOINT, mergeSx } from "@utils/styles"

const BasePage = (props: StackProps) => {
  const { ...stackProps } = props

  return (
    <Stack
      direction="column"
      {...stackProps}
      sx={mergeSx(
        {
          flex: 1,
          gap: 4,
          px: { xs: 2, [DESKTOP_BREAKPOINT]: 3 },
          width: "100%",
          height: "100%",
        },
        stackProps.sx,
      )}
    />
  )
}

export { BasePage }
