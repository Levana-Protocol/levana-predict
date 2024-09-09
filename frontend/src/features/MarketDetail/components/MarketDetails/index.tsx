import { Box, Stack, Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { StyleProps } from '@utils/styles'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'
import { getPercentage } from '@utils/number'
import BigNumber from 'bignumber.js'

const MarketDetails = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketDetailsContent market={market} />}
      placeholderContent={<MarketDetailsPlaceholder />}
      sx={props.sx}
    />
  )
}

const MarketDetailsContent = (props: { market: Market }) => {
  const { market } = props
  const marketSum = market.possibleOutcomes.reduce((sum, outcome) => sum.plus(outcome.totalTokens), BigNumber(0))

  return (
    <>
      <Typography level="h3">
        {market.title}
      </Typography>
      <Typography level="body-lg">
        {market.description}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        gap={4}
        sx={{ mt: 2 }}
      >
        {market.possibleOutcomes.map(outcome =>
          <Box key={outcome.id}>
            <Typography
              level="title-lg"
              fontWeight={600}
              color={outcome.label === "Yes" ? "success" : outcome.label === "No" ? "danger" : "neutral"}
            >
              {getPercentage(outcome.totalTokens, marketSum)}% {outcome.label}
            </Typography>
            <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
              {outcome.totalTokens.toFixed(3)} Tokens
            </Typography>
          </Box>
        )}
      </Stack>
    </>
  )
}

const MarketDetailsPlaceholder = () => {
  return (
    <>
      <Typography level="h3">
        Loading this market's title...
      </Typography>
      <Typography level="body-lg">
        Loading this market's description...
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        gap={4}
        sx={{ mt: 2 }}
      >
        {["Yes", "No"].map(outcome =>
          <Box key={outcome}>
            <Typography
              level="title-lg"
              fontWeight={600}
            >
              0.00% {outcome}
            </Typography>
            <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
              0.000000 Tokens
            </Typography>
          </Box>
        )}
      </Stack>
    </>
  )
}

export { MarketDetails }
