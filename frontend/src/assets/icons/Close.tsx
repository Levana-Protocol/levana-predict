import SvgIcon, { type SvgIconProps } from "@mui/joy/SvgIcon"

const CloseIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <path d="M2 2L8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 8L8 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 10 10">
      <Svg />
    </SvgIcon>
  )
}

export { CloseIcon }
