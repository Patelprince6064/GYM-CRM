import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { ToastProvider } from '@/components/ui'

/** All global providers in one place (router + auth + data + toasts). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>{children}</ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
