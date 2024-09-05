import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'

import { ntrnPriceQuery } from '@api/queries/NtrnPrice'
import { NTRN, USD } from '@utils/tokens'

interface BetFormValues {
  betAmount: {
    value: string,
    toggled: boolean,
  },
  direction: "buy" | "sell",
  outcome: string | null,
}

const useMarketBettingForm = (marketId: string) => {
  const form = useForm<BetFormValues>({
    defaultValues: {
      betAmount: {
        value: "",
        toggled: false,
      },
      direction: "buy",
      outcome: null,
    },
  })

  const ntrnPrice = useQuery(ntrnPriceQuery)

  const onSubmit = (formValues: BetFormValues) => {
    const isToggled = formValues.betAmount.toggled
    const betAmount = formValues.betAmount.value
    const direction = formValues.direction
    const outcome = formValues.outcome

    if (betAmount && outcome && ntrnPrice.data?.price) {
      const ntrnAmount = isToggled ? new USD(betAmount).toNtrn(ntrnPrice.data.price) : NTRN.fromValue(betAmount)

      // return betOnMarket.mutateAsync({ ... })
    } else {
      return Promise.reject()
    }
  }

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting

  return { form, canSubmit, onSubmit }
}

export { useMarketBettingForm }
