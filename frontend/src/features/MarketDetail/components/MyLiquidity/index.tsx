import { Box, Link, Stack, Typography } from "@mui/joy"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link as RouterLink } from "react-router-dom"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { type Positions, positionsQuery } from "@api/queries/Positions"
import type { StyleProps } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"
import { getPotentialWinnings } from "@utils/shares"

const LIQUIDITY_POOLS_URL =
  "https://levana-prediction.zendesk.com/hc/en-us/articles/29284778150555-Liquidity-pools-in-Levana-Predict"

const MyLiquidity = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useDeps}
      renderContent={({ market, positions }) => (
        <MyLiquidityContent market={market} positions={positions} />
      )}
      placeholderContent={<MyLiquidityPlaceholder />}
      sx={props.sx}
    />
  )
}

const useDeps = () => {
  const account = useCurrentAccount()
  const market = useSuspenseCurrentMarket()
  const positions = useSuspenseQuery(
    positionsQuery(account.bech32Address, market.id),
  ).data

  return { market, positions }
}

const MyLiquidityContent = (props: {
  market: Market
  positions: Positions
}) => {
  const { market, positions } = props
  const poolPortion = positions.shares.value.div(market.lpShares)

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        My liquidity
      </Typography>
      <Typography>
        You own {poolPortion.times(100).toFixed(3)}% of the liquidity pool.
      </Typography>
      <Stack direction="row" alignItems="center" gap={4}>
        {market.possibleOutcomes.map((outcome) => (
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
              fontWeight={500}
            >
              Potential winnings:{" "}
              {getPotentialWinnings(
                market,
                outcome.poolShares.times(poolPortion),
              ).toFormat(true)}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Typography style={{ margin: "2em 0 0 0", fontStyle: "italic" }}>
        The potential winnings from the pool will change over time as further
        prediction activity occurs.{" "}
      </Typography>
      <Typography>
        <Link
          component={RouterLink}
          to={LIQUIDITY_POOLS_URL}
          title="Liquidity pools article"
          aria-label="View article about liquidity pools"
          target="_blank"
          rel="noreferrer"
        >
          Learn more about liquidity pools.
        </Link>
      </Typography>
    </>
  )
}

const MyLiquidityPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        My liquidity
      </Typography>
      <Typography>
        You own 0.000% of the liquidity pool.{" "}
        <Link disabled>Learn more about liquidity pools.</Link>
      </Typography>
    </>
  )
}

export { MyLiquidity }
