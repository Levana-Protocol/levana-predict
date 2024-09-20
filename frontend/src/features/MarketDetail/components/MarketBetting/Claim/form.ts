import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { useCurrentAccount } from "@config/chain"
import type { Market } from "@api/queries/Market"
import { positionsQuery } from "@api/queries/Positions"
import { useClaimEarnings } from "@api/mutations/ClaimEarnings"
import { getShares } from "@utils/shares"

const useMarketClaimForm = (market: Market) => {
  const form = useForm()

  const claimEarnings = useClaimEarnings(market.id)

  const account = useCurrentAccount()
  const positions = useQuery(positionsQuery(account.bech32Address, market))

  const hasEarnings =
    market.winnerOutcome !== undefined &&
    !!positions.data &&
    !positions.data.claimed &&
    getShares(positions.data, market.winnerOutcome.id).units.gt(0)

  const onSubmit = () => {
    return claimEarnings.mutateAsync().then(() => {
      form.reset()
    })
  }

  const canSubmit =
    form.formState.isValid && !form.formState.isSubmitting && hasEarnings

  return { form, canSubmit, onSubmit }
}

export { useMarketClaimForm }
