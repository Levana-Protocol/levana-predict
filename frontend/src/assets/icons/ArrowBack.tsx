import SvgIcon, { SvgIconProps } from "@mui/joy/SvgIcon"

const ArrowBackIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  )

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <Svg />
    </SvgIcon>
  )
}

export { ArrowBackIcon }
