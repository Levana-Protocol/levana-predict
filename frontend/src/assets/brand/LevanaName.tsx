import { SvgIcon, SvgIconProps } from '@mui/joy'

import { mergeSx } from '@utils/styles'

const LevanaName = (props: SvgIconProps) => {
  const { width = 73 } = props

  return (
    <SvgIcon
      {...props}
      viewBox="0 0 73 11"
      sx={mergeSx({ width, height: "100%" }, props.sx )}
    >
      <path d="M3.30016 8.86744H6.57016V10.7433H0.847656V0.619141H3.30016V8.86744Z" />
      <path d="M13.4535 2.56684V4.68614H16.8812V6.53324H13.4535V8.78154H17.3115V10.7433H11.001V0.619141H17.3115V2.56684H13.4535Z" />
      <path d="M23.894 0.619141L26.3752 8.23744L28.8563 0.619141H31.4808L27.9527 10.7433H24.7834L21.2695 0.619141H23.894Z" />
      <path d="M41.3772 7.03442L40.1151 3.31132L38.8388 7.03442H41.3772ZM42.0083 8.89612H38.2078L37.5767 10.7434H34.9951L38.7097 0.690918H41.5349L45.2494 10.7434H42.6393L42.0083 8.89612Z" />
      <path d="M58.4862 10.7433H56.0337L51.9319 4.52864V10.7433H49.4795V0.619141H51.9319L56.0337 6.89114V0.619141H58.4862V10.7433Z" />
      <path d="M69.1284 7.03442L67.8664 3.31132L66.5894 7.03442H69.1284ZM69.7594 8.89612H65.9584L65.3274 10.7434H62.7461L66.4604 0.690918H69.2864L73.0004 10.7434H70.3904L69.7594 8.89612Z" />
    </SvgIcon>
  )
}

export { LevanaName }