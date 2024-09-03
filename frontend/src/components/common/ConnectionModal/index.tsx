import { ReactNode } from 'react'
import { WalletType, checkWallet, useConnect } from 'graz'
import { Button, DialogContent, DialogTitle, ModalClose, ModalDialog, Sheet } from '@mui/joy'

import { CHAIN_INFO } from '@config/chain'
import { dismiss, present } from '@state/modals'

const CONNECTION_MODAL_KEY = "connection_modal"

const presentConnectionModal = () => { present(CONNECTION_MODAL_KEY, <ConnectionModal />) }

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
  const { connectAsync } = useConnect()

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
              onClick={() => {
                if (wallet.type === WalletType.WALLETCONNECT) {
                  dismiss(CONNECTION_MODAL_KEY)
                }

                connectAsync({ chainId: CHAIN_INFO.chainId, walletType: wallet.type })
                  .then(() => { dismiss(CONNECTION_MODAL_KEY) })
                  .catch(err => {
                    if (!(err instanceof Error && err.message === "Request rejected") && !(err instanceof Error && err.message === "User closed wallet connect")) {
                      // notifications.notifyError(AppError.withCause(`Failed to connect with ${wallet.name}`, err))
                    }

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
