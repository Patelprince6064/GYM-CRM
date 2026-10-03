import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'

/** All global providers in one place (router + auth + data). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>{children}</DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
