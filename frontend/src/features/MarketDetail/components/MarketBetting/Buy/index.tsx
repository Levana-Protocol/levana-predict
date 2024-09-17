import { Button, Stack } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { balancesQuery } from "@api/queries/Balances"
import { coinPricesQuery } from "@api/queries/Prices"
import { OutcomeField } from "../OutcomeField"
import { CoinsAmountField } from "../CoinsAmountField"
import { useMarketBuyForm } from "./form"

const MarketBuyForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const balances = useQuery(balancesQuery(account.bech32Address))
  const prices = useQuery(coinPricesQuery)

  const { form, canSubmit, onSubmit } = useMarketBuyForm(market)

  return (
    <FormProvider {...form}>
      <Stack
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        direction="column"
        rowGap={1.5}
      >
        <OutcomeField name="betOutcome" market={market} />

        <CoinsAmountField
          name="betAmount"
          denom={market.denom}
          balance={balances.data?.get(market.denom)}
          price={prices.data?.get(market.denom)}
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
