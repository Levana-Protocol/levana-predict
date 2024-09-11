import { Button, Stack } from '@mui/joy'
import { FormProvider } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'

import { useCurrentAccount } from '@config/chain'
import { Market } from '@api/queries/Market'
import { ntrnBalanceQuery } from '@api/queries/NtrnBalance'
import { ntrnPriceQuery } from '@api/queries/NtrnPrice'
import { OutcomeField } from '../OutcomeField'
import { NtrnAmountField } from '../NtrnAmountField'
import { useMarketBuyForm } from './form'

const MarketBuyForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const balance = useQuery(ntrnBalanceQuery(account.bech32Address))
  const price = useQuery(ntrnPriceQuery)

  const { form, canSubmit, onSubmit } = useMarketBuyForm(market)

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
          size="lg"
          disabled={!canSubmit}
          fullWidth
        >
          {form.formState.isSubmitting ? "Placing bet..." : "Place bet"}
        </Button>
      </Stack>
    </FormProvider>
  )
}

export { MarketBuyForm }
