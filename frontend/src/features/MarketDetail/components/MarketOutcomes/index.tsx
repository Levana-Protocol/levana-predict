import { Box, Stack, Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { StyleProps } from '@utils/styles'
import { Tokens } from '@utils/tokens'
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
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Outcomes
      </Typography>
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
              {outcome.label} - {outcome.price.toFormat(3)}
            </Typography>
            <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
              {outcome.percentage.toFixed(1)}%
            </Typography>
            <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
              {outcome.totalTokens.toFixed(3)} tokens bet
            </Typography>
          </Box>
        )}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography level="body-md" textColor="text.secondary" fontWeight={600}>
          Prize pool size: {Tokens.fromUnits(market.denom, market.poolSize).toFormat(true)}
        </Typography>
      </Box>
    </>
  )
}

const MarketOutcomesPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Outcomes
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
              {outcome} - 0.000
            </Typography>
            <Typography level="title-md" fontWeight={500}>
              0.0%
            </Typography>
            <Typography level="title-md" fontWeight={500}>
              0.000 tokens bet
            </Typography>
          </Box>
        )}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography level="body-md" fontWeight={600}>
          Prize pool size: 0.000000 NTRN
        </Typography>
      </Box>
    </>
  )
}

export { MarketOutcomes }
