import { ReactNode } from 'react'
import { WalletType, checkWallet, useAccount } from 'graz'
import { Button, DialogContent, DialogTitle, ModalClose, ModalDialog, Sheet } from '@mui/joy'

import { useConnectWallet } from '@config/chain'
import { useNotifications } from '@config/notifications'
import { dismiss, present } from '@state/modals'
import { AppError } from '@utils/errors'

const CONNECTION_MODAL_KEY = "connection_modal"

const presentConnectionModal = () => { present(CONNECTION_MODAL_KEY, <ConnectionModal />) }
const dismissConnectionModal = () => { dismiss(CONNECTION_MODAL_KEY) }

interface WalletOption {
  type: WalletType,
  name: string,
  icon?: ReactNode,
}

const supportedWallets: WalletOption[] = [
  {
    type: WalletType.KEPLR,
    name: "Keplr Extension",
  },
  {
    type: WalletType.LEAP,
    name: "Leap Extension",
  },
  {
    type: WalletType.WC_KEPLR_MOBILE,
    name: "Keplr App",
  },
  {
    type: WalletType.WC_LEAP_MOBILE,
    name: "Leap App",
  },
  {
    type: WalletType.WALLETCONNECT,
    name: "WalletConnect",
  },
]

const ConnectionModal = () => {
  const account = useAccount()
  const connectWallet = useConnectWallet()
  const notifications = useNotifications()

  return (
    <ModalDialog>
      <ModalClose color="neutral" variant="outlined" aria-label="Close" />

      <DialogTitle>
        Connect your Wallet
      </DialogTitle>

      <DialogContent>
        {supportedWallets.filter(wallet => checkWallet(wallet.type)).map((wallet) =>
          <Sheet key={wallet.type} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 1 }}>
            <Button
              color="primary"
              disabled={account.isConnecting}
              onClick={() => {
                if (wallet.type === WalletType.WALLETCONNECT) {
                  dismissConnectionModal()
                }

                connectWallet(wallet.type)
                  .then(() => { dismissConnectionModal() })
                  .catch(err => {
                    notifications.notifyError(AppError.withCause(`Failed to connect with ${wallet.name}.`, err))

                    if (wallet.type === WalletType.WALLETCONNECT) {
                      presentConnectionModal()
                    }
                  })
              }}
            >
              {wallet.name}
            </Button>
          </Sheet>
        )}
      </DialogContent>

    </ModalDialog>
  )
}

export { presentConnectionModal }
