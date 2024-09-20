import { Stack } from "@mui/joy"
import { Outlet, ScrollRestoration } from "react-router-dom"

import { Navbar } from "@common/Navbar"
import { Footer } from "@common/Footer"
import { Geoblock } from "@common/Geoblock"
import { TermsDisclaimer } from "@common/TermsDisclaimer"

const App = () => {
  return (
    <Stack gap={3} sx={{ flex: 1 }}>
      <Navbar />
      <Geoblock>
        <Outlet />
      </Geoblock>
      <Footer />

      <TermsDisclaimer />
      <ScrollRestoration />
    </Stack>
  )
}

export { App }
