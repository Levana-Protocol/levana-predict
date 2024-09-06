import { PropsWithChildren } from 'react'
import { GrazProvider, useAccount } from 'graz'
import { neutron, neutrontestnet } from 'graz/chains'

import { IS_TESTNET } from './environment'

export const MAINNET_CHAIN_NAME = "neutron"
export const TESTNET_CHAIN_NAME = "neutrontestnet"
export const CHAIN_NAME = IS_TESTNET ? "neutrontestnet" : "neutron"
export const MAINNET_NETWORK_ID = "neutron-mainnet"
export const TESTNET_NETWORK_ID = "neutron-testnet"
export const NETWORK_ID = IS_TESTNET ? TESTNET_NETWORK_ID : MAINNET_NETWORK_ID
export const CHAIN_INFO = IS_TESTNET ? neutrontestnet : neutron
export const CHAIN_ID = CHAIN_INFO.chainId

export const WALLET_CONNECT_ID = "0739280223ce943edb2c9fbbaefafdb6"

export const TESTNET_RPC_URL = "https://querier-testnet.levana.finance/rpc/neutron-testnet"
export const GAS_MULTIPLIER = 1.4
export const DEFAULT_GAS_PRICE = 0.0025

const ChainProvider = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <GrazProvider
      grazOptions={{
        chains: [CHAIN_INFO],
        walletConnect: {
          options: { projectId: WALLET_CONNECT_ID },
        },
      }}
    >
      {children}
    </GrazProvider>
  )
}

/**
 * @returns the currently connected account, throwing an error if no wallet is connected.
 */
const useCurrentAccount = () => {
  const account = useAccount()

  if (!account.data) {
    throw new Error("Your wallet must be connected.")
  }

  return account.data
}

export { ChainProvider, useCurrentAccount }
