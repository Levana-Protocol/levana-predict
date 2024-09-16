import { SvgIcon, type SvgIconProps } from "@mui/joy"

const TickIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <path d="M8.79496 15.875L4.62496 11.705L3.20496 13.115L8.79496 18.705L20.795 6.705L19.385 5.295L8.79496 15.875Z" />
  )

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <Svg />
    </SvgIcon>
  )
}

export { TickIcon }
