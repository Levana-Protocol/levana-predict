import { axiosClient } from "@config/queries"
import { Typography } from "@mui/joy"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useEffect, type PropsWithChildren } from "react"

const GEOBLOCK_KEY = ["geoblock"] as const

const fetchGeoblock = async (): Promise<"allowed" | "blocked"> => {
  const res = await axiosClient.get("https://geoblocked.levana.finance")
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

const geoblockQuery = queryOptions({
  queryKey: GEOBLOCK_KEY,
  queryFn: () => fetchGeoblock(),
})

const Geoblock = (props: PropsWithChildren) => {
  const res = useQuery(geoblockQuery)

  switch (res.status) {
    case "pending":
      return <Typography>Checking geoblock status...</Typography>
    case "error":
      return (
        <Typography>
          Error loading geoblock status: {res.error.message}
        </Typography>
      )
    case "success": {
      switch (res.data) {
        case "allowed":
          return props.children
        case "blocked":
          return <RedirectToRestricted />
      }
    }
  }
}

const RedirectToRestricted = () => {
  useEffect(() => {
    window.location.href = "https://restricted.levana.finance"
  }, [])
  return (
    <Typography>
      Levana Predict is not available in your country, redirecting...
    </Typography>
  )
}

export { Geoblock }
