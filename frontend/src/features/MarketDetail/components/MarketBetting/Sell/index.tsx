import { Button, Stack } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import { Market } from "@api/queries/Market"
import { positionsQuery } from "@api/queries/Positions"
import { useMarketSellForm } from "./form"
import { OutcomeField } from "../OutcomeField"
import { BetTokensField } from "../BetTokensField"

const MarketSellForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const positions = useQuery(positionsQuery(account.bech32Address, market.id))

  const { form, canSubmit, onSubmit, outcome } = useMarketSellForm(market)
  const tokensBalance = outcome
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

        <BetTokensField name="sellAmount" tokensBalance={tokensBalance} />

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
