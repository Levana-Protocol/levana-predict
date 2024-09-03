import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter'
import './main.css'

import { ThemeProvider } from '@config/theme'
import { RouterProvider } from '@config/router'
import { ChainProvider } from '@config/chain'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChainProvider>
        <RouterProvider />
      </ChainProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
