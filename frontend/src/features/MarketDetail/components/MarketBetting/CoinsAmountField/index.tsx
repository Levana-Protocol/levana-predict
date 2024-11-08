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
import { type Denom, Coins, USD, getCoinConfig } from "@utils/coins"
import { AssetInput } from "@lib/AssetInput"

interface CoinsAmountFieldProps extends Omit<SheetProps, "children"> {
  name: string
  denom: Denom
  price: BigNumber | undefined
  balance: Coins | undefined
}

/**
 * An input field for an amount of Coins that can be toggled between the Coin and USD.
 *
 * Registers `${name}.value` and `${name}.toggled` into the containing form.
 * If `toggled` is true, the `amount` is in USD. If `toggled` is false, the `amount` is in Coins.
 *
 * Must be placed inside a `FormContext`.
 *
 * @param name The base name of the field.
 * @param price The price to use for Coins <=> USD conversions.
 * @param balance The Coiuns amount to use for validations, the "max" button, and the slider.
 */
const CoinsAmountField = (props: CoinsAmountFieldProps) => {
  const { name, denom, price, balance, ...sheetProps } = props
  const coinConfig = useMemo(() => getCoinConfig(denom), [denom])

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
        ? new USD(formValue).toCoins(denom, price)
        : Coins.fromValue(denom, formValue).toUsd(price)
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
   * Updates the containing form's value, converting the given Coin value to USD depending on if the field is toggled or not
   */
  const updateValueFromCoins = useCallback(
    (newCoins: Coins) => {
      if (price) {
        if (toggled) {
          setFormValue(newCoins.toUsd(price).toInput())
        } else {
          setFormValue(newCoins.toInput())
        }
      }
    },
    [toggled, price, setFormValue],
  )

  /**
   * Updates the containing form's value, getting the given percentage of the current Coin balance and converting it to USD depending on if the field is toggled or not
   */
  const updateValueFromPercentage = useCallback(
    (newPercentage: number) => {
      if (balance) {
        const coinUnits = balance.units.dividedBy(100).times(newPercentage)
        updateValueFromCoins(Coins.fromUnits(denom, coinUnits))
      }
    },
    [updateValueFromCoins, denom, balance],
  )

  /**
   * A wrapper for the field's `onChange` that checks a regex before allowing an update
   */
  const onChange = useCallback(
    (newAmount: string) => {
      const regex = VALID_DECIMAL_REGEX(
        toggled ? USD.maxDecimalPlaces : coinConfig.exponent,
      )

      if (price && balance && matchesRegex(newAmount, regex)) {
        setFormValue(newAmount === "." ? "0." : newAmount)
      }
    },
    [toggled, setFormValue, coinConfig, price, balance],
  )

  return (
    <Controller
      name={valueFieldName}
      control={form.control}
      rules={{
        required: "This field is required",
        validate: (fieldValue: string) => {
          if (fieldValue && price) {
            const isToggled = form.getValues()[toggledFieldName] as boolean
            const value = isToggled
              ? new USD(fieldValue).toCoins(denom, price).getValue()
              : Coins.fromValue(denom, fieldValue).getValue()

            if (!value.gt(0)) {
              return `${coinConfig.symbol} amount has to be greater than 0`
            } else if (balance && value.gt(balance.getValue())) {
              return `You don't have enough ${coinConfig.symbol}.`
            }
          }
        },
      }}
      render={({ field, fieldState }) => (
        <Sheet
          {...sheetProps}
          sx={mergeSx(
            (theme) => ({
              ...(fieldState.error && {
                boxShadow: `0 0 0 2px ${theme.vars.palette.danger[500]} inset`,
              }),
              p: 2,
            }),
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
                  aria-label={`Set field to max ${coinConfig.symbol}`}
                  disabled={isDisabled}
                  onClick={() => {
                    if (balance) {
                      updateValueFromCoins(balance)
                    }
                  }}
                >
                  Max: {balance ? balance.toFullPrecision(true) : "-"}
                </Button>
              </Stack>

              <AssetInput
                {...field}
                assetSymbol={toggled ? USD.symbol : coinConfig.symbol}
                slotProps={{ container: { sx: { gridArea: "field" } } }}
                value={formValue}
                placeholder="0.00"
                disabled={isDisabled}
                {...(!!fieldState.error && { color: "danger" })}
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
                  (toggled ? Coins.fromUnits(denom, 0) : new USD(0))
                ).toInput()}{" "}
                <Typography textColor="text.secondary">
                  {toggled ? coinConfig.symbol : USD.symbol}
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
                aria-label={`Switch input to ${toggled ? coinConfig.symbol : USD.symbol}`}
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
                  color={fieldState.error ? "danger" : "success"}
                  value={percentage}
                  disabled={isDisabled}
                  onChange={(_, value) =>
                    updateValueFromPercentage(value as number)
                  }
                  slotProps={{
                    thumb: {
                      "aria-label": `Percentage of max ${coinConfig.symbol}`,
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
                      aria-label={`Set field to ${buttonPercentage}% of max ${coinConfig.symbol}`}
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

export { CoinsAmountField, type CoinsAmountFieldProps }
