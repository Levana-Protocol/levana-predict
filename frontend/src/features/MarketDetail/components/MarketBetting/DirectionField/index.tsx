import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Controller, useFormContext } from 'react-hook-form'
import { Box, Button, ButtonGroup, FormControl, FormHelperText, FormLabel, IconButton, Sheet, SheetProps, Slider, Stack, Typography } from '@mui/joy'

import { SwapArrowsIcon } from '@assets/icons/SwapArrows'
import { VALID_DECIMAL_REGEX, getProportion } from '@utils/number'
import { buildGridAreas, mergeSx } from '@utils/styles'
import { matchesRegex } from '@utils/string'
import { NTRN, USD } from '@utils/tokens'
import { AssetInput } from '@lib/AssetInput'

interface NtrnAmountFieldProps extends Omit<SheetProps, "children">{
  name: string,
  ntrnPrice: BigNumber | undefined,
  ntrnBalance: NTRN | undefined,
}

/**
 * An input field for an NTRN amount that can be toggled between NTRN and USD.
 *
 * Registers `${name}.value` and `${name}.toggled` into the containing form.
 * If `toggled` is true, the `amount` is in USD. If `toggled` is false, the `amount` is in NTRN.
 *
 * Must be placed inside a `FormContext`.
 *
 * @param name The base name of the field.
 * @param ntrnPrice The price to use for NTRN <=> USD conversions.
 * @param ntrnBalance The NTRN amount to use for validations, the "max" button, and the slider.
 */
const NtrnAmountField = (props: NtrnAmountFieldProps) => {
  const { name, ntrnPrice, ntrnBalance, ...sheetProps } = props

  const form = useFormContext()
  const valueFieldName = `${name}.value`
  const toggledFieldName = `${name}.toggled`
  form.register(toggledFieldName) // The toggled field serves just as context and doesn't have an input element

  const formValue = form.watch(valueFieldName) as string
  const setFormValue = (value: string, validate: boolean = true) => {
    form.setValue(valueFieldName, value, { shouldValidate: validate })
  }

  const toggled = form.watch(toggledFieldName) as boolean
  const setToggled = (value: boolean) => {
    form.setValue(toggledFieldName, value)
  }

  const isDisabled = !ntrnPrice || !ntrnBalance || form.formState.isSubmitting

  const bottomValue = useMemo(() => {
    if (!ntrnPrice || !formValue) {
      return null
    } else {
      return toggled ? new USD(formValue).toNtrn(ntrnPrice) : NTRN.fromValue(formValue).toUsd(ntrnPrice)
    }
  }, [formValue, ntrnPrice])

  const percentage = useMemo(() => {
    if (!ntrnPrice || !ntrnBalance || !formValue || !bottomValue) {
      return 0
    } else {
      const proportion = toggled
        ? getProportion(new BigNumber(formValue), ntrnBalance.toUsd(ntrnPrice).getValue())
        : getProportion(new BigNumber(formValue), ntrnBalance.getValue())
      return proportion * 100
    }
  }, [bottomValue, toggled, ntrnPrice, ntrnBalance])

  /**
   * Updates the containing form's value, converting the given NTRN value to USD depending on if the field is toggled or not
   */
  const updateValueFromNtrn = useCallback((newNtrnValue: NTRN) => {
    if (ntrnPrice) {
      if (toggled) {
        setFormValue(newNtrnValue.toUsd(ntrnPrice).toInput())
      } else {
        setFormValue(newNtrnValue.toInput())
      }
    }
  }, [toggled, ntrnPrice])

  /**
   * Updates the containing form's value, getting the given percentage of the current NTRN balance and converting it to USD depending on if the field is toggled or not
   */
  const updateValueFromPercentage = useCallback((newPercentage: number) => {
    if (ntrnBalance) {
      const ntrnUnits = ntrnBalance.units.dividedBy(100).times(newPercentage)
      updateValueFromNtrn(NTRN.fromUnits(ntrnUnits))
    }
  }, [updateValueFromNtrn, ntrnBalance])

  /**
   * A wrapper for the field's `onChange` that checks a regex before allowing an update
   */
  const onChange = useCallback((newAmount: string) => {
    const regex = VALID_DECIMAL_REGEX(toggled ? USD.maxDecimalPlaces : NTRN.exponent)

    if (ntrnPrice && ntrnBalance && matchesRegex(newAmount, regex)) {
      setFormValue(newAmount === "." ? "0." : newAmount)
    }
  }, [toggled, ntrnPrice, ntrnBalance])

  return (
    <Controller
      name={valueFieldName}
      control={form.control}
      rules={{
        required: "This field is required",
        validate: (fieldValue: string) => {
          if (fieldValue) {
            const value = new BigNumber(fieldValue)
            if (value.isZero()) {
              return "NTRN amount has to be greater than 0"
            } else if (ntrnBalance && value.gt(ntrnBalance.getValue())) {
              return "NTRN amount is too large"
            }
          }
        }
      }}
      render={({ field, fieldState }) =>
        <Sheet
          {...sheetProps}
          sx={mergeSx(
            {
              borderWidth: "0.125rem",
              borderStyle: "solid",
              borderColor: (theme) => !!fieldState.error ? theme.palette.warning.plainColor : "transparent",
              p: 2,
            },
            sheetProps.sx,
          )}
        >
          <FormControl error={!!fieldState.error} sx={{ gap: 1 }}>
            <Box sx={{
              display: "grid",
              gridTemplateAreas: buildGridAreas([
                "label label label label",
                "field field field toggle",
                "bottom bottom bottom toggle",
                "slider slider slider slider",
                "error error error error",
              ]),
              gridTemplateColumns: "max-content 1fr 1fr max-content",
              columnGap: 1,
            }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                columnGap={2}
                sx={{ gridArea: "label", mb: 1 }}
              >
                <FormLabel sx={{ m: 0, alignSelf: { sm: "center" } }}>
                  Amount
                </FormLabel>
                <Button
                  variant="plain"
                  color="success"
                  sx={{ p: 0, minHeight: 0, textAlign: { xs: "start", sm: "end" } }}
                  aria-label="Set field to max NTRN"
                  disabled={isDisabled}
                  onClick={() => {
                    if (ntrnBalance) {
                      updateValueFromNtrn(ntrnBalance)
                    }
                  }}
                >
                  Max: {ntrnBalance ? ntrnBalance.toFullPrecision(true) : "-"}
                </Button>
              </Stack>

              <AssetInput
                {...field}
                assetSymbol={toggled ? USD.symbol : NTRN.symbol}
                slotProps={{ container: { sx: { gridArea: "field" } } }}
                value={formValue}
                placeholder="0.00"
                disabled={isDisabled}
                {...(!!fieldState.error && { color: "warning" })}
                onChange={(e) => {
                  onChange(e.currentTarget.value)
                }}
              />

              <Typography level="body-sm" textColor="text.primary" fontWeight={500} sx={{ wordBreak: "break-all", gridArea: "bottom" }}>
                {(bottomValue ?? (toggled ? NTRN.fromUnits(0) : new USD(0))).toInput()} <Typography textColor="text.secondary">{toggled ? NTRN.symbol : USD.symbol}</Typography>
              </Typography>

              <IconButton
                variant="soft"
                color="neutral"
                disabled={isDisabled}
                sx={{
                  borderRadius: "sm",
                  gridArea: "toggle",
                  alignSelf: "center",
                  justifySelf: "flex-end",
                  height: "max-content",
                }}
                onClick={() => {
                  // There's a 99.99% chance this causes a race condition... right?
                  setToggled(!toggled)
                  setFormValue(bottomValue ? bottomValue.toInput() : "", !!bottomValue)
                }}
                size="sm"
                aria-label={`Switch input to ${toggled ? NTRN.symbol : USD.symbol}`}
              >
                <SwapArrowsIcon />
              </IconButton>

              <Sheet sx={{ mt: 1, p: 1, pt: 0, backgroundColor: "background.level2", overflow: "visible", gridArea: "slider" }}>
                <Slider
                  size="lg"
                  color={fieldState.error ? "warning" : "success"}
                  value={percentage}
                  disabled={isDisabled}
                  onChange={(_, value) => updateValueFromPercentage(value as number)}
                  slotProps={{
                    thumb: {
                      "aria-label": "Percentage of max NTRN",
                    }
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
                    "--Button-minHeight": theme => theme.spacing(3),
                    "--ButtonGroup-radius": theme => theme.vars.radius.xl,
                    flexWrap: "wrap",
                  }}
                >
                  {[25, 50, 100].map(buttonPercentage =>
                    <Button
                      key={buttonPercentage}
                      aria-label={`Set field to ${buttonPercentage}% of max NTRN`}
                      sx={{ fontSize: theme => theme.fontSize.xs, py: 0 }}
                      onClick={() => { updateValueFromPercentage(buttonPercentage) }}
                    >
                      {buttonPercentage}%
                    </Button>
                  )}
                </ButtonGroup>
              </Sheet>

              <FormHelperText sx={{ gridArea: "error" }}>
                {fieldState.error?.message || "\u00A0"}
              </FormHelperText>
            </Box>
          </FormControl>
        </Sheet>
      }
    />
  )
}

export { NtrnAmountField, type NtrnAmountFieldProps }
