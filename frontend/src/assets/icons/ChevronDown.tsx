import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon'

const ChevronDownIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <path d="M16.59 8.29492L12 12.8749L7.41 8.29492L6 9.70492L12 15.7049L18 9.70492L16.59 8.29492Z" />
  )

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <Svg />
    </SvgIcon>
  )
}

export { ChevronDownIcon }
