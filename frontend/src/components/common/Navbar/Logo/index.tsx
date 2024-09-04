import { NavLink } from 'react-router-dom'

import { routes } from '@config/router'
import { PredictLogo } from '@assets/brand/PredictLogo'

const NavbarLogo = () => {
  return (
    <NavLink to={routes.markets} aria-label="Go to home page">
      <PredictLogo />
    </NavLink>
  )
}

export { NavbarLogo }
