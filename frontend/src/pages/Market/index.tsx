import { Box } from '@mui/joy'

import { buildGridAreas } from '@utils/styles'
import { BasePage } from '@common/BasePage'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'
import { MarketTitle } from '@features/MarketDetail/components/MarketTitle'
import { MarketOutcomes } from '@features/MarketDetail/components/MarketOutcomes'
import { MarketBetting } from '@features/MarketDetail/components/MarketBetting'

const MarketPage = () => {
  useSuspenseCurrentMarket()

  return (
    <BasePage>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            md: "2fr 1fr",
          },
          gridTemplateAreas: {
            xs: buildGridAreas([
              "title",
              "outcomes",
              "betting",
            ]),
            md: buildGridAreas([
              "title betting",
              "outcomes betting",
              "rest betting",
            ]),
          },
        }}
      >
        <MarketTitle sx={{ gridArea: "title" }} />
        <MarketOutcomes sx={{ gridArea: "outcomes" }} />
        <MarketBetting sx={{ gridArea: "betting", maxWidth: { md: 400 }, height: "max-content" }} />
      </Box>
    </BasePage>
  )
}

export { MarketPage }
