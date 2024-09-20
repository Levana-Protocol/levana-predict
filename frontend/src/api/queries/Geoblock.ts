import { queryOptions } from "@tanstack/react-query"

import { axiosClient } from "@config/queries"

type Geoblock = "allowed" | "blocked"

const GEOBLOCK_URL = "https://geoblocked.levana.finance"

const fetchGeoblock = async (): Promise<Geoblock> => {
  const res = await axiosClient.get(GEOBLOCK_URL)

  if (res.status !== 200) {
    throw new Error("Geoblock endpoint did not return a successful response")
  }

  if (
    typeof res.data === "object" &&
    "allowed" in res.data &&
    typeof res.data.allowed === "boolean"
  ) {
    return res.data.allowed ? "allowed" : "blocked"
  }

  throw new Error("Invalid JSON response from geoblock endpoint")
}

const GEOBLOCK_KEY = ["geoblock"] as const

const geoblockQuery = queryOptions({
  queryKey: GEOBLOCK_KEY,
  queryFn: () => fetchGeoblock(),
})

export { geoblockQuery, type Geoblock }
