import { Button, Stack } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { positionsQuery } from "@api/queries/Positions"
import { useMarketSellForm } from "./form"
import { OutcomeField } from "../OutcomeField"
import { SharesAmountField } from "../SharesAmountField"

const MarketSellForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const positions = useQuery(positionsQuery(account.bech32Address, market))

  const { form, canSubmit, onSubmit, outcome } = useMarketSellForm(market)
  const sharesBalance = outcome
    ? positions.data?.outcomes.get(outcome)
    : undefined

  return (
    <FormProvider {...form}>
      <Stack
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        direction="column"
        rowGap={1.5}
      >
        <OutcomeField name="sellOutcome" market={market} />

        <SharesAmountField name="sellAmount" balance={sharesBalance} />

        <Button
          aria-label="Cancel bet"
          type="submit"
          size="lg"
          disabled={!canSubmit}
          fullWidth
        >
          {form.formState.isSubmitting ? "Cancelling bet..." : "Cancel bet"}
        </Button>
      </Stack>
    </FormProvider>
  )
}

export { MarketSellForm }
