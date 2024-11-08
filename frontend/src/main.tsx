import React from "react"
import ReactDOM from "react-dom/client"
import ThemeProvider from "@levana-protocol/ui/ThemeProvider"
import { ModalProvider } from "@levana-protocol/utils/modal"

import "@fontsource/inter"
import "./main.css"

import { ChainProvider } from "@config/chain"
import { NotificationsProvider } from "@config/notifications"
import { QueryClientProvider } from "@config/queries"
import { RouterProvider } from "@config/router"
import { TimestampsHandler } from "@state/timestamps"

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <ThemeProvider variant="levana">
      <NotificationsProvider>
        <ChainProvider>
          <TimestampsHandler>
            <QueryClientProvider>
              <ModalProvider />
              <RouterProvider />
            </QueryClientProvider>
          </TimestampsHandler>
        </ChainProvider>
      </NotificationsProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
