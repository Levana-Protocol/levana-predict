import { useNavigate } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/joy'

import { DESKTOP_BREAKPOINT } from '@utils/styles'
import { NavbarLogo } from '@common/Navbar/Logo'
import { Footer } from '@common/Footer'
import { BasePage } from '../BasePage'

const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <Stack gap={3} sx={{ flex: 1 }}>
      <Box sx={{ p: { xs: 2, [DESKTOP_BREAKPOINT]: 3 } }}>
        <NavbarLogo />
      </Box>
      <BasePage>
        <Typography level="h2">Whoops...</Typography>

        <Box>
          <Typography level="body-md">Something went wrong.</Typography>
        </Box>

        <Button
          size="lg"
          sx={{ width: "max-content" }}
          aria-label="Back to previous page"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </BasePage>
      <Footer />
    </Stack>
  )
}

export { ErrorPage }
