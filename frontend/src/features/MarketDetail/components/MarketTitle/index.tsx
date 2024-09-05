import { Typography } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { StyleProps } from '@utils/styles'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'

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

  return (
    <>
      <Typography level="h3">
        {market.title}
      </Typography>
      <Typography level="body-lg">
        {market.description}
      </Typography>
    </>
  )
}

const MarketTitlePlaceholder = () => {
  return (
    <>
      <Typography level="h3">
        Loading this market's title...
      </Typography>
      <Typography level="body-lg">
        Loading this market's description...
      </Typography>
    </>
  )
}

export { MarketTitle }
