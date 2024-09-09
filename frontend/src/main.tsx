import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter'
import './main.css'

import { ChainProvider } from '@config/chain'
import { NotificationsProvider } from '@config/notifications'
import { QueryClientProvider } from '@config/queries'
import { RouterProvider } from '@config/router'
import { ThemeProvider } from '@config/theme'
import { ModalsProvider } from '@state/modals'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationsProvider>
        <ChainProvider>
          <QueryClientProvider>
            <ModalsProvider>
              <RouterProvider />
            </ModalsProvider>
          </QueryClientProvider>
        </ChainProvider>
      </NotificationsProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
