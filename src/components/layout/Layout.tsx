import { useState } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="layout-main flex-1 overflow-y-auto" style={{ minHeight: '100vh' }}>
        {/* Mobile header */}
        <div className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>
            Gym<span style={{ color: 'var(--accent-primary)' }}>CRM</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>

        <div className="bg-radial-dark min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
