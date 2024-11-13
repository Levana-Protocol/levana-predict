import { Box, Chip, Skeleton, Stack, Typography } from "@mui/joy"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { routes } from "@config/router"
import { type Market, marketQuery, type MarketId } from "@api/queries/Market"
import { MarketImage } from "@features/MarketDetail/components/MarketImage"
import { MarketStatus } from "@features/MarketDetail/components/MarketStatus"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { Fragment } from "react/jsx-runtime"

interface MarketsListItemProps {
  marketId: MarketId
}

const MarketsListItem = (props: MarketsListItemProps) => {
  const { marketId } = props

  return (
    <Box
      component={Link}
      to={routes.market(marketId)}
      aria-label={`View market ${marketId}`}
      sx={{ textDecoration: "none" }}
    >
      <LoadableWidget
        useDeps={() => useSuspenseQuery(marketQuery(marketId)).data}
        renderContent={(market) => <MarketsListItemContent market={market} />}
        placeholderContent={<MarketsListItemPlaceholder />}
      />
    </Box>
  )
}

const MarketsListItemContent = (props: { market: Market }) => {
  const { market } = props

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      sx={{ height: "100%" }}
    >
      <Stack direction="row" alignItems="center" columnGap={2}>
        <MarketImage
          market={market}
          width={(theme) => theme.spacing(6)}
          minWidth={(theme) => theme.spacing(6)}
        />
        <Box>
          <Typography level="title-lg" fontWeight={600}>
            {market.title}
          </Typography>
          <MarketStatus market={market} sx={{ mt: 0.5 }} size="sm" />
        </Box>
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent={{ sm: "space-between" }}
        spacing={{ xs: 1, sm: 2 }}
        sx={{ mt: 2 }}
      >
        <Stack direction="row" spacing={1}>
          {market.possibleOutcomes.map((outcome, index) => (
            <Fragment key={outcome.id}>
              {index > 0 && <Typography level="body-xs">|</Typography>}
              <Box>
                <Typography level="body-sm" fontWeight={500}>
                  {outcome.label} {outcome.percentage.toFixed(1)}%
                </Typography>
              </Box>
            </Fragment>
          ))}
        </Stack>
        <Typography
          level="body-sm"
          fontWeight={600}
          sx={{
            backgroundImage:
              "linear-gradient(90deg, #A96DDD -1.61%, #C98DFD 100%)",
            color: "transparent",
            backgroundClip: "text",
          }}
        >
          Prize Pool: {market.poolSize.toFormat(true)}
        </Typography>
      </Stack>
    </Stack>
  )
}

const MarketsListItemPlaceholder = () => {
  return (
    <>
      <Stack direction="row" alignItems="center" columnGap={2}>
        <Box
          sx={{
            width: (theme) => theme.spacing(6),
            minWidth: (theme) => theme.spacing(6),
            aspectRatio: 1,
          }}
        />
        <Box>
          <Typography level="title-lg" fontWeight={600}>
            Loading market...
          </Typography>
          <Chip size="md" sx={{ mt: 0.5 }}>
            Loading status...
          </Chip>
        </Box>
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent={{ sm: "space-between" }}
        spacing={{ xs: 1, sm: 2 }}
        sx={{ mt: 2 }}
      >
        <Stack direction="row" spacing={1}>
          <Box>
            <Typography level="body-sm" fontWeight={500}>
              Yes 50.0%
            </Typography>
          </Box>
          <Typography level="body-xs">|</Typography>
          <Box>
            <Typography level="body-sm" fontWeight={500}>
              No 50.0%
            </Typography>
          </Box>
        </Stack>
        <Typography level="body-sm" fontWeight={600}>
          Prize Pool: 0.000000 NTRN
        </Typography>
      </Stack>
    </>
  )
}

const LoadingMarketsListItem = () => {
  return (
    <Skeleton variant="rectangular" sx={{ p: 3, height: "100%" }}>
      <MarketsListItemPlaceholder />
    </Skeleton>
  )
}

export { MarketsListItem, type MarketsListItemProps, LoadingMarketsListItem }
