import { Stack, type SvgIconProps } from "@mui/joy"

import { DESKTOP_BREAKPOINT } from "@utils/styles"
import { NavbarWalletButton } from "./WalletButton"
import { NavbarLogo } from "./Logo"

interface PageTab {
  name: string
  route: string
  Icon: (props: SvgIconProps) => JSX.Element
}

interface ExternalTab extends PageTab {
  title: string
}

const Navbar = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      columnGap={4}
      sx={{ p: { xs: 2, [DESKTOP_BREAKPOINT]: 3 } }}
    >
      <Stack direction="row" alignItems="center" columnGap={4}>
        <NavbarLogo />
      </Stack>
      <Stack direction="row" columnGap={2} alignItems="center">
        <NavbarWalletButton />
      </Stack>
    </Stack>
  )
}

export { Navbar, type PageTab, type ExternalTab }
