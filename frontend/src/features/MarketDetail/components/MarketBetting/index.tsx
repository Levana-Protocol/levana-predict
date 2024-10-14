import { useState } from "react"
import { useAccount } from "graz"
import { P, match } from "ts-pattern"
import { Button, Sheet, Stack, Typography } from "@mui/joy"

import type { Market } from "@api/queries/Market"
import { type StyleProps, mergeSx } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { ConnectButton } from "@common/ConnectButton"
import {
  type MarketStatus,
  useMarketStatus,
  useSuspenseCurrentMarket,
} from "@features/MarketDetail/utils"
import { MarketClaimForm } from "./Claim"
import { MarketBuyForm } from "./Buy"
import { MarketSellForm } from "./Sell"
import { MarketProvideLiquidityForm } from "./ProvideLiquidity"

const MarketBetting = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketBettingContent market={market} />}
      placeholderContent={<MarketBettingPlaceholder />}
      sx={mergeSx({ p: 1.5 }, props.sx)}
    />
  )
}

const MarketBettingContent = (props: { market: Market }) => {
  const { market } = props
  const { isConnected } = useAccount()
  const marketStatus = useMarketStatus(market)

  return isConnected ? (
    match(marketStatus)
      .with({ state: "decided" }, () => <MarketClaimForm market={market} />)
      .with({ state: "deciding" }, () => <MarketBettingDeciding />)
      .otherwise((status) => (
        <MarketBettingForm market={market} status={status} />
      ))
  ) : (
    <MarketBettingDisconnected status={marketStatus} />
  )
}

const MarketBettingForm = (props: { market: Market; status: MarketStatus }) => {
  const { market, status } = props
  const [action, setAction] = useState<"buy" | "sell" | "liquidity">("buy")

  return (
    <>
      <Stack direction="row" columnGap={2} sx={{ mb: 2 }}>
        <Button
          color="neutral"
          variant="plain"
          size="lg"
          sx={{
            px: 2,
            py: 1,
            width: "max-content",
            borderRadius: 0,
            borderBottom: action === "buy" ? "2px solid white" : undefined,
          }}
          onClick={() => {
            setAction("buy")
          }}
        >
          Buy
        </Button>

        <Button
          color="neutral"
          variant="plain"
          size="lg"
          sx={{
            px: 2,
            py: 1,
            width: "max-content",
            borderRadius: 0,
            borderBottom: action === "sell" ? "2px solid white" : undefined,
          }}
          onClick={() => {
            setAction("sell")
          }}
          disabled={status.state !== "withdrawals"}
        >
          Sell
        </Button>

        <Button
          color="neutral"
          variant="plain"
          size="lg"
          sx={{
            px: 2,
            py: 1,
            width: "max-content",
            borderRadius: 0,
            borderBottom: action === "sell" ? "2px solid white" : undefined,
          }}
          onClick={() => {
            setAction("liquidity")
          }}
        >
          Liquidity
        </Button>
      </Stack>

      {match(action)
        .with("buy", () => <MarketBuyForm market={market} />)
        .with("sell", () => <MarketSellForm market={market} />)
        .with("liquidity", () => <MarketProvideLiquidityForm market={market} />)
        .exhaustive()}
    </>
  )
}

const MarketBettingDeciding = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Resolution
      </Typography>
      <Sheet sx={{ p: 1 }}>
        <Typography level="body-md">
          This market is awaiting a decision by the arbitrator, and its outcome
          hasn't been decided yet.
        </Typography>
      </Sheet>
    </>
  )
}

const MarketBettingDisconnected = (props: { status: MarketStatus }) => {
  const { status } = props

  return (
    <>
      <Typography level="body-md" sx={{ mb: 0.75 }}>
        {match(status.state)
          .with(
            P.union("decided", "deciding"),
            () => "Connect your wallet to view your earnings.",
          )
          .with(
            P.union("withdrawals", "deposits"),
            () => "Connect your wallet to make a bet.",
          )
          .exhaustive()}
      </Typography>
      <ConnectButton sx={{ borderRadius: "sm" }} fullWidth />
    </>
  )
}

const MarketBettingPlaceholder = () => {
  // TODO: better placeholder
  return (
    <>
      <Typography level="h3">Loading this market's betting...</Typography>
      <Typography level="body-lg">Loading this market's betting...</Typography>
    </>
  )
}

export { MarketBetting }
