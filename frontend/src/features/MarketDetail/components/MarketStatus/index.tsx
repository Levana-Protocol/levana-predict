import { match } from 'ts-pattern'
import { Chip, ChipProps } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { useMarketStatus } from '@features/MarketDetail/utils'

interface MarketStatusProps extends Omit<ChipProps, "children"> {
  market: Market,
}

const MarketStatus = (props: MarketStatusProps) => {
  const { market, ...chipProps } = props
  const status = useMarketStatus(market)

  return (
    <Chip
      size="md"
      {...chipProps}
    >
      {match(status)
        .with({ state: "decided" }, ({ winner }) => `Winner: "${winner}"!`)
        .with({ state: "deciding" }, () => "Awaiting arbitrator decision")
        .with({ state: "deposits" }, ({ timeLeft }) => `Withdrawals ended. Deposits end in ${timeLeft}`)
        .with({ state: "withdrawals" }, ({ timeLeft }) => `Withdrawals end in ${timeLeft}`)
        .exhaustive()
      }
    </Chip>
  )
}

export { MarketStatus, type MarketStatusProps }
