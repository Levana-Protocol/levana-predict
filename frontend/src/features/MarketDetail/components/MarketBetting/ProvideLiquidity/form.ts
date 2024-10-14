import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import type { Market } from "@api/queries/Market"
import { coinPricesQuery } from "@api/queries/Prices"
import { useProvideLiquidity } from "@api/mutations/ProvideLiquidity"
import { Coins, USD } from "@utils/coins"

interface ProvideLiquidityFormValues {
  liquidityAmount: {
    value: string
    toggled: boolean
  }
}

const useProvideLiquidityForm = (market: Market) => {
  const form = useForm<ProvideLiquidityFormValues>({
    defaultValues: {
      liquidityAmount: {
        value: "",
        toggled: false,
      },
    },
  })

  const denom = market.denom
  const provideLiquidity = useProvideLiquidity(market.id)
  const prices = useQuery(coinPricesQuery)

  const onSubmit = (formValues: ProvideLiquidityFormValues) => {
    const isToggled = formValues.liquidityAmount.toggled
    const liquidityAmount = formValues.liquidityAmount.value
    const price = prices.data?.get(denom)

    if (liquidityAmount && price) {
      const coinsAmount = isToggled
        ? new USD(liquidityAmount).toCoins(denom, price)
        : Coins.fromValue(denom, liquidityAmount)

      return provideLiquidity
        .mutateAsync({ coinsAmount: coinsAmount })
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

export { useProvideLiquidityForm }
