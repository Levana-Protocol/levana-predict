import { PropsWithChildren } from 'react'
import { GrazProvider } from 'graz'
import { neutron, neutrontestnet } from 'graz/chains'

import { IS_TESTNET } from './environment'

export const MAINNET_CHAIN_NAME = "neutron"
export const TESTNET_CHAIN_NAME = "neutrontestnet"
export const CHAIN_NAME = IS_TESTNET ? "neutrontestnet" : "neutron"
export const NETWORK_ID = IS_TESTNET ? "neutron-testnet" : "neutron-mainnet"
export const CHAIN_INFO = IS_TESTNET ? neutrontestnet : neutron
export const CHAIN_ID = CHAIN_INFO.chainId

export const TESTNET_RPC_URL = "https://querier-testnet.levana.finance/rpc/neutron-testnet"
export const WALLET_CONNECT_ID = "0739280223ce943edb2c9fbbaefafdb6"

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

export { ChainProvider }
