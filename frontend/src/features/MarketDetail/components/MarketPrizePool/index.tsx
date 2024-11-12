import { Chip, type ChipProps } from "@mui/joy"

import type { Market } from "@api/queries/Market"
import { mergeSx } from "@utils/styles"

interface MarketPrizePoolProps extends ChipProps {
  market: Market
}

const MarketPrizePool = (props: MarketPrizePoolProps) => {
  const { market, sx, ...chipProps } = props
  return (
    <Chip
      variant="solid"
      color="neutral"
      {...chipProps}
      sx={mergeSx(
        { background: "linear-gradient(90deg, #894DBD -1.61%, #5654BD 100%)" },
        sx,
      )}
    >
      Prize Pool: {market.poolSize.toFormat(true)}
    </Chip>
  )
}

export { MarketPrizePool, type MarketPrizePoolProps }
