import { useCallback, useMemo } from "react"
import BigNumber from "bignumber.js"
import { Controller, useFormContext } from "react-hook-form"
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Sheet,
  type SheetProps,
  Slider,
  Stack,
} from "@mui/joy"

import { VALID_DECIMAL_REGEX, getPercentage } from "@utils/number"
import { mergeSx } from "@utils/styles"
import { matchesRegex } from "@utils/string"
import type { Shares } from "@utils/shares"
import { AssetInput } from "@lib/AssetInput"

interface SharesAmountFieldProps extends Omit<SheetProps, "children"> {
  name: string
  balance: Shares | undefined
}

/**
 * An input field for an amount of shares.
 *
 * Registers `${name}` into the containing form.
 *
 * Must be placed inside a `FormContext`.
 *
 * @param name The name of the field.
 * @param balance The shares amount to use for validations, the "max" button, and the slider.
 */
const SharesAmountField = (props: SharesAmountFieldProps) => {
  const { name, balance, ...sheetProps } = props

  const form = useFormContext()

  const formValue = form.watch(name) as string
  const setFormValue = useCallback(
    (value: string, validate = true) => {
      form.setValue(name, value, { shouldValidate: validate })
    },
    [name, form.setValue],
  )

  const isDisabled = !balance || form.formState.isSubmitting

  const percentage = useMemo(() => {
    if (!balance || !formValue) {
      return 0
    } else {
      return getPercentage(BigNumber(formValue), balance.getValue())
    }
  }, [formValue, balance])

  /**
   * Updates the containing form's value
   */
  const updateValueFromShares = useCallback(
    (newShares: Shares) => {
      setFormValue(newShares.toInput())
    },
    [setFormValue],
  )

  /**
   * Updates the containing form's value, getting the given percentage of the current shares balance and converting it to a shares amount
   */
  const updateValueFromPercentage = useCallback(
    (newPercentage: number) => {
      if (balance) {
        const newShares = balance.dividedBy(100).times(newPercentage)
        updateValueFromShares(newShares)
      }
    },
    [updateValueFromShares, balance],
  )

  /**
   * A wrapper for the field's `onChange` that checks a regex before allowing an update
   */
  const onChange = useCallback(
    (newAmount: string) => {
      if (balance) {
        const regex = VALID_DECIMAL_REGEX(balance?.maxDecimalPlaces)

        if (matchesRegex(newAmount, regex)) {
          setFormValue(newAmount === "." ? "0." : newAmount)
        }
      }
    },
    [balance, setFormValue],
  )

  return (
    <Controller
      name={name}
      control={form.control}
      rules={{
        required: "This field is required",
        validate: (fieldValue: string) => {
          if (fieldValue) {
            const value = new BigNumber(fieldValue)
            if (!value.gt(0)) {
              return "Shares amount has to be greater than 0"
            } else if (balance && value.gt(balance.getValue())) {
              return "You don't have enough shares"
            }
          }
        },
      }}
      render={({ field, fieldState }) => (
        <Sheet
          {...sheetProps}
          sx={mergeSx(
            {
              borderWidth: "0.125rem",
              borderStyle: "solid",
              borderColor: (theme) =>
                fieldState.error
                  ? theme.palette.warning.plainColor
                  : "transparent",
              p: 2,
            },
            sheetProps.sx,
          )}
        >
          <FormControl error={!!fieldState.error} sx={{ gap: 1 }}>
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                columnGap={2}
                sx={{ mb: 1 }}
              >
                <FormLabel sx={{ m: 0, alignSelf: { sm: "center" } }}>
                  Shares
                </FormLabel>
                <Button
                  variant="plain"
                  color="success"
                  sx={{
                    p: 0,
                    minHeight: 0,
                    textAlign: { xs: "start", sm: "end" },
                  }}
                  aria-label="Set field to max shares"
                  disabled={isDisabled}
                  onClick={() => {
                    if (balance) {
                      updateValueFromShares(balance)
                    }
                  }}
                >
                  Max: {balance ? balance.toFormat(false) : "-"}
                </Button>
              </Stack>

              <AssetInput
                {...field}
                assetSymbol="shares"
                value={formValue}
                placeholder="0.000"
                disabled={isDisabled}
                {...(!!fieldState.error && { color: "warning" })}
                onChange={(e) => {
                  onChange(e.currentTarget.value)
                }}
              />

              <Sheet
                sx={{
                  mt: 1,
                  p: 1,
                  pt: 0,
                  backgroundColor: "background.level2",
                  overflow: "visible",
                }}
              >
                <Slider
                  size="lg"
                  color={fieldState.error ? "warning" : "success"}
                  value={percentage}
                  disabled={isDisabled}
                  onChange={(_, value) =>
                    updateValueFromPercentage(value as number)
                  }
                  slotProps={{
                    thumb: {
                      "aria-label": "Percentage of max shares",
                    },
                  }}
                />

                <ButtonGroup
                  variant="soft"
                  color="neutral"
                  spacing={1}
                  size="sm"
                  buttonFlex={1}
                  disabled={isDisabled}
                  sx={{
                    "--Button-minHeight": (theme) => theme.spacing(3),
                    "--ButtonGroup-radius": (theme) => theme.vars.radius.xl,
                    flexWrap: "wrap",
                  }}
                >
                  {[25, 50, 100].map((buttonPercentage) => (
                    <Button
                      key={buttonPercentage}
                      aria-label={`Set field to ${buttonPercentage}% of max shares`}
                      sx={{ fontSize: (theme) => theme.fontSize.xs, py: 0 }}
                      onClick={() => {
                        updateValueFromPercentage(buttonPercentage)
                      }}
                    >
                      {buttonPercentage}%
                    </Button>
                  ))}
                </ButtonGroup>
              </Sheet>

              <FormHelperText sx={{ gridArea: "error" }}>
                {fieldState.error?.message || "\u00A0"}
              </FormHelperText>
            </Box>
          </FormControl>
        </Sheet>
      )}
    />
  )
}

export { SharesAmountField, type SharesAmountFieldProps }
