import { useMemo } from "react"
import { Link, Stack } from "@mui/joy"
import { Link as RouterLink } from "react-router-dom"

import { DESKTOP_BREAKPOINT } from "@utils/styles"
import { GithubIcon } from "@assets/icons/Github"

const TERMS_OF_SERVICE_URL =
  "https://static.levana.finance/legal/terms-of-service.pdf"
const PRIVACY_POLICY_URL =
  "https://static.levana.finance/legal/privacy-policy.pdf"
const DISCLAIMER_URL = "https://static.levana.finance/legal/disclaimer.pdf"
const RISK_DISCLOSURE_URL =
  "https://static.levana.finance/legal/risk-disclosure.pdf"
const REPOSITORY_URL = "https://github.com/Levana-Protocol/levana-predict"

interface FooterLink {
  name: string
  route: string
}

const Footer = () => {
  const documentLinks: FooterLink[] = useMemo(
    () => [
      {
        name: "Terms of Service",
        route: TERMS_OF_SERVICE_URL,
      },
      {
        name: "Privacy Policy",
        route: PRIVACY_POLICY_URL,
      },
      {
        name: "Disclaimer",
        route: DISCLAIMER_URL,
      },
      {
        name: "Risk Disclosure",
        route: RISK_DISCLOSURE_URL,
      },
    ],
    [],
  )

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent={{ sm: "flex-end" }}
      alignItems="center"
      gap={2}
      sx={{ mt: 4, p: { xs: 2, [DESKTOP_BREAKPOINT]: 3 } }}
    >
      <Link
        component={RouterLink}
        to={REPOSITORY_URL}
        title="View source code"
        aria-label="Open repository"
        target="_blank"
        rel="noreferrer"
        color="neutral"
        fontSize="sm"
        startDecorator={<GithubIcon sx={{ mb: 0.25 }} />}
        sx={{ p: 1 }}
      >
        View source
      </Link>

      {documentLinks.map((link) => (
        <Link
          component={RouterLink}
          key={link.name}
          to={link.route}
          title={`"${link.name}" document`}
          aria-label={`Open "${link.name}" document`}
          target="_blank"
          rel="noreferrer"
          color="neutral"
          fontSize="sm"
          sx={{ p: 1 }}
        >
          {link.name}
        </Link>
      ))}
    </Stack>
  )
}

export { Footer }
