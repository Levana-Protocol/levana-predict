import BigNumber from 'bignumber.js'
import { useForm } from 'react-hook-form'

import { Market } from '@api/queries/Market'
import { useCancelBet } from '@api/mutations/CancelBet'
import { useLatestFormValues } from '@utils/forms'

interface SellFormValues {
  sellAmount: string,
  sellOutcome: string | null,
}

const useMarketSellForm = (market: Market) => {
  const form = useForm<SellFormValues>({
    defaultValues: {
      sellAmount: "",
      sellOutcome: null,
    },
  })

  const formValues = useLatestFormValues(form)
  const outcome = formValues.sellOutcome

  const cancelBet = useCancelBet(market.id)

  const onSubmit = (formValues: SellFormValues) => {
    const sellAmount = formValues.sellAmount
    const sellOutcome = formValues.sellOutcome

    if (sellAmount && sellOutcome) {
      const tokensAmount = BigNumber(sellAmount)
      return cancelBet.mutateAsync({ outcomeId: sellOutcome, tokensAmount: tokensAmount })
    } else {
      return Promise.reject()
    }
  }

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting

  return { form, canSubmit, onSubmit, outcome }
}

export { useMarketSellForm }
