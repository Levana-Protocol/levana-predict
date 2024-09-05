import { queryOptions } from '@tanstack/react-query'

import { NETWORK_ID } from '@config/chain'
import { CONTRACT_ADDRESS } from '@config/environment'
import { fetchQuerier } from '@api/querier'

interface ResponseGlobalInfo {
  latest_market_id: number | null,
}

interface GlobalInfo {
  latestMarketId: number | undefined,
}

const globalInfoFromResponse = (response: ResponseGlobalInfo): GlobalInfo => {
  return {
    latestMarketId: response.latest_market_id ?? undefined,
  }
}

const fetchGlobalInfo = (): Promise<GlobalInfo> => {
  return fetchQuerier(
    "/v1/predict/global-info",
    globalInfoFromResponse,
    {
      network: NETWORK_ID,
      contract: CONTRACT_ADDRESS,
    }
  )
}

const GLOBAL_INFO_KEY = ["global_info"] as const

const globalInfoQuery = queryOptions({
  queryKey: GLOBAL_INFO_KEY,
  queryFn: () => fetchGlobalInfo(),
})

export { globalInfoQuery, type GlobalInfo }
