import { Button, Stack, Typography } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { InfoIcon } from "@assets/icons/Info"
import { useCurrentAccount } from "@config/chain"
import type { Market, OutcomeId } from "@api/queries/Market"
import { positionsQuery } from "@api/queries/Positions"
import { useLatestFormValues } from "@utils/forms"
import { getDifferencePercentage } from "@utils/number"
import { getSaleResult, Shares, SLIPPAGE_THRESHOLD } from "@utils/shares"
import { useMarketSellForm } from "./form"
import { OutcomeField } from "../OutcomeField"
import { SharesAmountField } from "../SharesAmountField"

const MarketSellForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const positions = useQuery(positionsQuery(account.bech32Address, market))

  const { form, canSubmit, onSubmit, outcome } = useMarketSellForm(market)
  const formValues = useLatestFormValues(form)

  const sharesBalance = outcome
    ? positions.data?.outcomes.get(outcome)
    : undefined

  const sharesAmount = formValues.sellAmount
    ? Shares.fromCollateralValue(market.denom, formValues.sellAmount)
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

        <ShowSharesSold
          market={market}
          sellOutcome={formValues.sellOutcome ?? undefined}
          sharesAmount={sharesAmount}
        />
      </Stack>
    </FormProvider>
  )
}

interface ShowSharesSoldProps {
  market: Market
  sellOutcome: OutcomeId | undefined
  sharesAmount: Shares | undefined
}

const ShowSharesSold = (props: ShowSharesSoldProps) => {
  const { market, sellOutcome, sharesAmount } = props
  const saleResult =
    sellOutcome !== undefined && sharesAmount !== undefined
      ? getSaleResult(market, sellOutcome, sharesAmount)
      : undefined

  const selectedOutcome = market.possibleOutcomes.find(
    (outcome) => outcome.id === sellOutcome,
  )

  const differencePercentage =
    selectedOutcome !== undefined && saleResult !== undefined
      ? getDifferencePercentage(
          selectedOutcome.price.units,
          saleResult.price.units,
        )
      : undefined

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Estimated funds</Typography>
        <Typography level="body-sm">
          {saleResult?.funds.toFormat(true) ?? "-"}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Fees</Typography>
        <Typography level="body-sm">
          {saleResult?.fees.toFormat(true) ?? "-"}
        </Typography>
      </Stack>

      {([0, 1] as const).map((outcome) => (
        <Stack key={outcome} direction="row" justifyContent="space-between">
          <Typography level="body-sm">
            Returned "{market.possibleOutcomes[outcome].label}" shares
          </Typography>
          <Typography level="body-sm">
            {saleResult?.returned[outcome].toFormat(false) ?? "-"}
          </Typography>
        </Stack>
      ))}

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
            Warning: the effective price of this sale differs from the quoted
            price by {differencePercentage.toFixed(1)}%
          </Typography>
        )}
    </>
  )
}

export { MarketSellForm }
