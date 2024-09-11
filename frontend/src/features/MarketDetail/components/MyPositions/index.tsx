import { Box, Stack, Typography } from '@mui/joy'
import { useSuspenseQuery } from '@tanstack/react-query'

import { useCurrentAccount } from '@config/chain'
import { Market } from '@api/queries/Market'
import { Positions, positionsQuery } from '@api/queries/Positions'
import { StyleProps } from '@utils/styles'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'
import { NTRN } from '@utils/tokens'

const MyPositions = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useDeps}
      renderContent={({ market, positions }) => <MyPositionsContent market={market} positions={positions} />}
      placeholderContent={<MyPositionsPlaceholder />}
      sx={props.sx}
    />
  )
}

const useDeps = () => {
  const account = useCurrentAccount()
  const market = useSuspenseCurrentMarket()
  const positions = useSuspenseQuery(positionsQuery(account.bech32Address, market.id)).data

  return { market, positions }
}

const MyPositionsContent = (props: { market: Market, positions: Positions }) => {
  const { market, positions } = props

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>My positions</Typography>
      <Stack
        direction="row"
        alignItems="center"
        gap={4}
      >
        {market.possibleOutcomes
          .filter(outcome => positions.get(outcome.id)?.gt(0))
          .map(outcome =>
            <Box key={outcome.id}>
              <Typography
                level="title-lg"
                fontWeight={600}
                color={outcome.label === "Yes" ? "success" : outcome.label === "No" ? "danger" : "neutral"}
              >
                {outcome.label}
              </Typography>
              <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
                Potential winnings: {NTRN.fromUnits(positions.get(outcome.id)?.times(market.poolSize) ?? 0).toFormat(true)}
              </Typography>
              <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
                {positions.get(outcome.id)?.toFixed(3)} Tokens
              </Typography>
            </Box>
          )
        }
      </Stack>
    </>
  )
}

const MyPositionsPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>My positions</Typography>
      <Stack
        direction="row"
        alignItems="center"
        gap={4}
      >
        {[0, 1, 2].map(index =>
          <Box key={index}>
            <Typography level="title-lg" fontWeight={600}>
              Yes
            </Typography>
            <Typography level="title-md" fontWeight={500}>
              0 Tokens
            </Typography>
            <Typography level="title-md" fontWeight={500}>
              Potential winnings: 0.000000 NTRN
            </Typography>
          </Box>
        )}
      </Stack>
    </>
  )
}

export { MyPositions }
