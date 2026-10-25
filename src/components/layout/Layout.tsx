import { useCallback, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import { Topbar } from './Topbar'
import { GlobalSearch } from './GlobalSearch'
import { useGlobalSearchShortcut } from '@/lib/useGlobalSearchShortcut'

interface LayoutProps {
  children: ReactNode
}

const COLLAPSE_KEY = 'gym_crm_sidebar_collapsed'

/**
 * Admin/member shell: fixed navigation rail, sticky top bar, and the
 * ⌘K palette. The sidebar collapses on desktop and becomes an off-canvas
 * drawer below 1024px.
 */
export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(COLLAPSE_KEY) === '1',
  )

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSearch = useCallback(() => setSearchOpen((v) => !v), [])
  useGlobalSearchShortcut(toggleSearch)

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        /* storage may be unavailable — the preference just won't persist */
      }
      return next
    })
  }

  return (
    <div
      className={`layout-root ${collapsed ? 'sidebar-collapsed' : ''}`}
      style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
    >
      {sidebarOpen && <div className="sidebar-overlay lg:hidden" onClick={closeSidebar} />}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div className="layout-main">
        <Topbar onOpenMenu={() => setSidebarOpen(true)} onOpenSearch={toggleSearch} />
        <main id="main-content">{children}</main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
