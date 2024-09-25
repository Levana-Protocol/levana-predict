import { WalletType, checkWallet, useAccount } from "graz"
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  ModalClose,
  ModalDialog,
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
            <Button
              key={wallet.type}
              color="neutral"
              variant="soft"
              disabled={account.isConnecting}
              sx={{
                "--Button-gap": (theme) => theme.spacing(2),
                height: (theme) => theme.spacing(10),
                justifyContent: "flex-start",
                px: 3,
              }}
              startDecorator={
                <Box
                  component="img"
                  alt={`${wallet.name} logo`}
                  src={wallet.logo}
                  width={(theme) => theme.spacing(6)}
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
          ))}
      </DialogContent>
    </ModalDialog>
  )
}

export { presentConnectionModal }
