import { SvgIcon, SvgIconProps } from '@mui/joy'

const WarningNotificationIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <circle cx="27" cy="27" r="27" fill="#FFB82E"/>
      <circle opacity="0.5" cx="27" cy="27" r="19.5" stroke="white" strokeWidth="3"/>
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 54 54">
      <Svg />
    </SvgIcon>
  )
}

export { WarningNotificationIcon }
