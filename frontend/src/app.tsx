import { useEffect } from "react"
import { Stack } from "@mui/joy"
import { Outlet, ScrollRestoration } from "react-router-dom"
import { ModalPresenter, useModal } from "@levana-protocol/utils/modal"

import { Navbar } from "@common/Navbar"
import { Footer } from "@common/Footer"
import { Geoblock } from "@common/Geoblock"
import {
  TERMS_ACCEPTED_KEY,
  TERMS_ACCEPTED_VALUE,
  TermsDisclaimerModal,
} from "@common/TermsDisclaimerModal"
import { ConnectionModal } from "@common/ConnectionModal"

const App = () => {
  const { present } = useModal()
  // biome-ignore lint/correctness/useExhaustiveDependencies: only do once
  useEffect(() => {
    const termsAccepted =
      localStorage.getItem(TERMS_ACCEPTED_KEY) === TERMS_ACCEPTED_VALUE
    if (!termsAccepted) {
      present(TermsDisclaimerModal.name)
    }
  }, [])

  return (
    <Stack gap={3} sx={{ flex: 1 }}>
      <Navbar />
      <Geoblock>
        <Outlet />
      </Geoblock>
      <Footer />

      <ModalPresenter queueKey={ConnectionModal.name}>
        <ConnectionModal />
      </ModalPresenter>

      <ModalPresenter queueKey={TermsDisclaimerModal.name}>
        <TermsDisclaimerModal />
      </ModalPresenter>

      <ScrollRestoration />
    </Stack>
  )
}

export { App }
