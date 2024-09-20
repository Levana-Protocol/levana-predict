import { Box, Stack, Typography } from "@mui/joy"
import { useSuspenseQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { type Positions, positionsQuery } from "@api/queries/Positions"
import type { StyleProps } from "@utils/styles"
import { getPotentialWinnings, getShares } from "@utils/shares"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"

const MyPositions = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useDeps}
      renderContent={({ market, positions }) => (
        <MyPositionsContent market={market} positions={positions} />
      )}
      placeholderContent={<MyPositionsPlaceholder />}
      sx={props.sx}
    />
  )
}

const useDeps = () => {
  const account = useCurrentAccount()
  const market = useSuspenseCurrentMarket()
  const positions = useSuspenseQuery(
    positionsQuery(account.bech32Address, market),
  ).data

  return { market, positions }
}

const MyPositionsContent = (props: {
  market: Market
  positions: Positions
}) => {
  const { market, positions } = props
  const outcomesWithPositions = market.possibleOutcomes.filter((outcome) =>
    positions.outcomes.get(outcome.id)?.units.gt(0),
  )

  return (
    <>
      <Typography level="title-md" fontWeight={600}>
        My positions
      </Typography>

      {outcomesWithPositions.length > 0 ? (
        <Stack direction="row" alignItems="center" gap={4} sx={{ mt: 2 }}>
          {outcomesWithPositions.map((outcome) => (
            <Box key={outcome.id}>
              <Typography
                level="title-lg"
                fontWeight={600}
                color={
                  outcome.label === "Yes"
                    ? "success"
                    : outcome.label === "No"
                      ? "danger"
                      : "neutral"
                }
              >
                {outcome.label}
              </Typography>
              <Typography
                level="title-md"
                textColor="text.secondary"
                fontWeight={600}
              >
                {getPotentialWinnings(
                  market,
                  getShares(positions, outcome.id),
                ).toFormat(true)}
              </Typography>
              <Typography
                level="title-sm"
                fontWeight={500}
                textColor="text.secondary"
                lineHeight={1}
              >
                potential winnings
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          level="body-md"
          textColor="text.tertiary"
          fontWeight={600}
          sx={{ mt: 0.5 }}
        >
          -
        </Typography>
      )}
    </>
  )
}

const MyPositionsPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600}>
        My positions
      </Typography>
      <Stack direction="row" alignItems="center" gap={4} sx={{ mt: 2 }}>
        {[0, 1, 2].map((index) => (
          <Box key={index}>
            <Typography level="title-lg" fontWeight={600}>
              Yes
            </Typography>
            <Typography level="title-md" fontWeight={600}>
              0.000000 NTRN
            </Typography>
            <Typography level="title-sm" fontWeight={500} lineHeight={1}>
              potential winnings
            </Typography>
          </Box>
        ))}
      </Stack>
    </>
  )
}

export { MyPositions }
