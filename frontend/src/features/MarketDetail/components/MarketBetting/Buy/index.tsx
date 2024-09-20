import { Button, Stack, Typography } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market, OutcomeId } from "@api/queries/Market"
import { balancesQuery } from "@api/queries/Balances"
import { coinPricesQuery } from "@api/queries/Prices"
import { getPurchaseResult } from "@utils/shares"
import { useLatestFormValues } from "@utils/forms"
import { Coins, USD } from "@utils/coins"
import { useMarketBuyForm } from "./form"
import { OutcomeField } from "../OutcomeField"
import { CoinsAmountField } from "../CoinsAmountField"

const MarketBuyForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const balances = useQuery(balancesQuery(account.bech32Address))
  const price = useQuery(coinPricesQuery).data?.get(market.denom)

  const { form, canSubmit, onSubmit } = useMarketBuyForm(market)
  const formValues = useLatestFormValues(form)

  const coinsAmount =
    price && formValues.betAmount.value
      ? formValues.betAmount.toggled
        ? new USD(formValues.betAmount.value).toCoins(market.denom, price)
        : Coins.fromValue(market.denom, formValues.betAmount.value)
      : undefined

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
          price={price}
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

        <ShowSharesPurchased
          market={market}
          betOutcome={formValues.betOutcome ?? undefined}
          coinsAmount={coinsAmount}
        />
      </Stack>
    </FormProvider>
  )
}

interface ShowSharesPurchasedProps {
  market: Market
  betOutcome: OutcomeId | undefined
  coinsAmount: Coins | undefined
}

const ShowSharesPurchased = (props: ShowSharesPurchasedProps) => {
  const { market, betOutcome, coinsAmount } = props
  const purchaseResult =
    betOutcome !== undefined && coinsAmount !== undefined
      ? getPurchaseResult(market, betOutcome, coinsAmount)
      : undefined

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Estimated shares</Typography>
        <Typography level="body-sm">
          {purchaseResult?.shares.toFormat(false) ?? "-"}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Liquidity deposit</Typography>
        <Typography level="body-sm">
          {purchaseResult?.liquidity.toFormat(true) ?? "-"}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Fees</Typography>
        <Typography level="body-sm">
          {purchaseResult?.liquidity.toFormat(true) ?? "-"}
        </Typography>
      </Stack>
    </>
  )
}

export { MarketBuyForm }
