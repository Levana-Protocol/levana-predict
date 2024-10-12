import { Button, Stack, Typography } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market, OutcomeId } from "@api/queries/Market"
import { balancesQuery } from "@api/queries/Balances"
import { coinPricesQuery } from "@api/queries/Prices"
import { LIQUIDITY_PORTION } from "@api/mutations/BuyLiquidity"
import { Coins, USD } from "@utils/coins"
import { useLatestFormValues } from "@utils/forms"
import { getPurchaseResult } from "@utils/shares"
import { useBuyLiquidityForm } from "./form"
import { OutcomeField } from "../OutcomeField"
import { CoinsAmountField } from "../CoinsAmountField"

const MarketBuyLiquidityForm = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()
  const balances = useQuery(balancesQuery(account.bech32Address))
  const price = useQuery(coinPricesQuery).data?.get(market.denom)

  const { form, canSubmit, onSubmit } = useBuyLiquidityForm(market)
  const formValues = useLatestFormValues(form)

  const coinsAmount =
    price && formValues.liquidityAmount.value
      ? formValues.liquidityAmount.toggled
        ? new USD(formValues.liquidityAmount.value).toCoins(market.denom, price)
        : Coins.fromValue(market.denom, formValues.liquidityAmount.value)
      : undefined

  return (
    <FormProvider {...form}>
      <Stack
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        direction="column"
        rowGap={1.5}
      >
        <OutcomeField name="liquidityOutcome" market={market} />

        <CoinsAmountField
          name="liquidityAmount"
          denom={market.denom}
          balance={balances.data?.get(market.denom)}
          price={price}
        />

        <Button
          aria-label="Buy liquidity"
          type="submit"
          size="lg"
          disabled={!canSubmit}
          fullWidth
        >
          {form.formState.isSubmitting
            ? "Buying liquidity..."
            : "Buy liquidity"}
        </Button>

        <ShowLiquidityPurchased
          market={market}
          betOutcome={formValues.liquidityOutcome ?? undefined}
          coinsAmount={coinsAmount}
        />
      </Stack>
    </FormProvider>
  )
}

interface ShowLiquidityPurchasedProps {
  market: Market
  betOutcome: OutcomeId | undefined
  coinsAmount: Coins | undefined
}

const ShowLiquidityPurchased = (props: ShowLiquidityPurchasedProps) => {
  const { market, betOutcome, coinsAmount } = props
  const purchaseResult =
    betOutcome !== undefined && coinsAmount !== undefined
      ? getPurchaseResult(market, betOutcome, coinsAmount, LIQUIDITY_PORTION)
      : undefined

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Estimated liquidity</Typography>
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
    </>
  )
}

export { MarketBuyLiquidityForm }
