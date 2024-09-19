import { Box, Chip, Stack, Typography } from "@mui/joy"

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
              fontWeight={600}
            >
              {outcome.percentage.toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Chip
          variant="solid"
          color="neutral"
          sx={{
            background: "linear-gradient(90deg, #894DBD -1.61%, #5654BD 100%)",
          }}
        >
          Prize pool size: {market.poolSize.toFormat(true)}
        </Chip>
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
            <Typography level="title-md" fontWeight={600}>
              0.0%
            </Typography>
          </Box>
        ))}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Chip variant="solid">Prize pool size: 0.000000 NTRN</Chip>
      </Box>
    </>
  )
}

export { MarketOutcomes }
