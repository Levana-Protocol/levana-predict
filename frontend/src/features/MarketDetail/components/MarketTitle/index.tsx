import { Box, Chip, IconButton, Stack, Typography } from "@mui/joy"

import { CopyIcon } from "@assets/icons/Copy"
import { TickIcon } from "@assets/icons/Tick"
import { routes } from "@config/router"
import type { Market } from "@api/queries/Market"
import type { StyleProps } from "@utils/styles"
import { useCopyToClipboard } from "@utils/hooks"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"
import { MarketImage } from "../MarketImage"
import { MarketStatus } from "../MarketStatus"

const MarketTitle = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketTitleContent market={market} />}
      placeholderContent={<MarketTitlePlaceholder />}
      sx={props.sx}
    />
  )
}

const MarketTitleContent = (props: { market: Market }) => {
  const { market } = props
  const [copied, copy] = useCopyToClipboard()

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      columnGap={4}
    >
      <Stack direction="row" alignItems="center" columnGap={2}>
        <MarketImage
          market={market}
          width={(theme) => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
          minWidth={(theme) => ({
            xs: theme.spacing(8),
            sm: theme.spacing(10),
          })}
        />
        <Box>
          <Typography level="h3">{market.title}</Typography>
          <MarketStatus market={market} sx={{ mt: 1 }} />
        </Box>
      </Stack>

      <Box>
        <IconButton
          aria-label="Copy market URL to clipboard"
          size="sm"
          onClick={() => {
            copy(
              `${window.location.host}${routes.market(market.id)}`,
              "Market URL",
            )
          }}
        >
          {copied ? <TickIcon /> : <CopyIcon />}
        </IconButton>
      </Box>
    </Stack>
  )
}

const MarketTitlePlaceholder = () => {
  return (
    <Stack direction="row" alignItems="center" columnGap={2}>
      <Box
        width={(theme) => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        height={(theme) => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        minWidth={(theme) => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        minHeight={(theme) => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
      />

      <Box>
        <Typography level="h3">Loading market's title...</Typography>
        <Chip size="md" sx={{ mt: 1 }}>
          Loading market's status...
        </Chip>
      </Box>
    </Stack>
  )
}

export { MarketTitle }
