import { Controller, useFormContext } from 'react-hook-form'
import { FormControl, FormHelperText, FormLabel, RadioGroup, Sheet, SheetProps } from '@mui/joy'

import { Market } from '@api/queries/Market'
import { mergeSx } from '@utils/styles'
import { OutcomeFieldItem } from './Item'

interface OutcomeFieldProps extends Omit<SheetProps, "children"> {
  name: string,
  market: Market,
}

const OutcomeField = (props: OutcomeFieldProps) => {
  const { name, market, ...sheetProps } = props

  const form = useFormContext()
  const isDisabled = form.formState.isSubmitting

  return (
    <Controller
      rules={{
        required: "This field is required",
      }}
      name={name}
      control={form.control}
      render={({ field, fieldState }) =>
        <Sheet
          {...sheetProps}
          sx={mergeSx(
            {
              borderWidth: "0.125rem",
              borderStyle: "solid",
              borderColor: (theme) => !!fieldState.error ? theme.palette.warning.plainColor : "transparent",
              p: 2,
              pb: 1,
            },
            sheetProps.sx,
          )}
        >
          <FormControl error={!!fieldState.error} sx={{ gap: 1 }}>
            <FormLabel>Outcome</FormLabel>

            <RadioGroup
              {...field}
              color="neutral"
              orientation="horizontal"
              disableIcon
              sx={{
                "--variant-borderWidth": "0.125rem",
                "--RadioGroup-gap": "var(--variant-borderWidth)",
                "--Radio-actionRadius": ({ vars }) => vars.radius.md,
                gap: 1,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                my: 0,
              }}
            >
              {market.possibleOutcomes.map(outcome =>
                <OutcomeFieldItem
                  key={outcome.id}
                  outcome={outcome}
                  checked={field.value === outcome.id}
                  disabled={isDisabled}
                />
              )}
            </RadioGroup>

            <FormHelperText sx={{ mt: 0 }}>{fieldState.error?.message || "\u00A0"}</FormHelperText>
          </FormControl>
        </Sheet>
      }
    />
  )
}

export { OutcomeField, type OutcomeFieldProps }
