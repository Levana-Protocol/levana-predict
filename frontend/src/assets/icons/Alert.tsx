import SvgIcon, { type SvgIconProps } from "@mui/joy/SvgIcon"

const AlertIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <path
        d="M0.384766 8C0.384766 3.58172 3.96649 0 8.38477 0H16.3848C20.803 0 24.3848 3.58172 24.3848 8V16C24.3848 20.4183 20.803 24 16.3848 24H8.38477C3.96649 24 0.384766 20.4183 0.384766 16V8Z"
        fill="#921247"
      />
      <rect
        x="13.7847"
        y="19"
        width="2.8"
        height="2.8"
        rx="1.4"
        transform="rotate(180 13.7847 19)"
        fill="#4e0926"
      />
      <rect
        x="13.7847"
        y="13.4"
        width="2.8"
        height="8.4"
        rx="1.4"
        transform="rotate(180 13.7847 13.4)"
        fill="#4e0926"
      />
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 25 24">
      <Svg />
    </SvgIcon>
  )
}

export { AlertIcon }
