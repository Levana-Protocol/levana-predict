import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { Market } from "@api/queries/Market"
import { tokenPricesQuery } from "@api/queries/Prices"
import { usePlaceBet } from "@api/mutations/PlaceBet"
import { Tokens, USD } from "@utils/tokens"

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
  const prices = useQuery(tokenPricesQuery)

  const onSubmit = (formValues: BuyFormValues) => {
    const isToggled = formValues.betAmount.toggled
    const betAmount = formValues.betAmount.value
    const betOutcome = formValues.betOutcome
    const price = prices.data?.get(denom)

    if (betAmount && betOutcome && price) {
      const tokensAmount = isToggled
        ? new USD(betAmount).toTokens(denom, price)
        : Tokens.fromValue(denom, betAmount)

      return placeBet.mutateAsync({
        outcomeId: betOutcome,
        tokensAmount: tokensAmount,
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
