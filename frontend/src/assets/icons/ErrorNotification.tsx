import { SvgIcon, type SvgIconProps } from "@mui/joy"

const ErrorNotificationIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <circle cx="27" cy="27" r="27" fill="#E52574" />
      <circle
        opacity="0.5"
        cx="27"
        cy="27"
        r="19.5"
        stroke="white"
        strokeWidth="3"
      />
      <rect x="19" y="20.0728" width="4" height="6" rx="2" fill="#D9D9D9" />
      <rect x="31" y="20.0728" width="4" height="6" rx="2" fill="#D9D9D9" />
      <path
        d="M21 34.5728V34.5728C24.4495 33.5777 28.0219 33.0728 31.612 33.0728H33"
        stroke="#D9D9D9"
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

export { ErrorNotificationIcon }
