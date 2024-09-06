import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'

import { ntrnPriceQuery } from '@api/queries/NtrnPrice'
import { NTRN, USD } from '@utils/tokens'

interface BetFormValues {
  betAmount: {
    value: string,
    toggled: boolean,
  },
  betOutcome: string | null,
}

const useMarketBettingForm = (marketId: string) => {
  const form = useForm<BetFormValues>({
    defaultValues: {
      betAmount: {
        value: "",
        toggled: false,
      },
      betOutcome: null,
    },
  })

  const ntrnPrice = useQuery(ntrnPriceQuery)

  const onSubmit = (formValues: BetFormValues) => {
    const isToggled = formValues.betAmount.toggled
    const betAmount = formValues.betAmount.value
    const betOutcome = formValues.betOutcome

    if (betAmount && betOutcome && ntrnPrice.data?.price) {
      const ntrnAmount = isToggled ? new USD(betAmount).toNtrn(ntrnPrice.data.price) : NTRN.fromValue(betAmount)
      console.log(marketId, ntrnAmount.toFullPrecision(true))

      // return betOnMarket.mutateAsync({ ... })
    } else {
      return Promise.reject()
    }
  }

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting

  return { form, canSubmit, onSubmit }
}

export { useMarketBettingForm }
