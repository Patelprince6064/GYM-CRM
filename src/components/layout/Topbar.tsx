import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { ROUTES } from '@/constants'
import { Avatar } from '@/components/ui'
import { NotificationPanel } from './NotificationPanel'

const TITLES: Record<string, { title: string; eyebrow: string }> = {
  [ROUTES.dashboard]: { title: 'Overview', eyebrow: 'Workspace' },
  [ROUTES.clients]: { title: 'Members', eyebrow: 'Workspace' },
  [ROUTES.memberships]: { title: 'Memberships', eyebrow: 'Workspace' },
  [ROUTES.reports]: { title: 'Reports', eyebrow: 'Workspace' },
  [ROUTES.workouts]: { title: 'Workout schedules', eyebrow: 'Operations' },
  [ROUTES.dailyUpdates]: { title: 'Daily logs', eyebrow: 'Operations' },
  [ROUTES.memberActivity]: { title: 'Activity & attendance', eyebrow: 'Operations' },
  [ROUTES.weight]: { title: 'Weight tracking', eyebrow: 'Operations' },
  [ROUTES.member]: { title: 'Member portal', eyebrow: 'Member view' },
  [ROUTES.memberDashboard]: { title: 'Member dashboard', eyebrow: 'Member view' },
}

interface TopbarProps {
  onOpenMenu: () => void
  onOpenSearch: () => void
}

export function Topbar({ onOpenMenu, onOpenSearch }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { notifications } = useData()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const meta = TITLES[location.pathname] ?? { title: 'GYM CRM', eyebrow: 'Workspace' }
  const unread = notifications.filter((n) => !n.read).length

  // Close the profile menu when the route changes underneath it. Adjusting
  // state during render is the React-recommended pattern here; an effect
  // would just cause a cascading second render.
  const [seenPath, setSeenPath] = useState(location.pathname)
  if (location.pathname !== seenPath) {
    setSeenPath(location.pathname)
    setProfileOpen(false)
  }

  useEffect(() => {
    if (!profileOpen) return
    const onDoc = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [profileOpen])

  const initials = useMemo(() => {
    const parts = (user?.name ?? 'Admin').trim().split(/\s+/)
    return ((parts[0]?.[0] ?? 'A') + (parts[1]?.[0] ?? '')).toUpperCase()
  }, [user?.name])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.landing)
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6"
      style={{
        height: 66,
        background: 'rgba(7,8,7,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      <button className="btn-icon lg:hidden" onClick={onOpenMenu} aria-label="Open navigation">
        <Menu size={17} />
      </button>

      <div className="min-w-0">
        <div className="text-[0.58rem] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--accent-primary)' }}>
          {meta.eyebrow}
        </div>
        <div className="text-[0.95rem] font-extrabold text-white tracking-tight truncate">{meta.title}</div>
      </div>

      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', minWidth: 230 }}
        aria-label="Open search"
      >
        <Search size={15} aria-hidden />
        <span className="text-[0.76rem] flex-1">Search members & pages</span>
        <kbd
          className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-faint)' }}
        >
          ⌘K
        </kbd>
      </button>
      <button className="btn-icon sm:hidden" onClick={onOpenSearch} aria-label="Open search">
        <Search size={17} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          className="btn-icon relative"
          onClick={() => setNotifOpen((v) => !v)}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          aria-expanded={notifOpen}
        >
          <Bell size={17} />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center"
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 17,
                height: 17,
                padding: '0 4px',
                borderRadius: 99,
                background: 'var(--accent-primary)',
                color: '#000000',
                fontSize: '0.6rem',
                fontWeight: 800,
                border: '2px solid var(--bg-primary)',
              }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </button>
        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)' }}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
        >
          <Avatar name={user?.name ?? 'Admin'} initials={initials} color="av-6" size={30} radius={9} />
          <span className="hidden md:block text-[0.76rem] font-semibold text-white max-w-[120px] truncate">
            {user?.name ?? 'Admin'}
          </span>
          <ChevronDown size={14} color="var(--text-muted)" aria-hidden />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="notifications-dropdown"
              style={{ width: 250, transformOrigin: 'top right', padding: 8 }}
              role="menu"
            >
              <div className="px-3 py-2.5">
                <div className="text-[0.82rem] font-bold text-white truncate">{user?.name}</div>
                <div className="text-[0.68rem] truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </div>
                <span className={`badge mt-2 ${user?.role === 'admin' ? 'badge-lime' : 'badge-neutral'}`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>
              <div className="hairline my-1" />
              <button
                onClick={() => {
                  setProfileOpen(false)
                  navigate(user?.role === 'admin' ? ROUTES.dashboard : ROUTES.member)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[0.8rem] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                role="menuitem"
              >
                <UserRound size={15} aria-hidden />
                {user?.role === 'admin' ? 'Dashboard' : 'My portal'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[0.8rem] transition-colors"
                style={{ color: '#fb7185' }}
                role="menuitem"
              >
                <LogOut size={15} aria-hidden />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
