import { Box, Link, Stack, Typography } from "@mui/joy"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link as RouterLink } from "react-router-dom"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { type Positions, positionsQuery } from "@api/queries/Positions"
import type { StyleProps } from "@utils/styles"
import { getPotentialWinnings } from "@utils/shares"
import { pluralize } from "@utils/string"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"

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
    positionsQuery(account.bech32Address, market),
  ).data

  return { market, positions }
}

const MyLiquidityContent = (props: {
  market: Market
  positions: Positions
}) => {
  const { market, positions } = props
  const poolPortion = positions.shares.units.div(market.lpShares)

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        My liquidity
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
              fontWeight={600}
            >
              {getPotentialWinnings(
                market,
                outcome.poolShares.times(poolPortion),
              ).toFormat(true)}
            </Typography>
            <Typography
              level="title-sm"
              fontWeight={500}
              textColor="text.secondary"
              lineHeight={1}
            >
              potential pool winnings
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography level="body-sm" textColor="text.secondary">
          You own{" "}
          <Typography fontWeight={600}>
            {poolPortion.times(100).toFixed(3)}%
          </Typography>{" "}
          of the liquidity pool.
        </Typography>
        <Typography level="body-sm" textColor="text.secondary">
          {pluralize("liquidity provider", market.lpWallets, true)}.
        </Typography>
        <Typography level="body-sm">
          The potential winnings from the pool will change over time as further
          prediction activity occurs.{" "}
        </Typography>
        <Link
          textColor="text.tertiary"
          sx={{ textDecoration: "underline" }}
          fontSize="sm"
          component={RouterLink}
          to={LIQUIDITY_POOLS_URL}
          title="Liquidity pools article"
          aria-label="View article about liquidity pools"
          target="_blank"
          rel="noreferrer"
        >
          Learn more about liquidity pools.
        </Link>
      </Box>
    </>
  )
}

const MyLiquidityPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        My liquidity
      </Typography>
      <Stack direction="row" alignItems="center" gap={4}>
        {[0, 1, 2].map((index) => (
          <Box key={index}>
            <Typography level="title-lg" fontWeight={600}>
              Yes
            </Typography>
            <Typography level="title-md" fontWeight={600}>
              0.000000 NTRN
            </Typography>
            <Typography level="title-sm" fontWeight={500} lineHeight={1}>
              potential pool winnings
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography level="body-sm">
          You own <Typography fontWeight={600}>0.000%</Typography> of the
          liquidity pool.
        </Typography>
        <Typography level="body-sm">0 liquidity providers.</Typography>
        <Typography level="body-sm">
          The potential winnings from the pool will change over time as further
          prediction activity occurs.{" "}
        </Typography>
        <Link sx={{ textDecoration: "underline" }} fontSize="sm" disabled>
          Learn more about liquidity pools.
        </Link>
      </Box>
    </>
  )
}

export { MyLiquidity }
