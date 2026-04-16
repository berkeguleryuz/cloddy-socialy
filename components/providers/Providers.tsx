"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { Web3Provider } from "./Web3Provider"
import { AuthProvider } from "../AuthContext"

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1d2333',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              },
              className: 'font-medium',
            }}
            theme="dark"
            richColors
            closeButton
          />
        </AuthProvider>
      </Web3Provider>
    </QueryClientProvider>
  )
}

export default Providers
