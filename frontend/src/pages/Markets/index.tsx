import { Box, Button, Sheet, Typography } from '@mui/joy'
import { Link } from 'react-router-dom'

import { routes } from '@config/router'
import { useAllMarkets } from '@api/queries/Market'
import { BasePage } from '@common/BasePage'
import { PageTitle } from '@common/PageTitle'

const MarketsPage = () => {
  const markets = useAllMarkets()

  return (
    <BasePage>
      <PageTitle>Markets</PageTitle>

      <Box>
        {markets.map((market, index) =>
          market.data
            ?
              <Sheet sx={{ p: 2 }}>
                <Typography level="title-md">
                  {market.data.title}
                </Typography>
                <Typography level="body-md">
                  {market.data.description}
                </Typography>

                <Button
                  component={Link}
                  to={routes.market(market.data?.id)}
                  aria-label={`View market ${market.data}`}
                  sx={{ mt: 2 }}
                >
                  View
                </Button>
              </Sheet>
            :
              <Sheet key={index} sx={{ p: 2 }}>
                Loading market...
              </Sheet>
        )}
      </Box>
    </BasePage>
  )
}

export { MarketsPage }
