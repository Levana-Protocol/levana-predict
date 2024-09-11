import { Box, Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { StyleProps } from '@utils/styles'
import { formatDate } from '@utils/time'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'

const MarketDescription = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketDescriptionContent market={market} />}
      placeholderContent={<MarketDescriptionPlaceholder />}
      sx={props.sx}
    />
  )
}

const MarketDescriptionContent = (props: { market: Market }) => {
  const { market } = props

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      <Typography level="body-md">
        {market.description}
      </Typography>

      <Typography level="body-sm" sx={{ mt: 4 }}>
        Expected resolution date: {formatDate(new Date())}.
      </Typography>
      <Typography level="body-sm" sx={{ mt: 1 }}>
        Deposits are valid until: {formatDate(market.depositStopDate.toDate()) /* TODO: use real date, if any */}.
      </Typography>
    </>
  )
}

const MarketDescriptionPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      <Box
        width={theme => theme.spacing(1)}
        height={theme => theme.spacing(10)}
      />

      <Typography level="body-sm" sx={{ mt: 4 }}>
        Expected resolution date: {formatDate(new Date())}.
      </Typography>
      <Typography level="body-sm" sx={{ mt: 1 }}>
        Deposits are valid until: {formatDate(new Date())}.
      </Typography>
    </>
  )
}

export { MarketDescription }
