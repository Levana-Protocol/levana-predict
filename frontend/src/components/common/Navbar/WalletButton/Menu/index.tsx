import { useAccount, useDisconnect } from 'graz'
import { ListDivider, ListItemContent, ListItemDecorator, Menu, MenuItem, MenuProps, Typography } from '@mui/joy'

import { CopyIcon } from '@assets/icons/Copy'
import { DisconnectIcon } from '@assets/icons/Disconnect'
import { abbreviateWalletAddress } from '@utils/string'
import { mergeSx } from '@utils/styles'
import { useCopyToClipboard } from '@utils/hooks'

interface NavbarWalletMenuProps extends Omit<MenuProps, "children"> { }

const NavbarWalletMenu = (props: NavbarWalletMenuProps) => {
  const { ...menuProps } = props
  const account = useAccount()
  const { disconnect } = useDisconnect()
  const copy = useCopyToClipboard()

  return (
    <Menu
      placement="bottom-end"
      variant="outlined"
      {...menuProps}
      sx={mergeSx(
        { backgroundColor: (theme) => theme.palette.background.level2 },
        menuProps.sx,
      )}
    >
      <MenuItem
        aria-label="Copy wallet address to clipboard"
        onClick={() => {
          const address = account.data?.bech32Address
          if (address) {
            copy(address)
          }
        }}
      >
        <ListItemDecorator><CopyIcon /></ListItemDecorator>
        <ListItemContent>
          <Typography level="inherit">Copy address</Typography>
          {account.data &&
            <Typography level="body-sm" textColor="text.secondary">
              {abbreviateWalletAddress(account.data.bech32Address)}
            </Typography>
          }
        </ListItemContent>
      </MenuItem>

      <ListDivider inset="gutter" />

      <MenuItem
        aria-label="Disconnect wallet"
        onClick={() => { disconnect() }}
      >
        <ListItemDecorator><DisconnectIcon /></ListItemDecorator>
        <ListItemContent>
          <Typography level="inherit">Disconnect</Typography>
        </ListItemContent>
      </MenuItem>
    </Menu>
  )
}

export { NavbarWalletMenu, type NavbarWalletMenuProps }