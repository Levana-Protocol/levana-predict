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
  IconButton,
  Sheet,
  type SheetProps,
  Slider,
  Stack,
  Typography,
} from "@mui/joy"

import { SwapArrowsIcon } from "@assets/icons/SwapArrows"
import { VALID_DECIMAL_REGEX, getProportion } from "@utils/number"
import { buildGridAreas, mergeSx } from "@utils/styles"
import { matchesRegex } from "@utils/string"
import { type Denom, Tokens, USD, getTokenConfig } from "@utils/tokens"
import { AssetInput } from "@lib/AssetInput"

interface TokensAmountFieldProps extends Omit<SheetProps, "children"> {
  name: string
  denom: Denom
  price: BigNumber | undefined
  balance: Tokens | undefined
}

/**
 * An input field for a Tokens amount that can be toggled between Token and USD.
 *
 * Registers `${name}.value` and `${name}.toggled` into the containing form.
 * If `toggled` is true, the `amount` is in USD. If `toggled` is false, the `amount` is in Token.
 *
 * Must be placed inside a `FormContext`.
 *
 * @param name The base name of the field.
 * @param price The price to use for Token <=> USD conversions.
 * @param balance The Token amount to use for validations, the "max" button, and the slider.
 */
const TokensAmountField = (props: TokensAmountFieldProps) => {
  const { name, denom, price, balance, ...sheetProps } = props
  const tokenConfig = getTokenConfig(denom)

  const form = useFormContext()
  const valueFieldName = `${name}.value`
  const toggledFieldName = `${name}.toggled`
  form.register(toggledFieldName) // The toggled field serves just as context and doesn't have an input element

  const formValue = form.watch(valueFieldName) as string
  const setFormValue = useCallback(
    (value: string, validate = true) => {
      form.setValue(valueFieldName, value, { shouldValidate: validate })
    },
    [valueFieldName, form.setValue],
  )

  const toggled = form.watch(toggledFieldName) as boolean
  const setToggled = (value: boolean) => {
    form.setValue(toggledFieldName, value)
  }

  const isDisabled = !price || !balance || form.formState.isSubmitting

  const bottomValue = useMemo(() => {
    if (!price || !formValue) {
      return null
    } else {
      return toggled
        ? new USD(formValue).toTokens(denom, price)
        : Tokens.fromValue(denom, formValue).toUsd(price)
    }
  }, [formValue, price, denom, toggled])

  const percentage = useMemo(() => {
    if (!price || !balance || !formValue || !bottomValue) {
      return 0
    } else {
      const proportion = toggled
        ? getProportion(
            new BigNumber(formValue),
            balance.toUsd(price).getValue(),
          )
        : getProportion(new BigNumber(formValue), balance.getValue())
      return proportion * 100
    }
  }, [formValue, bottomValue, toggled, price, balance])

  /**
   * Updates the containing form's value, converting the given Token value to USD depending on if the field is toggled or not
   */
  const updateValueFromTokens = useCallback(
    (newTokensValue: Tokens) => {
      if (price) {
        if (toggled) {
          setFormValue(newTokensValue.toUsd(price).toInput())
        } else {
          setFormValue(newTokensValue.toInput())
        }
      }
    },
    [toggled, price, setFormValue],
  )

  /**
   * Updates the containing form's value, getting the given percentage of the current Token balance and converting it to USD depending on if the field is toggled or not
   */
  const updateValueFromPercentage = useCallback(
    (newPercentage: number) => {
      if (balance) {
        const tokenUnits = balance.units.dividedBy(100).times(newPercentage)
        updateValueFromTokens(Tokens.fromUnits(denom, tokenUnits))
      }
    },
    [updateValueFromTokens, denom, balance],
  )

  /**
   * A wrapper for the field's `onChange` that checks a regex before allowing an update
   */
  const onChange = useCallback(
    (newAmount: string) => {
      const regex = VALID_DECIMAL_REGEX(
        toggled ? USD.maxDecimalPlaces : tokenConfig.exponent,
      )

      if (price && balance && matchesRegex(newAmount, regex)) {
        setFormValue(newAmount === "." ? "0." : newAmount)
      }
    },
    [toggled, setFormValue, tokenConfig.exponent, price, balance],
  )

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
              return `${tokenConfig.symbol} amount has to be greater than 0`
            } else if (balance && value.gt(balance.getValue())) {
              return `${tokenConfig.symbol} amount is too large`
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
            <Box
              sx={{
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
              }}
            >
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
                  sx={{
                    p: 0,
                    minHeight: 0,
                    textAlign: { xs: "start", sm: "end" },
                  }}
                  aria-label={`Set field to max ${tokenConfig.symbol}`}
                  disabled={isDisabled}
                  onClick={() => {
                    if (balance) {
                      updateValueFromTokens(balance)
                    }
                  }}
                >
                  Max: {balance ? balance.toFullPrecision(true) : "-"}
                </Button>
              </Stack>

              <AssetInput
                {...field}
                assetSymbol={toggled ? USD.symbol : tokenConfig.symbol}
                slotProps={{ container: { sx: { gridArea: "field" } } }}
                value={formValue}
                placeholder="0.00"
                disabled={isDisabled}
                {...(!!fieldState.error && { color: "warning" })}
                onChange={(e) => {
                  onChange(e.currentTarget.value)
                }}
              />

              <Typography
                level="body-sm"
                textColor="text.primary"
                fontWeight={500}
                sx={{ wordBreak: "break-all", gridArea: "bottom" }}
              >
                {(
                  bottomValue ??
                  (toggled ? Tokens.fromUnits(denom, 0) : new USD(0))
                ).toInput()}{" "}
                <Typography textColor="text.secondary">
                  {toggled ? tokenConfig.symbol : USD.symbol}
                </Typography>
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
                  setToggled(!toggled)
                  setFormValue(
                    bottomValue ? bottomValue.toInput() : "",
                    !!bottomValue,
                  )
                }}
                size="sm"
                aria-label={`Switch input to ${toggled ? tokenConfig.symbol : USD.symbol}`}
              >
                <SwapArrowsIcon />
              </IconButton>

              <Sheet
                sx={{
                  mt: 1,
                  p: 1,
                  pt: 0,
                  backgroundColor: "background.level2",
                  overflow: "visible",
                  gridArea: "slider",
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
                      "aria-label": `Percentage of max ${tokenConfig.symbol}`,
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
                      aria-label={`Set field to ${buttonPercentage}% of max ${tokenConfig.symbol}`}
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

export { TokensAmountField, type TokensAmountFieldProps }
