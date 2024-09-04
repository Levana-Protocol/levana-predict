import { useMemo } from 'react'
import { Link, Stack } from '@mui/joy'
import { Link as RouterLink } from 'react-router-dom'

import { DESKTOP_BREAKPOINT } from '@utils/styles'

const TERMS_OF_SERVICE_URL = "https://static.levana.finance/legal/terms-of-service.pdf"
const PRIVACY_POLICY_URL = "https://static.levana.finance/legal/privacy-policy.pdf"
const DISCLAIMER_URL = "https://static.levana.finance/legal/disclaimer.pdf"
const RISK_DISCLOSURE_URL = "https://static.levana.finance/legal/risk-disclosure.pdf"

interface FooterLink {
  name: string,
  route: string,
}

const Footer = () => {
  const documentLinks: FooterLink[] = useMemo(() => [
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
  ], [])

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent={{ sm: "flex-end" }}
      alignItems="center"
      gap={2}
      sx={{ mt: 4, p: { xs: 2, [DESKTOP_BREAKPOINT]: 3 }}}
    >
      {documentLinks.map((link) =>
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
      )}
    </Stack>
  )
}

export { Footer }
