import { SvgIcon, SvgIconProps } from '@mui/joy'

const QuestionMarkIcon = (props: SvgIconProps) => {
  const Svg = () => (
    <g>
      <path d="M4.00084 7.77706C4.67894 7.77706 5.34182 7.57598 5.90565 7.19925C6.46947 6.82251 6.90892 6.28704 7.16842 5.66055C7.42792 5.03406 7.49582 4.34469 7.36353 3.67961C7.23124 3.01453 6.9047 2.40362 6.4252 1.92413C5.94571 1.44463 5.3348 1.11809 4.66972 0.985801C4.00464 0.853509 3.31527 0.921406 2.68878 1.18091C2.06229 1.44041 1.52682 1.87986 1.15008 2.44368C0.773348 3.00751 0.572266 3.67039 0.572266 4.34849L2.26055 4.34849C2.26055 4.0043 2.36261 3.66783 2.55384 3.38164C2.74506 3.09545 3.01686 2.87239 3.33486 2.74067C3.65285 2.60896 4.00277 2.57449 4.34035 2.64164C4.67793 2.70879 4.98802 2.87454 5.23141 3.11792C5.47479 3.36131 5.64054 3.6714 5.70769 4.00898C5.77484 4.34656 5.74037 4.69648 5.60865 5.01447C5.47694 5.33247 5.25388 5.60427 4.96769 5.79549C4.6815 5.98672 4.34503 6.08878 4.00084 6.08878L4.00084 7.77706Z" />
      <rect x="2.85742" y="6.08984" width="2.09738" height="2.01025" />
      <circle cx="3.97803" cy="10.1606" r="1.2085" />
    </g>
  )

  return (
    <SvgIcon {...props} viewBox="0 0 8 12">
      <Svg />
    </SvgIcon>
  )
}

export { QuestionMarkIcon }
