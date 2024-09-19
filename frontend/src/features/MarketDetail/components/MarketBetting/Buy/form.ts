import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import type { Market } from "@api/queries/Market"
import { coinPricesQuery } from "@api/queries/Prices"
import { usePlaceBet } from "@api/mutations/PlaceBet"
import { Coins, USD } from "@utils/coins"

interface BuyFormValues {
  betAmount: {
    value: string
    toggled: boolean
  }
  betOutcome: string | null
}

const useMarketBuyForm = (market: Market) => {
  const form = useForm<BuyFormValues>({
    defaultValues: {
      betAmount: {
        value: "",
        toggled: false,
      },
      betOutcome: null,
    },
  })

  const denom = market.denom
  const placeBet = usePlaceBet(market.id)
  const prices = useQuery(coinPricesQuery)

  const onSubmit = (formValues: BuyFormValues) => {
    const isToggled = formValues.betAmount.toggled
    const betAmount = formValues.betAmount.value
    const betOutcome = formValues.betOutcome
    const price = prices.data?.get(denom)

    if (betAmount && betOutcome && price) {
      const coinsAmount = isToggled
        ? new USD(betAmount).toCoins(denom, price)
        : Coins.fromValue(denom, betAmount)

      return placeBet
        .mutateAsync({
          outcomeId: betOutcome,
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

export { useMarketBuyForm }
