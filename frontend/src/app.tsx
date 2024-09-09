import { Stack } from '@mui/joy'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { Navbar } from '@common/Navbar'
import { Footer } from '@common/Footer'

const App = () => {
  return (
    <Stack gap={3} sx={{ flex: 1 }}>
      <Navbar />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </Stack>
  )
}

export { App }
