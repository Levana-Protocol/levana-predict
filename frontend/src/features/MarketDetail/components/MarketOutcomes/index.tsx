import { Box, Stack, Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { StyleProps } from '@utils/styles'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'

const MarketOutcomes = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketOutcomesContent market={market} />}
      placeholderContent={<MarketOutcomesPlaceholder />}
      sx={props.sx}
    />
  )
}

const MarketOutcomesContent = (props: { market: Market }) => {
  const { market } = props

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={4}
    >
      {market.possibleOutcomes.map(outcome =>
        <Box key={outcome.id}>
          <Typography
            level="title-lg"
            fontWeight={600}
            color={outcome.label === "Yes" ? "success" : outcome.label === "No" ? "danger" : "neutral"}
          >
            {outcome.label} - {outcome.price.toFormat(true)}
          </Typography>
          <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
            {outcome.totalTokens.toFixed(3)} tokens bet
          </Typography>
        </Box>
      )}
    </Stack>
  )
}

const MarketOutcomesPlaceholder = () => {
  return (
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
            {outcome} - 0.00 USD
          </Typography>
          <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
            0.000000 tokens bet
          </Typography>
        </Box>
      )}
    </Stack>
  )
}

export { MarketOutcomes }
