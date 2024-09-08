import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'

import { MarketId } from '@api/queries/Market'
import { ntrnPriceQuery } from '@api/queries/NtrnPrice'
import { usePlaceBet } from '@api/mutations/PlaceBet'
import { NTRN, USD } from '@utils/tokens'

interface BetFormValues {
  betAmount: {
    value: string,
    toggled: boolean,
  },
  betOutcome: string | null,
}

const useMarketBettingForm = (marketId: MarketId) => {
  const form = useForm<BetFormValues>({
    defaultValues: {
      betAmount: {
        value: "",
        toggled: false,
      },
      betOutcome: null,
    },
  })

  const placeBet = usePlaceBet(marketId)

  const ntrnPrice = useQuery(ntrnPriceQuery)

  const onSubmit = (formValues: BetFormValues) => {
    const isToggled = formValues.betAmount.toggled
    const betAmount = formValues.betAmount.value
    const betOutcome = formValues.betOutcome

    if (betAmount && betOutcome && ntrnPrice.data?.price) {
      const ntrnAmount = isToggled ? new USD(betAmount).toNtrn(ntrnPrice.data.price) : NTRN.fromValue(betAmount)

      return placeBet.mutateAsync({ outcomeId: betOutcome, ntrnAmount: ntrnAmount })
    } else {
      return Promise.reject()
    }
  }

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting

  return { form, canSubmit, onSubmit }
}

export { useMarketBettingForm }
