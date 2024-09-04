import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter'
import './main.css'

import { ThemeProvider } from '@config/theme'
import { RouterProvider } from '@config/router'
import { ChainProvider } from '@config/chain'
import { ModalsProvider } from '@state/modals'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChainProvider>
        <ModalsProvider>
          <RouterProvider />
        </ModalsProvider>
      </ChainProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
