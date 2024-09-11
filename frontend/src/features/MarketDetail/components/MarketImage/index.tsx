import { Box, BoxProps } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { mergeSx } from '@utils/styles'

interface MarketImageProps extends Omit<BoxProps, "children"> {
  market: Market,
}

const MarketImage = (props: MarketImageProps) => {
  const { market, ...boxProps } = props

  return (
    <Box
      component="img"
      src={market.image}
      alt="Market logo"
      {...boxProps}
      sx={mergeSx(
        {
          borderRadius: "50%",
          aspectRatio: 1,
          overflow: "hidden",
        },
        boxProps.sx,
      )}
    />
  )
}

export { MarketImage, type MarketImageProps }
