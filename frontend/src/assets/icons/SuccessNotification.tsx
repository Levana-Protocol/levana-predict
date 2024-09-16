import { SvgIcon, SvgIconProps } from "@mui/joy"

const SuccessNotificationIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <circle cx="27" cy="27" r="27" fill="#44C194" />
      <circle
        opacity="0.5"
        cx="26.9997"
        cy="27"
        r="19.9773"
        stroke="white"
        strokeWidth="3"
      />
      <path
        d="M21.4775 28.1206L22.6685 29.3892C23.638 30.422 25.2781 30.422 26.2476 29.3892L32.523 22.7046"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 54 54">
      <Svg />
    </SvgIcon>
  )
}

export { SuccessNotificationIcon }
