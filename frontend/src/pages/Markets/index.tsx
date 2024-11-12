import { Typography } from "@mui/joy"

import { BasePage } from "@common/BasePage"
import { MarketsList } from "@features/AllMarkets/components/MarketsList"

const MarketsPage = () => {
  return (
    <BasePage>
      <Typography level="h3">Markets</Typography>
      <MarketsList />
    </BasePage>
  )
}

export { MarketsPage }
