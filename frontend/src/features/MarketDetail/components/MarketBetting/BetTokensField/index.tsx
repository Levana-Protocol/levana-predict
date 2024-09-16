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
  SheetProps,
  Slider,
  Stack,
} from "@mui/joy"

import { VALID_DECIMAL_REGEX, getPercentage } from "@utils/number"
import { mergeSx } from "@utils/styles"
import { matchesRegex } from "@utils/string"
import { AssetInput } from "@lib/AssetInput"

interface BetTokensFieldProps extends Omit<SheetProps, "children"> {
  name: string
  tokensBalance: BigNumber | undefined
}

/**
 * An input field for an amount of bet tokens.
 *
 * Registers `${name}` into the containing form.
 *
 * Must be placed inside a `FormContext`.
 *
 * @param name The name of the field.
 * @param tokensBalance The bet tokens amount to use for validations, the "max" button, and the slider.
 */
const BetTokensField = (props: BetTokensFieldProps) => {
  const { name, tokensBalance, ...sheetProps } = props

  const form = useFormContext()

  const formValue = form.watch(name) as string
  const setFormValue = (value: string, validate: boolean = true) => {
    form.setValue(name, value, { shouldValidate: validate })
  }

  const isDisabled = !tokensBalance || form.formState.isSubmitting

  const percentage = useMemo(() => {
    if (!tokensBalance || !formValue) {
      return 0
    } else {
      return getPercentage(BigNumber(formValue), tokensBalance)
    }
  }, [formValue, tokensBalance])

  /**
   * Updates the containing form's value
   */
  const updateValueFromTokens = useCallback((newTokensValue: BigNumber) => {
    setFormValue(newTokensValue.toFixed(3))
  }, [])

  /**
   * Updates the containing form's value, getting the given percentage of the current tokens balance and converting it to a token amount
   */
  const updateValueFromPercentage = useCallback(
    (newPercentage: number) => {
      if (tokensBalance) {
        const newTokens = tokensBalance.dividedBy(100).times(newPercentage)
        updateValueFromTokens(newTokens)
      }
    },
    [updateValueFromTokens, tokensBalance],
  )

  /**
   * A wrapper for the field's `onChange` that checks a regex before allowing an update
   */
  const onChange = useCallback(
    (newAmount: string) => {
      const regex = VALID_DECIMAL_REGEX(3)

      if (tokensBalance && matchesRegex(newAmount, regex)) {
        setFormValue(newAmount === "." ? "0." : newAmount)
      }
    },
    [tokensBalance],
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
            if (value.isZero()) {
              return "Tokens amount has to be greater than 0"
            } else if (tokensBalance && value.gt(tokensBalance)) {
              return "Tokens amount is too large"
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
                !!fieldState.error
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
                  Tokens
                </FormLabel>
                <Button
                  variant="plain"
                  color="success"
                  sx={{
                    p: 0,
                    minHeight: 0,
                    textAlign: { xs: "start", sm: "end" },
                  }}
                  aria-label="Set field to max tokens"
                  disabled={isDisabled}
                  onClick={() => {
                    if (tokensBalance) {
                      updateValueFromTokens(tokensBalance)
                    }
                  }}
                >
                  Max: {tokensBalance ? tokensBalance.toFixed(3) : "-"}
                </Button>
              </Stack>

              <AssetInput
                {...field}
                assetSymbol="tokens"
                value={formValue}
                placeholder="0.00"
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
                      "aria-label": "Percentage of max tokens",
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
                      aria-label={`Set field to ${buttonPercentage}% of max tokens`}
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

export { BetTokensField, type BetTokensFieldProps }
