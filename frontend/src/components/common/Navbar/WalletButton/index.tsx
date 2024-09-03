import { WalletType, useAccount, useConnect } from 'graz'
import { forwardRef } from 'react'
import { Button, ButtonProps, Dropdown, MenuButton, Typography } from '@mui/joy'

import { ChevronDownIcon } from '@assets/icons/ChevronDown'
import { CHAIN_ID } from '@config/chain'
import { abbreviateWalletAddress } from '@utils/string'
import { hiddenUpTo, mergeSx, stylesUpTo, useCurrentBreakpoint } from '@utils/styles'
import { WalletAvatar } from '@common/Wallet/Avatar'
import { NavbarWalletMenu } from './Menu'

interface NavbarWalletButtonProps extends Omit<ButtonProps, "children"> { }

const NavbarWalletButton = (props: NavbarWalletButtonProps) => {
  const { isConnected } = useAccount()

  return (
    isConnected
      ?
      <Dropdown>
        <MenuButton slots={{ root: ConnectedWalletButton }} slotProps={{ root: props }} />
        <NavbarWalletMenu />
      </Dropdown>
      : <DisconnectedWalletButton {...props} />
  )
}

const ConnectedWalletButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { ...buttonProps } = props
  const account = useAccount()

  return (
    <Button
      {...buttonProps}
      ref={ref}
      variant="outlined"
      color="neutral"
      startDecorator={account.data &&
        <WalletAvatar address={account.data.bech32Address} />
      }
      endDecorator={
        <ChevronDownIcon
          size="sm"
          sx={mergeSx(
            hiddenUpTo("sm"),
            buttonProps['aria-expanded'] ? { transform: "rotate(-180deg)" } : undefined
          )}
        />
      }
      slotProps={{
        startDecorator: { sx: stylesUpTo("sm", { mr: 0 }) },
        endDecorator: { sx: stylesUpTo("sm", { ml: "calc(var(--Button-gap) / 2)" }) },
      }}
      sx={mergeSx(
        stylesUpTo("sm", { pr: 0, gap: 0 }),
        {
          pl: 0.5,
          py: 0.5,
          borderRadius: "xl",
          ...(buttonProps['aria-expanded'] && {
            backgroundColor: "background.level2",
          }),
        },
        buttonProps.sx,
      )}
      aria-label={buttonProps['aria-expanded'] ? "Close wallet menu" : "Open wallet menu"}
    >
      <Typography textColor="text.primary" level="body-sm" sx={hiddenUpTo("sm")}>
        {abbreviateWalletAddress(account.data?.bech32Address ?? "")}
      </Typography>
    </Button>
  )
})

const DisconnectedWalletButton = (props: NavbarWalletButtonProps) => {
  const { ...buttonProps } = props
  const isXsScreen = useCurrentBreakpoint() === "xs"
  const { isConnecting, isDisconnected, isLoading } = useAccount()
  const { connect } = useConnect()

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
      onClick={() => { connect({ chainId: CHAIN_ID, walletType: WalletType.KEPLR }) }}
    >
      <Typography textColor="text.primary" level={isXsScreen ? "body-xs" : "body-sm"} fontWeight={600}>
        {isConnecting && (isXsScreen ? "Connecting" : "Connecting wallet")}
        {isDisconnected && (isXsScreen ? "Connect" : "Connect wallet")}
        {isLoading && (isXsScreen ? "Connecting" : "Connecting wallet")}
      </Typography>
    </Button>
  )
}

export { NavbarWalletButton, type NavbarWalletButtonProps }
