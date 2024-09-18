import BigNumber from "bignumber.js"
import { queryOptions } from "@tanstack/react-query"

import { MAINNET_NETWORK_ID } from "@config/chain"
import { fetchQuerier } from "@api/querier"
import { MS_IN_SECOND } from "@utils/time"
import { type Denom, USDC_DENOM, coinConfigs } from "@utils/coins"

const COIN_PRICES_REFRESH_RATE = MS_IN_SECOND * 2
const FACTORY_ADDRESS =
  "neutron1an8ls6d57c4qcvjq0jmm27jtrpk65twewfjqzdn7annefv7gadqsjs7uc3"

type CoinPricesResponse = {
  id: string
  price: {
    price: string
    expo: number
  }
}[]

type CoinPrices = Map<Denom, BigNumber>

const coinPricesFromResponse = (response: CoinPricesResponse): CoinPrices => {
  const priceEntries: [Denom, BigNumber][] = []

  for (const [denom, coinConfig] of coinConfigs.entries()) {
    const responseCoin = response.find(
      (coin) => coin.id === coinConfig.pythId,
    )?.price

    if (responseCoin) {
      priceEntries.push([
        denom,
        BigNumber(responseCoin.price).times(
          BigNumber(10).pow(responseCoin.expo),
        ),
      ])
    } else {
      if (denom === USDC_DENOM) {
        priceEntries.push([denom, BigNumber(1)])
      }
    }
  }

  return new Map(priceEntries)
}

const fetchCoinPrices = (): Promise<CoinPrices> => {
  return fetchQuerier("/v1/pyth/latest-prices", coinPricesFromResponse, {
    network: MAINNET_NETWORK_ID,
    factory: FACTORY_ADDRESS,
  })
}

const COIN_PRICES_KEY = ["coin_prices"] as const

const coinPricesQuery = queryOptions({
  queryKey: COIN_PRICES_KEY,
  queryFn: () => fetchCoinPrices(),
  refetchInterval: COIN_PRICES_REFRESH_RATE,
})

export { coinPricesQuery, type CoinPrices }
