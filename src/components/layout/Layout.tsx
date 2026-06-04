import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: '256px', minHeight: '100vh' }}
      >
        <div className="bg-radial-dark min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
