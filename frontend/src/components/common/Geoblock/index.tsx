import { useEffect, type PropsWithChildren } from "react"
import { Typography } from "@mui/joy"
import { match, P } from "ts-pattern"
import { useQuery } from "@tanstack/react-query"

import { geoblockQuery } from "@api/queries/Geoblock"
import { BasePage } from "@common/BasePage"

const RESTRICTED_URL = "https://restricted.levana.finance"

const Geoblock = (props: PropsWithChildren) => {
  const { children } = props
  const geoblock = useQuery(geoblockQuery)

  return match(geoblock)
    .with({ status: "success", data: "allowed" }, () => children)
    .with({ status: "success", data: "blocked" }, () => (
      <RedirectToRestricted />
    ))
    .with({ status: "error", error: { message: P.select() } }, (error) => (
      <BasePage>
        <Typography>Error loading geoblock status: {error}</Typography>
      </BasePage>
    ))
    .with({ status: "pending" }, () => (
      <BasePage>
        <Typography>Checking geoblock status...</Typography>
      </BasePage>
    ))
    .exhaustive()
}

const RedirectToRestricted = () => {
  useEffect(() => {
    window.location.href = RESTRICTED_URL
  }, [])

  return (
    <BasePage>
      <Typography>
        Levana Predict is not available in your country, redirecting...
      </Typography>
    </BasePage>
  )
}

export { Geoblock }
