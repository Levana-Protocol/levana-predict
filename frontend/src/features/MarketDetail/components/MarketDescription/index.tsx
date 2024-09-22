import { Box, Typography } from "@mui/joy"

import type { Market } from "@api/queries/Market"
import type { StyleProps } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"

const MarketDescription = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketDescriptionContent market={market} />}
      placeholderContent={<MarketDescriptionPlaceholder />}
      sx={props.sx}
    />
  )
}

const MarketDescriptionContent = (props: { market: Market }) => {
  const { market } = props

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      <Typography level="body-md" whiteSpace="pre-line">
        {market.description}
      </Typography>
    </>
  )
}

const MarketDescriptionPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      <Box
        width={(theme) => theme.spacing(1)}
        height={(theme) => theme.spacing(10)}
      />
    </>
  )
}

export { MarketDescription }
