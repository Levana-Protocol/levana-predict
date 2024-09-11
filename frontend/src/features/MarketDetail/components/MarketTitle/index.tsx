import { Box, IconButton, Stack, Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { StyleProps } from '@utils/styles'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'
import { MarketImage } from '../MarketImage'
import { CopyIcon } from '@assets/icons/Copy'
import { useCopyToClipboard } from '@utils/hooks'
import { TickIcon } from '@assets/icons/Tick'
import { routes } from '@config/router'

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
    <Stack direction="row" justifyContent="space-between" columnGap={4}>
      <Stack direction="row" alignItems="center" columnGap={2}>
        <MarketImage
          market={market}
          width={theme => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
          minWidth={theme => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        />
        <Box>
          <Typography level="h3">
            {market.title}
          </Typography>
        </Box>
      </Stack>

      <Box>
        <IconButton
          aria-label="Copy market URL to clipboard"
          onClick={() => { copy(routes.market(market.id), "Market URL") }}
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
        width={theme => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        height={theme => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        minWidth={theme => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
        minHeight={theme => ({ xs: theme.spacing(8), sm: theme.spacing(10) })}
      />

      <Box>
        <Typography level="h3">
          Loading market's title...
        </Typography>
      </Box>
    </Stack>
  )
}

export { MarketTitle }
