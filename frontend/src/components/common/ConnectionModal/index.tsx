import { WalletType, checkWallet, useAccount } from "graz"
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  ModalClose,
  ModalDialog,
  Sheet,
} from "@mui/joy"

import keplrLogo from "@assets/logos/keplr.svg"
import leapLogo from "@assets/logos/leap.svg"
import walletconnectLogo from "@assets/logos/walletconnect.svg"
import { useConnectWallet } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { dismiss, present } from "@state/modals"
import { AppError } from "@utils/errors"

const CONNECTION_MODAL_KEY = "connection_modal"

const presentConnectionModal = () => {
  present(CONNECTION_MODAL_KEY, <ConnectionModal />)
}

const dismissConnectionModal = () => {
  dismiss(CONNECTION_MODAL_KEY)
}

interface WalletOption {
  type: WalletType
  name: string
  logo: string
}

const supportedWallets: WalletOption[] = [
  {
    type: WalletType.KEPLR,
    name: "Keplr Extension",
    logo: keplrLogo,
  },
  {
    type: WalletType.LEAP,
    name: "Leap Extension",
    logo: leapLogo,
  },
  {
    type: WalletType.WC_KEPLR_MOBILE,
    name: "Keplr App",
    logo: keplrLogo,
  },
  {
    type: WalletType.WC_LEAP_MOBILE,
    name: "Leap App",
    logo: leapLogo,
  },
  {
    type: WalletType.WALLETCONNECT,
    name: "WalletConnect",
    logo: walletconnectLogo,
  },
]

const ConnectionModal = () => {
  const account = useAccount()
  const connectWallet = useConnectWallet()
  const notifications = useNotifications()

  return (
    <ModalDialog>
      <ModalClose color="neutral" variant="outlined" aria-label="Close" />

      <DialogTitle>Connect your Wallet</DialogTitle>

      <DialogContent>
        {supportedWallets
          .filter((wallet) => checkWallet(wallet.type))
          .map((wallet) => (
            <Sheet key={wallet.type} sx={{ p: 1 }}>
              <Button
                color="neutral"
                variant="plain"
                disabled={account.isConnecting}
                sx={{ "--Button-gap": (theme) => theme.spacing(2) }}
                startDecorator={
                  <Box
                    component="img"
                    alt={`${wallet.name} logo`}
                    src={wallet.logo}
                    width={(theme) => theme.spacing(7)}
                    sx={{ borderRadius: 14 }}
                  />
                }
                onClick={() => {
                  if (wallet.type === WalletType.WALLETCONNECT) {
                    dismissConnectionModal()
                  }

                  connectWallet(wallet.type)
                    .then(() => {
                      dismissConnectionModal()
                    })
                    .catch((err) => {
                      notifications.notifyError(
                        AppError.withCause(
                          `Failed to connect with ${wallet.name}.`,
                          err,
                        ),
                      )

                      if (wallet.type === WalletType.WALLETCONNECT) {
                        presentConnectionModal()
                      }
                    })
                }}
              >
                {wallet.name}
              </Button>
            </Sheet>
          ))}
      </DialogContent>
    </ModalDialog>
  )
}

export { presentConnectionModal }
