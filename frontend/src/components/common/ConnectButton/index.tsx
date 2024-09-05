import { useAccount } from 'graz'
import { Button, ButtonProps, Typography } from '@mui/joy'

import { mergeSx, useCurrentBreakpoint } from '@utils/styles'
import { presentConnectionModal } from '@common/ConnectionModal'

interface ConnectButtonProps extends Omit<ButtonProps, "children" | "onClick"> {}

const ConnectButton = (props: ConnectButtonProps) => {
  const { ...buttonProps } = props
  const isXsScreen = useCurrentBreakpoint() === "xs"
  const { isConnecting, isDisconnected, isLoading } = useAccount()

  return (
    <Button
      variant="solid"
      color="primary"
      size={isXsScreen ? "sm" : "md"}
      {...buttonProps}
      sx={mergeSx(
        {
          borderRadius: "xl",
          my: { xs: 0.75, sm: 0.5 },
        },
        buttonProps.sx,
      )}
      aria-label="Connect wallet"
      onClick={() => { presentConnectionModal() }}
    >
      <Typography textColor="text.primary" fontWeight={600}>
        {isConnecting && (isXsScreen ? "Connecting" : "Connecting wallet")}
        {isDisconnected && (isXsScreen ? "Connect" : "Connect wallet")}
        {isLoading && (isXsScreen ? "Connecting" : "Connecting wallet")}
      </Typography>
    </Button>
  )
}

export { ConnectButton, type ConnectButtonProps}
