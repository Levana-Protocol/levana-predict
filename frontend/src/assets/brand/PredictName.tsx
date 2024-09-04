import { SvgIcon, SvgIconProps } from '@mui/joy'

import { mergeSx } from '@utils/styles'

const PredictName = (props: SvgIconProps) => {
  const { width = 72 } = props

  return (
    <SvgIcon
      {...props}
      viewBox="0 0 72 10"
      sx={mergeSx({ width, height: "100%" }, props.sx)}
    >
      <path d="M0.192871 9.72736V0.272816H3.92298C4.64008 0.272816 5.25099 0.409772 5.75573 0.683683C6.26046 0.954516 6.64517 1.33153 6.90985 1.81472C7.1776 2.29483 7.31148 2.84881 7.31148 3.47665C7.31148 4.10449 7.17606 4.65847 6.90523 5.13858C6.6344 5.6187 6.242 5.99263 5.72803 6.26039C5.21714 6.52814 4.59853 6.66202 3.8722 6.66202H1.49472V5.0601H3.54905C3.93376 5.0601 4.25075 4.99393 4.50004 4.86159C4.75241 4.72618 4.94015 4.53998 5.06325 4.303C5.18944 4.06294 5.25253 3.78749 5.25253 3.47665C5.25253 3.16273 5.18944 2.88882 5.06325 2.65492C4.94015 2.41794 4.75241 2.23482 4.50004 2.10556C4.24768 1.97322 3.9276 1.90705 3.53982 1.90705H2.19181V9.72736H0.192871Z" fill="white" />
      <path d="M11.3399 9.72736V0.272816H15.07C15.784 0.272816 16.3934 0.400539 16.8981 0.655984C17.4059 0.908351 17.7922 1.2669 18.0568 1.73162C18.3246 2.19327 18.4585 2.73648 18.4585 3.36124C18.4585 3.98908 18.3231 4.52921 18.0522 4.98162C17.7814 5.43096 17.389 5.77566 16.875 6.01571C16.3641 6.25577 15.7455 6.3758 15.0192 6.3758H12.5217V4.76927H14.696C15.0777 4.76927 15.3947 4.71695 15.647 4.61231C15.8994 4.50766 16.0871 4.3507 16.2102 4.14142C16.3364 3.93214 16.3995 3.67208 16.3995 3.36124C16.3995 3.04732 16.3364 2.78264 16.2102 2.56721C16.0871 2.35177 15.8979 2.18865 15.6424 2.07786C15.3901 1.96399 15.0715 1.90705 14.6868 1.90705H13.3388V9.72736H11.3399ZM16.4457 5.42481L18.7955 9.72736H16.5888L14.2898 5.42481H16.4457Z" fill="white" />
      <path d="M22.6011 9.72736V0.272816H28.9719V1.9209H24.6V4.17374H28.6441V5.82182H24.6V8.07928H28.9903V9.72736H22.6011Z" fill="white" />
      <path d="M36.6426 9.72736H33.2911V0.272816H36.6703C37.6213 0.272816 38.44 0.462092 39.1263 0.840643C39.8126 1.21612 40.3404 1.75624 40.7098 2.46103C41.0821 3.16581 41.2683 4.00909 41.2683 4.99086C41.2683 5.9757 41.0821 6.82206 40.7098 7.52992C40.3404 8.23778 39.8095 8.78098 39.1171 9.15954C38.4277 9.53809 37.6029 9.72736 36.6426 9.72736ZM35.29 8.01465H36.5595C37.1504 8.01465 37.6475 7.91001 38.0507 7.70073C38.4569 7.48837 38.7616 7.1606 38.9647 6.71742C39.1709 6.27116 39.274 5.69564 39.274 4.99086C39.274 4.29223 39.1709 3.72132 38.9647 3.27814C38.7616 2.83496 38.4585 2.50873 38.0553 2.29945C37.6521 2.09017 37.1551 1.98553 36.5642 1.98553H35.29V8.01465Z" fill="white" />
      <path d="M47.478 0.272816V9.72736H45.4791V0.272816H47.478Z" fill="white" />
      <path d="M60.1946 3.58283H58.1726C58.1357 3.32123 58.0603 3.08887 57.9464 2.88574C57.8325 2.67954 57.6863 2.50411 57.5078 2.35946C57.3293 2.21481 57.1231 2.10402 56.8892 2.02708C56.6584 1.95014 56.4076 1.91167 56.1367 1.91167C55.6474 1.91167 55.2211 2.03323 54.858 2.27637C54.4948 2.51642 54.2132 2.86728 54.0131 3.32892C53.8131 3.78749 53.7131 4.34455 53.7131 5.00009C53.7131 5.67409 53.8131 6.24038 54.0131 6.69895C54.2163 7.15752 54.4994 7.50376 54.8626 7.73766C55.2257 7.97156 55.6458 8.08851 56.1229 8.08851C56.3906 8.08851 56.6384 8.05312 56.8661 7.98233C57.097 7.91155 57.3016 7.80845 57.4801 7.67303C57.6586 7.53453 57.8064 7.3668 57.9233 7.16983C58.0433 6.97286 58.1264 6.7482 58.1726 6.49583L60.1946 6.50506C60.1423 6.93901 60.0115 7.35757 59.8022 7.76074C59.596 8.16084 59.3175 8.51938 58.9666 8.83638C58.6189 9.1503 58.2034 9.39959 57.7202 9.58425C57.2401 9.76583 56.6969 9.85662 56.0906 9.85662C55.2473 9.85662 54.4933 9.66581 53.8285 9.28418C53.1668 8.90255 52.6436 8.35011 52.2589 7.62686C51.8773 6.90362 51.6864 6.02802 51.6864 5.00009C51.6864 3.96908 51.8803 3.09195 52.2681 2.3687C52.6559 1.64545 53.1822 1.09455 53.847 0.715998C54.5117 0.334369 55.2596 0.143555 56.0906 0.143555C56.6384 0.143555 57.1462 0.220496 57.614 0.374379C58.0849 0.528261 58.5019 0.75293 58.8651 1.04838C59.2282 1.34076 59.5237 1.69931 59.7514 2.12402C59.9823 2.54874 60.13 3.03501 60.1946 3.58283Z" fill="white" />
      <path d="M63.9979 1.9209V0.272816H71.7629V1.9209H68.8683V9.72736H66.8925V1.9209H63.9979Z" fill="white" />
    </SvgIcon>
  )
}

export { PredictName }
