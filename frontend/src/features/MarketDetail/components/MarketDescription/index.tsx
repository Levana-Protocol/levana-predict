import { Box, List, ListItem, Typography } from "@mui/joy"

import type { Market } from "@api/queries/Market"
import type { StyleProps } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"
import { CONTRACT_ADDRESS } from "@config/environment"

const MarketDescription = (props: StyleProps) => {
  return (
    <LoadableWidget
      useDeps={useSuspenseCurrentMarket}
      renderContent={(market) => <MarketDescriptionContent market={market} />}
      placeholderContent={<MarketDescriptionPlaceholder />}
      sx={props.sx}
    />
  )
}

const MarketDescriptionContent = (props: { market: Market }) => {
  const { market } = props

  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      {CONTRACT_ADDRESS ===
        "neutron14r4gqjhnuxzwcmypjle9grlksvjeyyy0mrw0965rdz5v3v5wcv6qjf8w55" &&
      market.id === "1" ? (
        <MainnetOneDescription />
      ) : (
        <Typography level="body-md" whiteSpace="pre-line">
          {market.description}
        </Typography>
      )}
    </>
  )
}

const MainnetOneDescription = () => {
  return (
    <>
      <Typography level="body-md">
        This market tracks whether Donald Trump wins the presidency in the US
        elections of 2024. This market will settle "Yes" if either of the
        following two conditions occurs:
      </Typography>
      <List>
        <ListItem>
          <Typography level="body-md">
            Donald Trump's primary opponent, Kamala Harris, concedes the
            election to Donald Trump.
          </Typography>
        </ListItem>
        <ListItem>
          <Typography level="body-md">
            Donald Trump is inaugurated as president
          </Typography>
        </ListItem>
      </List>
      <Typography level="body-md">
        By contrast, this market will settle "No" if either of the following two
        conditions occurs:
      </Typography>
      <List>
        <ListItem>
          <Typography level="body-md">
            Donald Trump concedes the election
          </Typography>
        </ListItem>
        <ListItem>
          <Typography level="body-md">
            Any other person is inaugurated as president
          </Typography>
        </ListItem>
      </List>
      <Typography level="body-md">
        Note that, in the event of a contested election, this market may not
        settle until January 2025, or if there are further uncertainties of the
        outcome, may be further delayed.
      </Typography>
    </>
  )
}

const MarketDescriptionPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      <Box
        width={(theme) => theme.spacing(1)}
        height={(theme) => theme.spacing(10)}
      />
    </>
  )
}

export { MarketDescription }
