import { Box, Stack, Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { getPercentage } from '@utils/number'
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
          <Typography level="title-md" fontWeight={600}>
            {getPercentage(outcome.wallets, market.totalWallets)}% {outcome.label}
          </Typography>
          <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
            {outcome.poolTokens.toFixed(0)} {market.denom}
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
    >
      {[0, 1, 2].map(index =>
        <Box key={index}>
          <Typography level="body-md" fontWeight={600}>
            0.00% Yes
          </Typography>
          <Typography level="body-sm" fontWeight={500}>
            10000 untrn
          </Typography>
        </Box>
      )}
    </Stack>
  )
}

export { MarketOutcomes }
