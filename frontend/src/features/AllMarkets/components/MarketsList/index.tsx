import { Box } from "@mui/joy"
import { useSuspenseQuery } from "@tanstack/react-query"

import { type GlobalInfo, globalInfoQuery } from "@api/queries/GlobalInfo"
import { LoadableComponent } from "@lib/Loadable"
import { LoadingMarketsListItem, MarketsListItem } from "./Item"
import { useMemo } from "react"

const MarketsList = () => {
  return (
    <LoadableComponent
      useDeps={() => useSuspenseQuery(globalInfoQuery).data}
      renderContent={(globalInfo) => (
        <MarketsListContent globalInfo={globalInfo} />
      )}
      loadingFallback={<MarketsListPlaceholder />}
    />
  )
}

const MarketsListContent = (props: { globalInfo: GlobalInfo }) => {
  const { globalInfo } = props
  const marketIds = useMemo(() => {
    return [...Array(globalInfo.latestMarketId).keys()].map((i) => `${i + 1}`)
  }, [globalInfo.latestMarketId])

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
          xl: "1fr 1fr 1fr",
        },
      }}
    >
      {marketIds.map((marketId) => (
        <MarketsListItem key={marketId} marketId={marketId} />
      ))}
    </Box>
  )
}

const MarketsListPlaceholder = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr",
        },
      }}
    >
      {[0, 1, 2].map((index) => (
        <LoadingMarketsListItem key={index} />
      ))}
    </Box>
  )
}

export { MarketsList }
