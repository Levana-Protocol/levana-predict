import { match } from "ts-pattern"
import { Box, Divider, Link, List, ListItem, Typography } from "@mui/joy"
import { Link as RouterLink } from "react-router-dom"
import Markdown from "react-markdown"

import { CONTRACT_ADDRESS } from "@config/environment"
import type { Market } from "@api/queries/Market"
import type { StyleProps } from "@utils/styles"
import { LoadableWidget } from "@lib/Loadable/Widget"
import { useSuspenseCurrentMarket } from "@features/MarketDetail/utils"

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

      <Markdown
        allowedElements={[
          "a",
          "em",
          "strong",
          "hr",
          "h1",
          "h2",
          "h3",
          "p",
          "li",
          "ul",
          "ol",
          "br",
        ]}
        components={{
          a: (props) => (
            <Link
              component={RouterLink}
              to={props.href ?? ""}
              title={props.title}
              aria-label={props["aria-label"]}
              target="_blank"
              rel="noreferrer"
              color="neutral"
              sx={{ textDecoration: "underline" }}
            >
              {props.children}
            </Link>
          ),
          em: (props) => (
            <Typography fontStyle="italic">{props.children}</Typography>
          ),
          strong: (props) => (
            <Typography fontWeight={600}>{props.children}</Typography>
          ),
          hr: () => <Divider sx={{ my: 2 }} />,
          h1: (props) => (
            <Typography
              textColor="text.secondary"
              fontSize="1.25rem"
              fontWeight={600}
              sx={{ mb: 0.75 }}
            >
              {props.children}
            </Typography>
          ),
          h2: (props) => (
            <Typography
              textColor="text.secondary"
              fontSize="1.1rem"
              fontWeight={600}
              sx={{ mb: 0.6 }}
            >
              {props.children}
            </Typography>
          ),
          h3: (props) => (
            <Typography
              textColor="text.secondary"
              fontSize="1rem"
              fontWeight={600}
              sx={{ mb: 0.5 }}
            >
              {props.children}
            </Typography>
          ),
          p: (props) => (
            <Typography level="body-md">{props.children}</Typography>
          ),
          li: (props) => (
            <ListItem sx={{ color: (theme) => theme.palette.text.secondary }}>
              <Typography>{props.children}</Typography>
            </ListItem>
          ),
          ul: (props) => <List marker="disc">{props.children}</List>,
          ol: (props) => <List marker="decimal">{props.children}</List>,
          br: () => <br />,
        }}
      >
        {getDescription(market)}
      </Markdown>
    </>
  )
}

const getDescription = (market: Market): string => {
  return match({ contract: CONTRACT_ADDRESS, marketId: market.id })
    .with(
      {
        contract: MAINNET_ONE_CONTRACT,
        marketId: "1",
      },
      () => MAINNET_ONE_DESCRIPTION,
    )
    .otherwise(() => market.description)
}

const MAINNET_ONE_CONTRACT =
  "neutron14r4gqjhnuxzwcmypjle9grlksvjeyyy0mrw0965rdz5v3v5wcv6qjf8w55"

const MAINNET_ONE_DESCRIPTION = `\
This market tracks whether Donald Trump wins the presidency in the US
elections of 2024. This market will settle "Yes" if either of the
following two conditions occurs:

- Donald Trump's primary opponent, Kamala Harris, concedes the election to Donald Trump.
- Donald Trump is inaugurated as president.

By contrast, this market will settle "No" if either of the following two conditions occurs:

- Donald Trump concedes the election.
- Any other person is inaugurated as president.

Note that, in the event of a contested election, this market may not
settle until January 2025, or if there are further uncertainties of the
outcome, may be further delayed.
`

const MarketDescriptionPlaceholder = () => {
  return (
    <>
      <Typography level="title-md" fontWeight={600} sx={{ mb: 2 }}>
        Description
      </Typography>

      <Box
        width={(theme) => theme.spacing(1)}
        height={(theme) => theme.spacing(12)}
      />
    </>
  )
}

export { MarketDescription }
