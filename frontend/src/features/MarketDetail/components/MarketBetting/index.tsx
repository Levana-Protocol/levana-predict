import { useAccount } from 'graz'
import { Button, Stack, Typography } from '@mui/joy'
import { FormProvider } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'

import { useCurrentAccount } from '@config/chain'
import { ntrnBalanceQuery } from '@api/queries/NtrnBalance'
import { ntrnPriceQuery } from '@api/queries/NtrnPrice'
import { Market } from '@api/queries/Market'
import { StyleProps, mergeSx } from '@utils/styles'
import { LoadableWidget } from '@lib/Loadable/Widget'
import { ConnectButton } from '@common/ConnectButton'
import { useSuspenseCurrentMarket } from '@features/MarketDetail/utils'
import { useMarketBettingForm } from './form'
import { NtrnAmountField } from './NtrnAmountField'
import { OutcomeField } from './OutcomeField'

const MarketBetting = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketBettingContent market={market} />}
      placeholderContent={<MarketBettingPlaceholder />}
      sx={mergeSx({ p: 1.5 }, props.sx)}
    />
  )
}

const MarketBettingContent = (props: { market: Market }) => {
  const { market } = props
  const { isConnected } = useAccount()

  return (
    isConnected
      ? <MarketBettingForm market={market} />
      : <MarketBettingDisconnected />
  )
}

const MarketBettingForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const balance = useQuery(ntrnBalanceQuery(account.bech32Address))
  const price = useQuery(ntrnPriceQuery)

  const { form, canSubmit, onSubmit } = useMarketBettingForm(market.id)

  return (
    <FormProvider {...form}>
      <Stack
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        direction="column"
        rowGap={1.5}
      >
        <OutcomeField
          name="betOutcome"
          market={market}
        />
        <NtrnAmountField
          name="betAmount"
          ntrnBalance={balance.data}
          ntrnPrice={price.data?.price}
        />
        <Button
          aria-label="Place bet"
          type="submit"
          disabled={!canSubmit}
          fullWidth
        >
          {form.formState.isSubmitting ? "Placing bet..." : "Place bet"}
        </Button>
      </Stack>
    </FormProvider>
  )
}

const MarketBettingDisconnected = () => {
  return (
    <>
      <Typography level="body-md">
        Connect your wallet to place a bet.
      </Typography>
      <ConnectButton sx={{borderRadius: "sm"}} fullWidth />
    </>
  )
}

const MarketBettingPlaceholder = () => {
  return (
    <>
      <Typography level="h3">
        Loading this market's betting...
      </Typography>
      <Typography level="body-lg">
        Loading this market's betting...
      </Typography>
    </>
  )
}

export { MarketBetting }
