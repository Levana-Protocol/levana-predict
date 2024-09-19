import { Box, Stack, Typography } from "@mui/joy"

import type { Market } from "@api/queries/Market"
import type { StyleProps } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"

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
              {outcome.label} - {outcome.price.toFormat(true)}
            </Typography>
            <Typography
              level="title-md"
              textColor="text.secondary"
              fontWeight={500}
            >
              {outcome.percentage.toFixed(1)}%
            </Typography>
            <Typography
              level="title-md"
              textColor="text.secondary"
              fontWeight={500}
            >
              {outcome.wallets} {outcome.wallets === 1 ? "holder" : "holders"}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography level="body-md" textColor="text.secondary" fontWeight={600}>
          Prize pool size: {market.poolSize.toFormat(true)}
        </Typography>
        <Typography level="body-md" textColor="text.secondary">
          {market.totalWallets}{" "}
          {market.totalWallets === 1 ? "participant" : "participant"}
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
      <Stack direction="row" alignItems="center" gap={4} sx={{ mt: 2 }}>
        {["Yes", "No"].map((outcome) => (
          <Box key={outcome}>
            <Typography level="title-lg" fontWeight={600}>
              {outcome} - 0.000
            </Typography>
            <Typography level="title-md" fontWeight={500}>
              0.0%
            </Typography>
          </Box>
        ))}
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
