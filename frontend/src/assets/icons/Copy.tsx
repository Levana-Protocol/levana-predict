import { SvgIcon, type SvgIconProps } from "@mui/joy"

const CopyIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.99994 5.7C2.99994 4.20883 4.20877 3 5.69994 3H11.9999C13.4911 3 14.6999 4.20883 14.6999 5.7V7.5H11.9999C9.51466 7.5 7.49994 9.51472 7.49994 12V14.7H5.69994C4.20877 14.7 2.99994 13.4912 2.99994 12V5.7ZM11.9999 9.3C10.5088 9.3 9.29994 10.5088 9.29994 12V18.3C9.29994 19.7912 10.5088 21 11.9999 21H18.2999C19.7911 21 20.9999 19.7912 20.9999 18.3V12C20.9999 10.5088 19.7911 9.3 18.2999 9.3H11.9999Z"
    />
  )

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <Svg />
    </SvgIcon>
  )
}

export { CopyIcon }
