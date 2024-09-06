import { Navigate } from 'react-router-dom'

import { routes } from '@config/router'

const MarketsPage = () => <Navigate to={routes.market("1")} /> // ToDo: implement markets page

export { MarketsPage }
