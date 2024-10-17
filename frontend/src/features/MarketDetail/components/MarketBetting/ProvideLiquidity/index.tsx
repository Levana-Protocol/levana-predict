import { Button, Stack } from "@mui/joy"
import { FormProvider } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { balancesQuery } from "@api/queries/Balances"
import { coinPricesQuery } from "@api/queries/Prices"
import { useProvideLiquidityForm } from "./form"
import { CoinsAmountField } from "../CoinsAmountField"

interface MarketProvideLiquidityFormProps {
  market: Market
  isActive: boolean
}

const MarketProvideLiquidityForm = (props: MarketProvideLiquidityFormProps) => {
  const { market, isActive } = props
  const account = useCurrentAccount()
  const balances = useQuery(balancesQuery(account.bech32Address))
  const price = useQuery(coinPricesQuery).data?.get(market.denom)

  const { form, canSubmit, onSubmit } = useProvideLiquidityForm(market)

  return (
    isActive && (
      <FormProvider {...form}>
        <Stack
          component="form"
          onSubmit={form.handleSubmit(onSubmit)}
          direction="column"
          rowGap={1.5}
        >
          <CoinsAmountField
            name="liquidityAmount"
            denom={market.denom}
            balance={balances.data?.get(market.denom)}
            price={price}
          />

          <Button
            aria-label="Provide liquidity"
            type="submit"
            size="lg"
            disabled={!canSubmit}
            fullWidth
          >
            {form.formState.isSubmitting
              ? "Providing liquidity..."
              : "Provide liquidity"}
          </Button>
        </Stack>
      </FormProvider>
    )
  )
}

export { MarketProvideLiquidityForm }
