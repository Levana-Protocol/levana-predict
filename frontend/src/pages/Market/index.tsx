import { routes } from '@config/router'
import { BasePage } from '@common/BasePage'
import { PageTitle } from '@common/PageTitle'

const MarketPage = () => {
  return (
    <BasePage>
      <PageTitle backTo={{ route: routes.markets, name: "Markets page" }}>
        Market
      </PageTitle>
    </BasePage>
  )
}

export { MarketPage }
