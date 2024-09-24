import { SvgIcon, type SvgIconProps } from "@mui/joy"

const InfoIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <rect x="0.375" y="0.375" width="2.25" height="2.25" rx="1.125" />
      <rect x="0.375" y="4.875" width="2.25" height="6.75" rx="1.125" />
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 3 12">
      <Svg />
    </SvgIcon>
  )
}

export { InfoIcon }
