import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  ArrowLeftRight,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserRound,
  Users,
  Weight,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { ROUTES } from '@/constants'
import { Logo } from '@/components/brand/Logo'
import { Avatar } from '@/components/ui'
import { membershipPhase, DEFAULT_RULES } from '@/lib/insights'

interface NavItem {
  label: string
  icon: typeof Users
  path: string
}

interface NavGroup {
  label: string
  items: NavItem[]
  /** Roles allowed to see this group. */
  roles?: ('admin' | 'user')[]
}

const GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    roles: ['admin'],
    items: [
      { label: 'Overview', icon: LayoutDashboard, path: ROUTES.dashboard },
      { label: 'Members', icon: Users, path: ROUTES.clients },
      { label: 'Memberships', icon: ArrowLeftRight, path: ROUTES.memberships },
      { label: 'Reports', icon: FileBarChart, path: ROUTES.reports },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Daily logs', icon: ClipboardList, path: ROUTES.dailyUpdates },
      { label: 'Activity & attendance', icon: Activity, path: ROUTES.memberActivity },
      { label: 'Workout schedules', icon: CalendarDays, path: ROUTES.workouts },
      { label: 'Weight tracking', icon: Weight, path: ROUTES.weight },
    ],
  },
  {
    label: 'Member view',
    items: [
      { label: 'Member portal', icon: UserRound, path: ROUTES.member },
      { label: 'Member dashboard', icon: LibraryBig, path: ROUTES.memberDashboard },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  /** Desktop icon-rail mode. */
  collapsed: boolean
  onToggleCollapsed: () => void
}

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapsed }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const reduce = useReducedMotion()
  const { user, logout } = useAuth()
  const { clients, isBackendConnected } = useData()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => onClose(), [location.pathname, onClose])

  const isAdmin = user?.role === 'admin'
  const phases = clients.map((c) => membershipPhase(c, new Date(), DEFAULT_RULES))
  const activeCount = phases.filter((p) => p !== 'expired').length
  const expiringCount = phases.filter((p) => p === 'expiring').length

  const visibleGroups = GROUPS.filter((g) => !g.roles || (user && g.roles.includes(user.role)))

  const handleLogout = () => {
    logout()
    navigate(ROUTES.landing)
  }

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      aria-label="Primary navigation"
    >
      {/* Mobile close */}
      <button className="sidebar-close-btn btn-icon" onClick={onClose} aria-label="Close navigation" style={{ position: 'absolute', top: 16, right: 12, zIndex: 10 }}>
        <X size={17} />
      </button>

      {/* Brand + collapse */}
      <div
        className="flex items-center justify-between gap-2 px-4"
        style={{ height: 76, borderBottom: '1px solid var(--border-faint)' }}
      >
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <Logo size={34} subtitle={!collapsed} />
        </div>
        <button
          className="btn-icon hidden lg:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: 30, height: 30 }}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Sections">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-group-label" style={{ paddingLeft: collapsed && isOpen ? 6 : undefined }}>
              {collapsed && isOpen ? '·' : group.label}
            </div>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`sidebar-item ${active ? 'active' : ''}`}
                      title={collapsed && isOpen ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                    >
                      {active && !reduce && (
                        <motion.span
                          layoutId="sidebar-active"
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                          style={{
                            position: 'absolute',
                            left: -1,
                            top: 8,
                            bottom: 8,
                            width: 2,
                            borderRadius: 2,
                            background: 'var(--accent-primary)',
                          }}
                        />
                      )}
                      <Icon size={17} className="flex-shrink-0" aria-hidden />
                      {!(collapsed && isOpen) && <span style={{ flex: 1 }}>{item.label}</span>}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {!isAdmin && !(collapsed && isOpen) && (
          <div className="rounded-lg p-3 mt-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}>
            <div className="flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck size={12} color="#FFFFFF" aria-hidden />
              Member access
            </div>
            <p className="text-[0.7rem] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              You can only read and edit your own records.
            </p>
          </div>
        )}
      </nav>

      {/* Backend status — honest, not decorative */}
      {!collapsed && isOpen && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-2 text-[0.66rem]" style={{ color: 'var(--text-muted)' }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: isBackendConnected ? '#FFFFFF' : '#71717A',
                flexShrink: 0,
              }}
              aria-hidden
            />
            <span className="truncate">
              {isBackendConnected ? 'API connected' : 'Offline — local data only'}
            </span>
          </div>
        </div>
      )}

      {/* Live roster snapshot */}
      {!collapsed && isOpen && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-2 text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeftRight size={12} color="#FFFFFF" aria-hidden />
            <span>
              <strong style={{ color: '#FFFFFF' }}>{activeCount}</strong> active ·{' '}
              <strong style={{ color: '#D4D4D8' }}>{expiringCount}</strong> expiring
            </span>
          </div>
        </div>
      )}

      {/* Account */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border-faint)' }}>
        <AnimatePresence initial={false}>
          {!collapsed || !isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}
            >
              <Avatar name={user?.name || 'Admin'} color="av-6" size={34} radius={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-[0.8rem] font-bold text-white truncate">{user?.name || 'Admin User'}</div>
                <div className="text-[0.66rem] truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-icon"
                style={{ width: 30, height: 30 }}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={handleLogout}
              className="btn-icon w-full"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
