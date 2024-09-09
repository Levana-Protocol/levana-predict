import { useAccount } from 'graz'
import { Box } from '@mui/joy'

import { buildGridAreas } from '@utils/styles'
import { BasePage } from '@common/BasePage'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'
import { MarketDetails } from '@features/MarketDetail/components/MarketDetails'
import { MyPositions } from '@features/MarketDetail/components/MyPositions'
import { MarketBetting } from '@features/MarketDetail/components/MarketBetting'

const MarketPage = () => {
  useSuspenseCurrentMarket()
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
              "positions",
              "betting",
            ]),
            md: buildGridAreas([
              "title betting",
              "positions betting",
              "rest betting",
            ]),
          },
        }}
      >
        <MarketDetails sx={{ gridArea: "title" }} />
        {account.isConnected &&
          <MyPositions sx={{ gridArea: "positions" }} />
        }
        <MarketBetting sx={{ gridArea: "betting", maxWidth: { md: 400 }, height: "max-content" }} />
      </Box>
    </BasePage>
  )
}

export { MarketPage }
