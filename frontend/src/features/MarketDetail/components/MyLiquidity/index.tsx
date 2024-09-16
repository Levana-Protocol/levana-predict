import { Link, Typography } from "@mui/joy"
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
  const poolPortion = positions.shares.value.div(market.lpShares).times(100)

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
