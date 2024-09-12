import { Button, Stack } from '@mui/joy'
import { FormProvider } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'

import { useCurrentAccount } from '@config/chain'
import { Market } from '@api/queries/Market'
import { balancesQuery } from '@api/queries/Balances'
import { tokenPricesQuery } from '@api/queries/Prices'
import { OutcomeField } from '../OutcomeField'
import { TokensAmountField } from '../TokensAmountField'
import { useMarketBuyForm } from './form'

const MarketBuyForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const balance = useQuery(balancesQuery(account.bech32Address))
  const price = useQuery(tokenPricesQuery)

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

        <TokensAmountField
          name="betAmount"
          denom={market.denom}
          balance={balance.data?.get(market.denom)}
          price={price.data?.get(market.denom)}
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
