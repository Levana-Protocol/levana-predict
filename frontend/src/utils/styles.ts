import { Theme, useTheme } from '@mui/joy'
import { Breakpoint, SxProps, useMediaQuery } from '@mui/system'

const DESKTOP_BREAKPOINT = "lg" as const

/**
 * @returns an `SxProps` object that applies the given styles, up to (and including) a certain breakpoint.
 */
const stylesUpTo = (limit: Breakpoint, sx: SxProps<Theme>): SxProps<Theme> => {
  return (theme: Theme) => ({
    [theme.breakpoints.down(limit)]: sx,
  })
}

/**
 * @returns an `SxProps` object that applies the given styles, starting from (and including) a certain breakpoint.
 */
const stylesFrom = (limit: Breakpoint, sx: SxProps<Theme>): SxProps<Theme> => {
  return (theme: Theme) => ({
    [theme.breakpoints.up(limit)]: sx,
  })
}

/**
 * @returns an `SxProps` object that applies the given styles only at a certain breakpoint, and the given fallback for other breakpoints.
 */
const stylesOnlyAt = (limit: Breakpoint, sx: SxProps<Theme>, fallback?: SxProps<Theme>): SxProps<Theme> => {
  return mergeSx(
    (theme: Theme) => ({ [theme.breakpoints.not(limit)]: fallback }),
    (theme: Theme) => ({ [theme.breakpoints.only(limit)]: sx }),
  )
}

/**
 * @returns an `SxProps` object that hides the element it's applied to, up to (and including) a certain breakpoint.
 */
const hiddenUpTo = (limit: Breakpoint) => {
  return stylesUpTo(limit, { display: "none" })
}

/**
 * @returns an `SxProps` object that hides the element it's applied to, starting from (and including) a certain breakpoint.
 */
const hiddenFrom = (limit: Breakpoint) => {
  return stylesFrom(limit, { display: "none" })
}

/**
 * @returns the appropriate value for `grid-template-areas` so that it has the given areas expressed as a list of rows.
 *
 * @example
 * // returns `"top_left top_right" "bottom_left bottom_right"`
 * buildGridAreas(["top_left top_right", "bottom_left bottom_right"])
 */
const buildGridAreas = (rows: string[]): string => {
  return rows.map(row => `"${row}"`).join(" ")
}

/**
 * @returns the width that an element must have to take up the given percentage of space,
 * subtracting the gaps between items from the total space available.
 */
const widthMinusGap = (width: number, gap: string, items: number) => {
  return `calc(${width}% - ${gap} * ${(items - 1) / items})`
}

/**
 * Intended for responsive mobile tables.
 *
 * @returns the width that a table cell must have to take up the given percentage of space,
 * subtracting the gaps between cells from the total space available.
 */
const cellWidthMinusGap = (width: number, items: number) => {
  return widthMinusGap(width, "var(--TableCell-paddingX)", items)
}

/**
 * @returns `true` if the screen is at least as large as the given breakpoint, and `false` otherwise.
 */
const useScreenLargerThan = (breakpoint: Breakpoint) => {
  const theme = useTheme()
  // https://mui.com/material-ui/react-use-media-query/#usemediaquery-query-options-matches
  const matches = useMediaQuery(theme.breakpoints.up(breakpoint), { noSsr: true })

  return matches
}

/**
 * @returns `true` if the screen is at least as large as the given breakpoint, and `false` otherwise.
 */
const useScreenSmallerThan = (breakpoint: Breakpoint) => {
  const theme = useTheme()
  // https://mui.com/material-ui/react-use-media-query/#usemediaquery-query-options-matches
  const matches = useMediaQuery(theme.breakpoints.down(breakpoint), { noSsr: true })

  return matches
}

/**
 * @returns `true` if the screen is at least as large as the desktop breakpoint, and `false` otherwise.
 */
const useIsDesktop = () => {
  const isDesktop = useScreenLargerThan(DESKTOP_BREAKPOINT)
  return isDesktop
}

const useCurrentBreakpoint = (): Breakpoint => {
  const matchesXl = useScreenLargerThan("xl")
  const matchesLg = useScreenLargerThan("lg")
  const matchesMd = useScreenLargerThan("md")
  const matchesSm = useScreenLargerThan("sm")

  return matchesXl ? "xl" : matchesLg ? "lg" : matchesMd ? "md" : matchesSm ? "sm" : "xs"
}

/**
 * @returns the merge result of the given `sx` props. Later `sx` instances will override earlier ones.
 */
const mergeSx = (...sxs: (SxProps<Theme> | undefined)[]): SxProps<Theme> => {
  return sxs.flatMap(sx => Array.isArray(sx) ? sx : [sx])
}

export { stylesUpTo, hiddenUpTo , stylesFrom, hiddenFrom, stylesOnlyAt, buildGridAreas, widthMinusGap, cellWidthMinusGap, mergeSx }
export { useScreenLargerThan, useScreenSmallerThan, useIsDesktop, useCurrentBreakpoint, DESKTOP_BREAKPOINT }
