import BigNumber from "bignumber.js"
import { queryOptions } from "@tanstack/react-query"

import { MAINNET_NETWORK_ID } from "@config/chain"
import { fetchQuerier } from "@api/querier"
import { MS_IN_SECOND } from "@utils/time"
import { Denom, tokenConfigs } from "@utils/tokens"

const TOKEN_PRICES_REFRESH_RATE = MS_IN_SECOND * 2
const FACTORY_ADDRESS =
  "neutron1an8ls6d57c4qcvjq0jmm27jtrpk65twewfjqzdn7annefv7gadqsjs7uc3"

type TokenPricesResponse = {
  id: string
  price: {
    price: string
    expo: number
  }
}[]

type TokenPrices = Map<Denom, BigNumber>

const tokenPricesFromResponse = (
  response: TokenPricesResponse,
): TokenPrices => {
  const priceEntries: [Denom, BigNumber][] = []

  for (const [denom, tokenConfig] of tokenConfigs.entries()) {
    const responseToken = response.find(
      (token) => token.id === tokenConfig.pythId,
    )?.price
    if (responseToken) {
      priceEntries.push([
        denom,
        BigNumber(responseToken.price).times(
          BigNumber(10).pow(responseToken.expo),
        ),
      ])
    }
  }

  return new Map(priceEntries)
}

const fetchTokenPrices = (): Promise<TokenPrices> => {
  return fetchQuerier("/v1/pyth/latest-prices", tokenPricesFromResponse, {
    network: MAINNET_NETWORK_ID,
    factory: FACTORY_ADDRESS,
  })
}

const TOKEN_PRICES_KEY = ["token_prices"] as const

const tokenPricesQuery = queryOptions({
  queryKey: TOKEN_PRICES_KEY,
  queryFn: () => fetchTokenPrices(),
  refetchInterval: TOKEN_PRICES_REFRESH_RATE,
})

export { tokenPricesQuery, type TokenPrices }
