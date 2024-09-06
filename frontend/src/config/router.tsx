import { Navigate, createBrowserRouter, RouterProvider as ReactRouterProvider, generatePath } from 'react-router-dom'

import { App } from 'app'
import { MarketId } from '@api/queries/Market'
import { ErrorPage } from '@common/ErrorPage'
import { MarketPage } from '@pages/Market'
import { MarketsPage } from '@pages/Markets'

const routesBuilder = {
  markets: {
    segment: "markets" as const,
    get: () => routesBuilder.markets.segment,
    market: {
      segment: ":marketId" as const,
      get: () => `${routesBuilder.markets.segment}/${routesBuilder.markets.market.segment}` as const,
    },
  },
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to={routesBuilder.markets.get()} />
      },
      {
        path: routesBuilder.markets.market.get(),
        element: <MarketPage />,
      },
      {
        path: routesBuilder.markets.get(),
        element: <MarketsPage />,
      },
    ],
  },
])

const RouterProvider = () => {
  return (
    <ReactRouterProvider router={router} />
  )
}

const routes = {
  markets: `/${routesBuilder.markets.get()}`,
  market: (marketId: MarketId) => generatePath(`/${routesBuilder.markets.market.get()}`, { marketId })
}

export { routes, RouterProvider }
