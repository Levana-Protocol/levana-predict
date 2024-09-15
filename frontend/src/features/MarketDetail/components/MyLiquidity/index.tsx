import { Box, Link, Stack, Typography } from "@mui/joy"
import { useSuspenseQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { type Positions, positionsQuery } from "@api/queries/Positions"
import type { StyleProps } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"

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
  const poolPortion = positions.shares.div(market.lpShares).times(100)

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        My liquidity
      </Typography>
      <Typography>
        You own {poolPortion.toFixed(3)}% of the liquidity pool.{" "}
        <Link>Learn more about liquidity pools.</Link>
      </Typography>
    </>
  )
}

const MyLiquidityPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        My positions
      </Typography>
      <Stack direction="row" alignItems="center" gap={4}>
        {[0, 1, 2].map((index) => (
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
        ))}
      </Stack>
    </>
  )
}

export { MyLiquidity }
