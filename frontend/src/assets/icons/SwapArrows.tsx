import { SvgIcon, SvgIconProps } from '@mui/joy'

const SwapArrowsIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.75001 6L11.3195 10.1643C11.589 10.4788 11.5526 10.9523 11.2381 11.2219C10.9236 11.4915 10.4501 11.455 10.1806 11.1405L8.50001 9.17989V17.1524C8.50001 17.5667 8.16423 17.9024 7.75001 17.9024C7.3358 17.9024 7.00001 17.5667 7.00001 17.1524V9.17989L5.31946 11.1405C5.04989 11.455 4.57641 11.4915 4.26192 11.2219C3.94743 10.9523 3.911 10.4788 4.18057 10.1643L7.75001 6Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.75 18.3049L19.3195 14.1405C19.589 13.826 19.5526 13.3526 19.2381 13.083C18.9236 12.8134 18.4501 12.8499 18.1806 13.1643L16.5 15.125V7.15244C16.5 6.73823 16.1642 6.40244 15.75 6.40244C15.3358 6.40244 15 6.73823 15 7.15244V15.125L13.3195 13.1643C13.0499 12.8499 12.5764 12.8134 12.2619 13.083C11.9474 13.3526 11.911 13.826 12.1806 14.1405L15.75 18.3049Z"
      />
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <Svg />
    </SvgIcon>
  )
}

export { SwapArrowsIcon }
