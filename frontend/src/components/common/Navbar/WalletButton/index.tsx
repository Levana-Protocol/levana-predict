import { useAccount } from "graz"
import { forwardRef } from "react"
import {
  Button,
  type ButtonProps,
  Dropdown,
  MenuButton,
  Typography,
} from "@mui/joy"

import { ChevronDownIcon } from "@assets/icons/ChevronDown"
import { useCurrentAccount } from "@config/chain"
import { abbreviateWalletAddress } from "@utils/string"
import { hiddenUpTo, mergeSx, stylesUpTo } from "@utils/styles"
import { WalletAvatar } from "@common/Wallet/Avatar"
import { ConnectButton } from "@common/ConnectButton"
import { NavbarWalletMenu } from "./Menu"

interface NavbarWalletButtonProps
  extends Omit<ButtonProps, "children" | "onClick"> {}

const NavbarWalletButton = (props: NavbarWalletButtonProps) => {
  const { isConnected } = useAccount()

  return isConnected ? (
    <Dropdown>
      <MenuButton
        slots={{ root: ConnectedWalletButton }}
        slotProps={{ root: props }}
      />
      <NavbarWalletMenu />
    </Dropdown>
  ) : (
    <ConnectButton {...props} />
  )
}

const ConnectedWalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { ...buttonProps } = props
    const account = useCurrentAccount()

    return (
      <Button
        {...buttonProps}
        ref={ref}
        variant="outlined"
        color="neutral"
        startDecorator={<WalletAvatar address={account.bech32Address} />}
        endDecorator={
          <ChevronDownIcon
            size="sm"
            sx={mergeSx(
              hiddenUpTo("sm"),
              buttonProps["aria-expanded"]
                ? { transform: "rotate(-180deg)" }
                : undefined,
            )}
          />
        }
        slotProps={{
          startDecorator: { sx: stylesUpTo("sm", { mr: 0 }) },
          endDecorator: {
            sx: stylesUpTo("sm", { ml: "calc(var(--Button-gap) / 2)" }),
          },
        }}
        sx={mergeSx(
          stylesUpTo("sm", { pr: 0, gap: 0 }),
          {
            pl: 0.5,
            py: 0.5,
            borderRadius: "xl",
            ...(buttonProps["aria-expanded"] && {
              backgroundColor: "background.level2",
            }),
          },
          buttonProps.sx,
        )}
        aria-label={
          buttonProps["aria-expanded"]
            ? "Close wallet menu"
            : "Open wallet menu"
        }
      >
        <Typography
          textColor="text.primary"
          level="body-sm"
          sx={hiddenUpTo("sm")}
        >
          {abbreviateWalletAddress(account.bech32Address)}
        </Typography>
      </Button>
    )
  },
)

export { NavbarWalletButton, type NavbarWalletButtonProps }
