import { Button, Stack, Typography } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market, OutcomeId } from "@api/queries/Market"
import { balancesQuery } from "@api/queries/Balances"
import { coinPricesQuery } from "@api/queries/Prices"
import { OutcomeField } from "../OutcomeField"
import { CoinsAmountField } from "../CoinsAmountField"
import { useMarketBuyForm } from "./form"
import { getSharesPurchased } from "@utils/shares"
import { useLatestFormValues } from "@utils/forms"
import { Coins, USD } from "@utils/coins"

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

        {coinsAmount && formValues.betOutcome && (
          <ShowSharesPurchased
            market={market}
            betOutcome={formValues.betOutcome}
            coinsAmount={coinsAmount}
          />
        )}
      </Stack>
    </FormProvider>
  )
}

interface ShowSharesPurchasedProps {
  market: Market
  betOutcome: OutcomeId
  coinsAmount: Coins
}

const ShowSharesPurchased = (props: ShowSharesPurchasedProps) => {
  const { outcome, fees, liquidity } = props.betOutcome
    ? (() => {
        const { outcome, fees, liquidity } = getSharesPurchased(
          props.market,
          props.betOutcome,
          props.coinsAmount,
        )
        return {
          outcome: outcome.toFormat(false),
          fees: fees.toFormat(true),
          liquidity: liquidity.toFormat(true),
        }
      })()
    : { outcome: "-", fees: "-", liquidity: "-" }

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Estimated shares</Typography>
        <Typography level="body-sm">{outcome}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Liquidity deposit</Typography>
        <Typography level="body-sm">{liquidity}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography level="body-sm">Fees</Typography>
        <Typography level="body-sm">{fees}</Typography>
      </Stack>
    </>
  )
}

export { MarketBuyForm }
