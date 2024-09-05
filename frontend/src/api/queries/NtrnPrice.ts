import BigNumber from 'bignumber.js'
import { queryOptions } from '@tanstack/react-query'

import { MAINNET_NETWORK_ID } from '@config/chain'
import { NTRN_CONFIG, NTRN_DENOM } from '@config/environment'
import { fetchQuerier } from '@api/querier'
import { MS_IN_SECOND } from '@utils/time'

const TOKEN_PRICES_REFRESH_RATE = MS_IN_SECOND * 2
const FACTORY_ADDRESS = "neutron1an8ls6d57c4qcvjq0jmm27jtrpk65twewfjqzdn7annefv7gadqsjs7uc3"

type TokenPricesResponse = {
  id: string,
  price: {
    price: string,
    expo: number,
  }
}[]

interface NtrnPrice {
  price: BigNumber | undefined,
}

const ntrnPriceFromResponse = (tokens: TokenPricesResponse): NtrnPrice => {
  const ntrn = tokens.find(token => token.id === NTRN_CONFIG.pythId)?.price

  if (ntrn) {
    return {
      price: new BigNumber(ntrn.price).times(BigNumber(10).pow(ntrn.expo)),
    }
  } else {
    return { price: undefined }
  }
}

const fetchNtrnPrice = (): Promise<NtrnPrice> => {
  return fetchQuerier(
    "/v1/pyth/latest-prices",
    ntrnPriceFromResponse,
    {
      network: MAINNET_NETWORK_ID,
      factory: FACTORY_ADDRESS,
    }
  )
}

const NTRN_PRICE_KEY = ["ntrn_price"] as const

const ntrnPriceQuery = queryOptions({
  queryKey: NTRN_PRICE_KEY,
  queryFn: () => fetchNtrnPrice(),
  refetchInterval: TOKEN_PRICES_REFRESH_RATE,
})

export { ntrnPriceQuery, type NtrnPrice }
