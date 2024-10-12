import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import type { Market } from "@api/queries/Market"
import { coinPricesQuery } from "@api/queries/Prices"
import { useBuyLiquidity } from "@api/mutations/BuyLiquidity"
import { Coins, USD } from "@utils/coins"

interface BuyLiquidityFormValues {
  liquidityAmount: {
    value: string
    toggled: boolean
  }
  liquidityOutcome: string | null
}

const useBuyLiquidityForm = (market: Market) => {
  const form = useForm<BuyLiquidityFormValues>({
    defaultValues: {
      liquidityAmount: {
        value: "",
        toggled: false,
      },
      liquidityOutcome: null,
    },
  })

  const denom = market.denom
  const buyLiquidity = useBuyLiquidity(market.id)
  const prices = useQuery(coinPricesQuery)

  const onSubmit = (formValues: BuyLiquidityFormValues) => {
    const isToggled = formValues.liquidityAmount.toggled
    const liquidityAmount = formValues.liquidityAmount.value
    const liquidityOutcome = formValues.liquidityOutcome
    const price = prices.data?.get(denom)

    if (liquidityAmount && liquidityOutcome && price) {
      const coinsAmount = isToggled
        ? new USD(liquidityAmount).toCoins(denom, price)
        : Coins.fromValue(denom, liquidityAmount)

      return buyLiquidity
        .mutateAsync({
          outcomeId: liquidityOutcome,
          coinsAmount: coinsAmount,
        })
        .then(() => {
          form.reset()
        })
    } else {
      return Promise.reject()
    }
  }

  const canSubmit =
    form.formState.isValid &&
    !form.formState.isSubmitting &&
    !!prices.data?.has(market.denom)

  return { form, canSubmit, onSubmit }
}

export { useBuyLiquidityForm }
