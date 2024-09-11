import { Box, Button, Sheet, Skeleton, Stack, Typography } from '@mui/joy'
import { FormProvider } from 'react-hook-form'
import { useSuspenseQuery } from '@tanstack/react-query'

import { useCurrentAccount } from '@config/chain'
import { Market } from '@api/queries/Market'
import { Positions, positionsQuery } from '@api/queries/Positions'
import { LoadableComponent } from '@lib/Loadable'
import { ErrorSkeleton } from '@lib/Error/Skeleton'
import { useMarketClaimForm } from './form'

const MarketClaimForm = (props: { market: Market }) => {
  const { market } = props
  const { form, canSubmit, onSubmit } = useMarketClaimForm(market)

  return (
    <FormProvider {...form}>
      <Stack
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
        direction="column"
        rowGap={1.5}
      >
        <Typography level="title-lg" fontWeight={600}>Earnings</Typography>

        <Earnings market={market} />

        <Button
          aria-label="Claim bet earnings"
          type="submit"
          size="lg"
          disabled={!canSubmit}
          fullWidth
        >
          {form.formState.isSubmitting ? "Claiming earnings..." : "Claim earnings"}
        </Button>
      </Stack>
    </FormProvider>
  )
}

const Earnings = (props: { market: Market }) => {
  const { market } = props
  const account = useCurrentAccount()

  return (
    <LoadableComponent
      useDeps={() => useSuspenseQuery(positionsQuery(account.bech32Address, market.id)).data}
      renderContent={(positions) => <EarningsContent market={market} positions={positions} />}
      loadingFallback={
        <Skeleton variant="rectangular">
          <EarningsPlaceholder />
        </Skeleton>
      }
      errorFallback={
        <ErrorSkeleton
          placeholderContent={<EarningsPlaceholder />}
        />
      }
    />
  )
}

const EarningsContent = (props: { market: Market, positions: Positions }) => {
  const { market, positions } = props
  const earnings = market.winnerOutcome
    ? positions.outcomes.get(market.winnerOutcome.id)
    : undefined

  return (
    <Sheet sx={{ p: 2, mb: 1 }}>
      {positions.claimed
        ? <Typography level="body-md">You have claimed your earnings for this market.</Typography>
        : (earnings?.gt(0)
          ?
            <Box>
              <Typography
                level="title-lg"
                fontWeight={600}
                color={market.winnerOutcome?.label === "Yes" ? "success" : market.winnerOutcome?.label === "No" ? "danger" : "neutral"}
              >
                {market.winnerOutcome?.label}
              </Typography>
              <Typography level="title-md" textColor="text.secondary" fontWeight={500}>
                {earnings.toFixed(3)} tokens
              </Typography>
            </Box>
          : <Typography level="body-md">You have no earnings for this market.</Typography>
        )
      }
    </Sheet>
  )
}

const EarningsPlaceholder = () => {
  return (
    <Sheet sx={{ p: 2 }}>
      <Box>
        <Typography level="title-lg" fontWeight={600}>
          Yes
        </Typography>
        <Typography level="title-md" fontWeight={500}>
          0.000 tokens
        </Typography>
      </Box>
    </Sheet>
  )
}

export { MarketClaimForm }
