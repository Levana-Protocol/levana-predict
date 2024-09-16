import type { PropsWithChildren } from "react"
import axios from "axios"
import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      retry: false,
    },
  },
})

const QueryClientProvider = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  )
}

const axiosClient = axios.create()

export { axiosClient, queryClient, QueryClientProvider }
