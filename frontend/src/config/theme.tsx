/**
 * @file Imported from the Gov project to match its styles as much as possible
 */

import type { PropsWithChildren } from "react"
import {
  CssBaseline,
  CssVarsProvider,
  GlobalStyles,
  type PaletteBackground,
  type PaletteRange,
  type PaletteText,
  buttonClasses,
  formControlClasses,
  inputClasses,
  listItemButtonClasses,
  selectClasses,
  sheetClasses,
  sliderClasses,
  textareaClasses,
} from "@mui/joy"
import extendTheme, {
  type ColorSystemOptions,
} from "@mui/joy/styles/extendTheme"

import { ChevronDownIcon } from "@assets/icons/ChevronDown"
import { MS_IN_SECOND } from "@utils/time"

declare module "@mui/joy/styles/types/colorSystem" {
  interface PaletteBackgroundOverrides {
    spotlight1: true
    level4: true
  }

  interface Palette {
    primarySoft: Pick<PaletteRange, 100 | 200 | 300 | 400 | 500 | 600>
  }
}

type ColorRange = Pick<
  PaletteRange,
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
>

const purple: ColorRange = {
  50: "#fcf8ff",
  100: "#f0deff",
  200: "#d8abff",
  300: "#c078ff",
  400: "#9c2bff",
  500: "#7600dd",
  600: "#5b00aa",
  700: "#400077",
  800: "#250044",
  900: "#17002b",
}

const green: ColorRange = {
  50: "#f0faf7",
  100: "#ddf4ec",
  200: "#b7e7d6",
  300: "#90dbc0",
  400: "#6aceaa",
  500: "#44c194",
  600: "#349e78",
  700: "#27785b",
  800: "#1a523e",
  900: "#0e2b21",
}

const red: ColorRange = {
  50: "#fef2f7",
  100: "#fbdbe8",
  200: "#f8c4da",
  300: "#f297bd",
  400: "#ed69a0",
  500: "#e52574",
  600: "#c0175d",
  700: "#921247",
  800: "#650c31",
  900: "#4e0926",
}

const yellow: ColorRange = {
  50: "#fff1d5",
  100: "#ffeac0",
  200: "#ffe3ab",
  300: "#ffd482",
  400: "#ffc658",
  500: "#FFB82E",
  600: "#cc9325",
  700: "#996e1c",
  800: "#664a12",
  900: "#332509",
}

const gray: ColorRange = {
  50: "#F2F1F4",
  100: "#E5E3E8",
  200: "#CCC7D1",
  300: "#B2ACB9",
  400: "#9992A0",
  500: "#807887",
  600: "#675F6D",
  700: "#4D4653",
  800: "#332E38",
  900: "#1A161D",
}

const colorScheme = ((): ColorSystemOptions => {
  const body = "#0E0A12"

  const background: Partial<PaletteBackground> = {
    body,
    surface: body,
    popup: gray[900],
    level1: "#1D1A21",
    level2: "#26222A",
    level3: "#39343E",
    level4: "#16111A",
    tooltip: gray[600],
    backdrop: "rgba(0 0 0 / 0.3)",
    spotlight1: "#211A33",
  }

  const text: Partial<PaletteText> = {
    primary: "#FFFFFF",
    secondary: "#B4AFB7",
    tertiary: "#5C595E",
  }

  const divider = "#3E3B41"
  const disabled = "#868388"

  const primary: Partial<PaletteRange> = {
    ...purple,
    solidBg: purple[500],
    solidHoverBg: purple[400],
    solidActiveBg: purple[600],
    solidDisabledBg: gray[800],
    solidDisabledColor: gray[500],
    plainColor: purple[400],
  }

  const primarySoft: Pick<PaletteRange, 100 | 200 | 300 | 400 | 500 | 600> = {
    100: "#431E60",
    200: "#5B337B",
    300: "#704791",
    400: "#855BA8",
    500: "#AE82D3",
    600: "#C8A7E3",
  }

  const success: Partial<PaletteRange> = {
    ...green,
    solidBg: green[500],
    solidHoverBg: green[400],
    solidActiveBg: green[600],
    solidDisabledBg: disabled,
    solidDisabledColor: text.primary,
    plainColor: green[500],
  }

  const warning: Partial<PaletteRange> = {
    ...yellow,
    solidBg: yellow[500],
    solidHoverBg: yellow[400],
    solidActiveBg: yellow[600],
    solidDisabledBg: disabled,
    solidDisabledColor: text.primary,
    plainColor: yellow[400],
  }

  const danger: Partial<PaletteRange> = {
    ...red,
    solidBg: red[500],
    solidHoverBg: red[400],
    solidActiveBg: red[600],
    solidDisabledBg: disabled,
    solidDisabledColor: text.primary,
    plainColor: red[500],
  }

  const neutral: Partial<PaletteRange> = {
    ...gray,
    solidBg: gray[500],
    solidHoverBg: gray[400],
    solidActiveBg: gray[600],
    solidDisabledBg: disabled,
    solidDisabledColor: text.primary,
    plainColor: text.primary,
    outlinedBorder: divider,
  }

  return {
    palette: {
      background,
      text,
      divider,
      primary,
      primarySoft,
      neutral,
      danger,
      success,
      warning,
      focusVisible: "none",
    },
  }
})()

const theme = extendTheme({
  spacing: (factor: number) => `${0.5 * factor}rem`,
  breakpoints: {
    values: {
      xs: 0,
      sm: 37.5,
      md: 56.25,
      lg: 75,
      xl: 96,
    },
    unit: "rem",
  },
  cssVarPrefix: "",
  colorSchemes: {
    dark: colorScheme,
  },
  fontWeight: {
    sm: 300,
    md: 500,
    lg: 600,
    xl: 700,
  },
  radius: {
    xs: ".125rem",
    sm: ".375rem",
    md: ".5rem",
    lg: ".75rem",
    xl: "1.5rem",
  },
  components: {
    JoyAlert: {
      defaultProps: {
        variant: "soft",
        color: "danger",
        size: "sm",
      },
    },
    JoyAvatar: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          "--variant-borderWidth": ".125rem",
          ...(ownerState.size === "md" && {
            "--Avatar-size": "2.125rem",
          }),
        }),
      },
    },
    JoyBadge: {
      styleOverrides: {
        root: {
          [`.${sheetClasses.colorNeutral} &`]: {
            "--Badge-ringColor": "var(--palette-background-level2)",
          },
          [`.${sheetClasses.colorNeutral} .${listItemButtonClasses.colorNeutral}:hover &`]:
            {
              "--Badge-ringColor": "var(--palette-neutral-plainHoverBg)",
            },
        },
      },
    },
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          "--variant-borderWidth": ".125rem",
          ...(ownerState.variant === "plain" && {
            paddingInline: "0.5rem",

            "&:hover": {
              ...(ownerState.color === "primary" && {
                color: theme.vars.palette.primary[300],
              }),
              ...(ownerState.color === "success" && {
                color: theme.vars.palette.success[400],
              }),
              ...(ownerState.color === "warning" && {
                color: theme.vars.palette.warning[400],
              }),
              ...(ownerState.color === "danger" && {
                color: theme.vars.palette.danger[400],
              }),
              ...(ownerState.color === "neutral" && {
                color: theme.vars.palette.neutral[400],
              }),
            },
            "&:active": {
              ...(ownerState.color === "primary" && {
                color: theme.vars.palette.primary[500],
              }),
              ...(ownerState.color === "success" && {
                color: theme.vars.palette.success[600],
              }),
              ...(ownerState.color === "warning" && {
                color: theme.vars.palette.warning[600],
              }),
              ...(ownerState.color === "danger" && {
                color: theme.vars.palette.danger[600],
              }),
              ...(ownerState.color === "neutral" && {
                color: theme.vars.palette.neutral[200],
              }),
            },
            "&:hover, &:active": {
              backgroundColor: "transparent",
            },
          }),
        }),
      },
    },
    JoyCard: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          "--variant-borderWidth": ".125rem",

          ...(ownerState.variant === "solid" && {
            backgroundColor: theme.palette.background.level1,
          }),
        }),
      },
    },
    JoyCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover": {
            color: theme.palette.text.secondary,
          },
        }),
      },
    },
    JoyDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          gap: theme.spacing(1),
          padding: 0,
          flexDirection: "column",
          [`& .${buttonClasses.root}`]: {
            width: "100%",
            borderRadius: theme.radius.sm,
          },
        }),
      },
    },
    JoyDialogTitle: {
      defaultProps: {
        level: "h2",
      },
      styleOverrides: {
        root: {
          textAlign: "center",
          justifyContent: "center",
        },
      },
    },
    JoyFormControl: {
      styleOverrides: {
        root: ({ theme }) => ({
          [`&.${formControlClasses.error}`]: {
            "--FormHelperText-color": theme.palette.warning.plainColor,
          },
        }),
      },
    },
    JoyFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          "--FormLabel-color": theme.palette.text.secondary,
        }),
      },
    },
    JoyIconButton: {
      styleOverrides: {
        root: {
          "--variant-borderWidth": ".125rem",
          "--IconButton-radius": "50%",
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.md,
          [`&.${inputClasses.focused}`]: {
            backgroundColor: theme.palette.background.level2,
            "--Input-focusedHighlight": theme.palette.primary.outlinedColor,
          },
          [`&.${inputClasses.variantPlain}`]: {
            backgroundColor: "transparent",
            [`&.${inputClasses.focused}`]: {
              "--Input-focusedHighlight": "transparent",
            },
          },
          [`&.${inputClasses.colorDanger}`]: {
            "--variant-outlinedBorder": theme.palette.warning.plainColor,
            "--variant-outlinedColor": theme.palette.warning.plainColor,
          },
          paddingTop: theme.spacing(0.75),
          paddingBottom: theme.spacing(0.75),
        }),
        input: ({ theme }) => ({
          "::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 1,
          },
          [`&.${inputClasses.disabled}::placeholder`]: {
            color: theme.palette.text.tertiary,
          },
        }),
      },
    },
    JoySelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: theme.spacing(0.75),
          paddingBottom: theme.spacing(0.75),
          borderRadius: theme.radius.md,
          "--variant-outlinedColor": theme.palette.text.secondary,
          [`&.${selectClasses.focusVisible}`]: {
            backgroundColor: theme.palette.background.level2,
            borderColor: theme.palette.primary.outlinedColor,
            borderWidth: "0.125rem",
          },
          [`&.${selectClasses.colorDanger}`]: {
            "--variant-outlinedBorder": theme.palette.warning.plainColor,
            "--variant-outlinedHoverBg": theme.palette.warning.softBg,
          },
          "--Select-placeholderOpacity": 1,
          [`& .${selectClasses.indicator}.${selectClasses.expanded}`]: {
            transform: "rotate(-180deg)",
          },
          [`&.${selectClasses.expanded}`]: {
            borderWidth: "0.125rem",
            borderColor: theme.palette.primary.outlinedColor,
            backgroundColor: theme.palette.background.level2,
          },
        }),
        listbox: ({ theme }) => ({
          borderRadius: theme.radius.md,
          paddingBlock: 0,
        }),
      },
      defaultProps: {
        indicator: <ChevronDownIcon />,
      },
    },
    JoyTextarea: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: theme.spacing(0.75),
          paddingBottom: theme.spacing(0.75),
          borderRadius: theme.radius.md,
          [`&.${textareaClasses.focused}`]: {
            backgroundColor: theme.palette.background.level2,
            "--Textarea-focusedHighlight": theme.palette.primary.outlinedColor,
          },
          [`&.${textareaClasses.colorDanger}`]: {
            "--variant-outlinedBorder": theme.palette.warning.plainColor,
            "--variant-outlinedColor": theme.palette.warning.plainColor,
          },
          [`&.${textareaClasses.variantPlain}`]: {
            backgroundColor: "transparent",
            [`&.${textareaClasses.focused}`]: {
              "--Textarea-focusedHighlight": "transparent",
            },
          },
        }),

        textarea: ({ theme }) => ({
          "::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 1,
          },
          [`&.${textareaClasses.disabled}::placeholder`]: {
            color: theme.palette.text.tertiary,
          },
        }),
      },
    },
    JoyLinearProgress: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          flexGrow: 0,
          ...(ownerState.determinate &&
            ownerState.value !== undefined &&
            ownerState.value > 0 && {
              "&::before": {
                minWidth: "var(--LinearProgress-progressRadius)",
              },
            }),
        }),
      },
    },
    JoyModalClose: {
      styleOverrides: {
        root: ({ theme }) => ({
          "--variant-borderWidth": ".125rem",
          "--Icon-fontSize": "1rem",
          "--ModalClose-radius": "50%",
          "--ModalClose-inset": theme.spacing(2),
        }),
      },
    },
    JoyModalDialog: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.only("xs")]: {
            padding: theme.spacing(4),
            paddingTop: theme.spacing(9),
            top: 0,
            bottom: 0,
            transform: "translate(0, 0)",
            left: 0,
            right: 0,
            maxWidth: "unset",
            maxHeight: "unset",
            border: "unset",
            "--Card-radius": 0,
          },
          "--ModalDialog-rowGap": theme.spacing(3),
          padding: theme.spacing(9),
          paddingBottom: theme.spacing(6),
          rowGap: "var(--ModalDialog-rowGap)",
          "--ModalDialog-minWidth": "34.375rem",
          "--ModalDialog-maxWidth": "40.625rem",
          "--Card-radius": theme.radius.xl,
          backgroundColor: theme.palette.background.surface,
        }),
      },
    },
    JoyRadio: {
      styleOverrides: {
        root: {
          "& > svg": {
            display: "block",
          },
        },
      },
    },
    JoyRadioGroup: {
      styleOverrides: {
        root: {
          backgroundColor: "unset",
        },
      },
    },
    JoySheet: {
      defaultProps: {
        variant: "solid",
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          borderRadius: theme.radius.md,
          overflow: "hidden",

          ...(ownerState.variant === "plain" && {
            borderRadius: 0,
          }),

          ...(ownerState.variant === "solid" &&
            ownerState.color === "neutral" && {
              backgroundColor: theme.palette.background.level1,
            }),

          ...(ownerState.variant === "solid" &&
            ownerState.color === "danger" && {
              backgroundColor: theme.palette.danger[900],
            }),
        }),
      },
    },
    JoySkeleton: {
      defaultProps: {
        variant: "rectangular",
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant === "rectangular" && {
            width: "100%",
            borderRadius: theme.radius.md,
          }),
        }),
      },
    },
    JoySlider: {
      styleOverrides: {
        root: ({ theme }) => ({
          "--Slider-railBackground": theme.palette.background.level3,
          "--Slider-thumbBackground": "var(--Slider-railBackground)",

          [`&.${sliderClasses.disabled}, &:hover, &:active`]: {
            "--Slider-railBackground": theme.palette.background.level3,
          },

          [`&.${sliderClasses.sizeLg}`]: {
            "--Slider-trackSize": "0.5rem",
          },
        }),
        thumb: {
          [`.${sliderClasses.sizeLg} &: before`]: {
            borderWidth:
              "calc((var(--Slider-thumbWidth) - var(--Slider-trackSize)) / 2)",
          },
          "&[style*='right:']": {
            transform: "translate(50%, -50%)",
          },
        },
      },
    },
    JoyTable: {
      defaultProps: {
        borderAxis: "none",
        variant: "solid",
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.variant === "solid" && {
            "--Table-rowBackground": theme.palette.background.level1,
            "--TableCell-paddingY": theme.spacing(2),
            "--TableCell-paddingX": theme.spacing(2),
          }),
          "--TableCell-headBackground": "transparent",
          "--TableCell-footBackground": "transparent",
          "--Table-headerUnderlineThickness": 0,
          borderSpacing: `0 ${theme.spacing(1)}`,
          borderCollapse: "separate",
          backgroundColor: "unset",
          "& thead tr": {
            "& th": {
              height: "unset",
              "--TableCell-paddingY": 0,
            },
          },
          "& tfoot tr": {
            "& td": {
              "--TableCell-paddingX": 0,
              "--TableCell-paddingY": theme.spacing(2.5),
            },
          },
          "& tbody tr": {
            "& td": {
              backgroundColor: "var(--Table-rowBackground)",
              "&:first-of-type": {
                borderTopLeftRadius: theme.radius.sm,
                borderBottomLeftRadius: theme.radius.sm,
              },
              "&:last-of-type": {
                borderTopRightRadius: theme.radius.sm,
                borderBottomRightRadius: theme.radius.sm,
              },
            },
          },
        }),
      },
    },
    JoyTooltip: {
      defaultProps: {
        placement: "top",
        enterTouchDelay: MS_IN_SECOND / 3,
        leaveTouchDelay: MS_IN_SECOND,
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.color === "primary" &&
            ownerState.variant === "soft" && {
              backgroundColor: theme.palette.background.spotlight1,
            }),
        }),
        arrow: ({ ownerState, theme }) => ({
          ...(ownerState.color === "primary" &&
            ownerState.variant === "soft" && {
              "&::before": {
                borderColor: theme.palette.background.spotlight1,
              },
            }),
        }),
      },
    },
  },
})

const ThemeProvider = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <GlobalStyles
        styles={{
          "#root": {
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
          },

          ".notistack-Snackbar": {
            minWidth: 0,
          },

          ul: {
            paddingInlineStart: "1.5rem",
          },
        }}
      />
      {children}
    </CssVarsProvider>
  )
}

export { ThemeProvider }
