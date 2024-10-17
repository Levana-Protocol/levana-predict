import { Button, Stack, Typography } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { InfoIcon } from "@assets/icons/Info"
import { useCurrentAccount } from "@config/chain"
import type { Market, OutcomeId } from "@api/queries/Market"
import { balancesQuery } from "@api/queries/Balances"
import { coinPricesQuery } from "@api/queries/Prices"
import { Coins, USD } from "@utils/coins"
import { useLatestFormValues } from "@utils/forms"
import { getDifferencePercentage } from "@utils/number"
import { getPurchaseResult, SLIPPAGE_THRESHOLD } from "@utils/shares"
import { useMarketBuyForm } from "./form"
import { OutcomeField } from "../OutcomeField"
import { CoinsAmountField } from "../CoinsAmountField"

interface MarketBuyFormProps {
  market: Market
  isActive: boolean
}

const MarketBuyForm = (props: MarketBuyFormProps) => {
  const { market, isActive } = props
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
    isActive && (
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

  const selectedOutcome = market.possibleOutcomes.find(
    (outcome) => outcome.id === betOutcome,
  )

  const differencePercentage =
    selectedOutcome !== undefined && purchaseResult !== undefined
      ? getDifferencePercentage(
          selectedOutcome.price.units,
          purchaseResult.price.units,
        )
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
          {purchaseResult?.fees.toFormat(true) ?? "-"}
        </Typography>
      </Stack>

      {differencePercentage !== undefined &&
        differencePercentage > SLIPPAGE_THRESHOLD && (
          <Typography
            level="title-sm"
            color="warning"
            startDecorator={
              <InfoIcon
                sx={{
                  "--Icon-fontSize": "1rem",
                  borderRadius: "calc(var(--Icon-fontSize) / 2)",
                  p: 0.5,
                  backgroundColor: (theme) => theme.palette.warning[900],
                }}
              />
            }
          >
            Warning: the effective price of this purchase differs from the
            quoted price by {differencePercentage.toFixed(1)}%
          </Typography>
        )}
    </>
  )
}

export { MarketBuyForm }
