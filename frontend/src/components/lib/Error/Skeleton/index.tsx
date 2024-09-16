import { ReactNode } from "react"
import { Box, Sheet, SheetProps, SvgIconProps } from "@mui/joy"

import { AlertIcon } from "@assets/icons/Alert"
import { mergeSx } from "@utils/styles"

interface ErrorSkeletonProps extends Omit<SheetProps, "children"> {
  placeholderContent: ReactNode
  iconProps?: SvgIconProps
}

const ErrorSkeleton = (props: ErrorSkeletonProps) => {
  const { placeholderContent, iconProps, ...sheetProps } = props

  return (
    <Sheet
      color="danger"
      {...sheetProps}
      sx={mergeSx({ position: "relative" }, sheetProps.sx)}
    >
      <Box sx={{ visibility: "hidden" }}>{placeholderContent}</Box>
      <AlertIcon
        {...iconProps}
        sx={mergeSx(
          {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          },
          iconProps?.sx,
        )}
      />
    </Sheet>
  )
}

export { ErrorSkeleton, type ErrorSkeletonProps }
