import { useAccount } from "graz"
import { Box } from "@mui/joy"

import { buildGridAreas } from "@utils/styles"
import { BasePage } from "@common/BasePage"
import { MarketTitle } from "@features/MarketDetail/components/MarketTitle"
import { MyPositions } from "@features/MarketDetail/components/MyPositions"
import { MyLiquidity } from "@features/MarketDetail/components/MyLiquidity"
import { MarketBetting } from "@features/MarketDetail/components/MarketBetting"
import { MarketOutcomes } from "@features/MarketDetail/components/MarketOutcomes"
import { MarketDescription } from "@features/MarketDetail/components/MarketDescription"

const MarketPage = () => {
  const account = useAccount()

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
              "positions",
              "liquidity",
              "description",
              "betting",
            ]),
            md: buildGridAreas([
              "title betting",
              "outcomes betting",
              "positions betting",
              "liquidity betting",
              "description betting",
              "rest betting",
            ]),
          },
        }}
      >
        <MarketTitle sx={{ gridArea: "title" }} />
        <MarketOutcomes sx={{ gridArea: "outcomes" }} />
        {account.isConnected && (
          <>
            <MyPositions sx={{ gridArea: "positions" }} />
            <MyLiquidity sx={{ gridArea: "liquidity" }} />
          </>
        )}
        <MarketDescription sx={{ gridArea: "description" }} />
        <MarketBetting
          sx={{
            gridArea: "betting",
            maxWidth: { md: 400 },
            height: "max-content",
          }}
        />
      </Box>
    </BasePage>
  )
}

export { MarketPage }
