import { Radio, RadioProps, Stack, Typography } from '@mui/joy'

import { MarketOutcome } from '@api/queries/Market'
import { mergeSx } from '@utils/styles'

interface OutcomeFieldItemProps extends Omit<RadioProps, "children" | "label" | "value"> {
  outcome: MarketOutcome,
}

const OutcomeFieldItem = (props: OutcomeFieldItemProps) => {
  const { outcome, ...radioProps } = props

  return(
    <Radio
      value={outcome.id}
      aria-label={`Set outcome of bet to "${outcome.label}"`}
      label={
          <Stack direction="column" alignItems="center">
            <Typography
              level="body-md"
              fontWeight={600}
              color={outcome.label === "Yes" ? "success" : outcome.label === "No" ? "danger" : "neutral"}
            >
              {outcome.label}
            </Typography>
        </Stack>
      }
      color="neutral"
      variant="outlined"
      {...radioProps}
      sx={mergeSx(
        {
          p: 1,
          alignItems: "center",
          textAlign: "center",
          textDecoration: "none",
          m: 0,
        },
        radioProps.sx,
      )}
      slotProps={{
        action: ({ checked }) => ({
          sx: {
            "--variant-borderWidth": "0.125rem",

            ...(checked && {
              backgroundColor: "background.level3",
              borderColor: "primary.200",

              "&:hover, &:active": {
                backgrounddColor: "background.level3",
                borderColor: "primary.200",
              },
            }),

            ...(!checked && {
              "&:hover": {
                backgrounddColor: "background.level2",
                borderColor: "primary.200",
              },

              "&:active": {
                backgrounddColor: "background.level3",
                borderColor: "primary.200",
              },
            }),
          },
        }),
      }}
    />
  )
}

export { OutcomeFieldItem, type OutcomeFieldItemProps}
