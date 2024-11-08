import { WalletType, checkWallet, useAccount } from "graz"
import { Box, Button, Stack } from "@mui/joy"
import NavigationModal, {
  NavigationModalDynamicItem,
} from "@levana-protocol/ui/NavigationModal"
import { useModal } from "@levana-protocol/utils/modal"

import keplrLogo from "@assets/logos/keplr.svg"
import leapLogo from "@assets/logos/leap.svg"
import walletconnectLogo from "@assets/logos/walletconnect.svg"
import { useConnectWallet } from "@config/chain"
import { useNotifications } from "@config/notifications"
import { AppError } from "@utils/errors"

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
  const { present } = useModal()
  const account = useAccount()
  const connectWallet = useConnectWallet()
  const notifications = useNotifications()

  return (
    <NavigationModal rootId={ConnectionModal.name}>
      {(modal) => (
        <>
          <NavigationModalDynamicItem
            id={ConnectionModal.name}
            title="Connect your Wallet"
            canClose
          >
            <Stack spacing={1}>
              {supportedWallets
                .filter((wallet) => checkWallet(wallet.type))
                .map((wallet) => (
                  <Button
                    key={wallet.type}
                    color="neutral"
                    variant="soft"
                    fullWidth
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
                        modal.close()
                      }

                      connectWallet(wallet.type)
                        .then(() => {
                          modal.close()
                        })
                        .catch((err) => {
                          notifications.notifyError(
                            AppError.withCause(
                              `Failed to connect with ${wallet.name}.`,
                              err,
                            ),
                          )

                          if (wallet.type === WalletType.WALLETCONNECT) {
                            present(ConnectionModal.name)
                          }
                        })
                    }}
                  >
                    {wallet.name}
                  </Button>
                ))}
            </Stack>
          </NavigationModalDynamicItem>
        </>
      )}
    </NavigationModal>
  )
}

export { ConnectionModal }
