import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import {
  LayoutDashboard, Users, Calendar, Activity, Weight,
  Dumbbell, LogOut, ChevronRight, User, Flame, X
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Workout Schedules', icon: Calendar, path: '/workouts' },
  { label: 'Daily Updates', icon: Activity, path: '/daily-updates' },
  { label: 'Weight Management', icon: Weight, path: '/weight' },
  { label: 'Member Portal', icon: User, path: '/member' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { clients } = useData()

  const activeCount = clients.filter(c => c.status === 'Active').length
  const expiringCount = clients.filter(c => c.status === 'Expiring').length

  const handleLogout = () => {
    logout()
    navigate('/')
    onClose()
  }

  const handleNavClick = () => {
    onClose()
  }

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
    >
      {/* Close button - mobile only */}
      <button
        className="sidebar-close-btn"
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '6px', color: 'var(--text-muted)',
          cursor: 'pointer', zIndex: 10,
        }}
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #FACC15, #FDE047)',
            boxShadow: '0 0 24px rgba(250, 204, 21,0.4)',
          }}
        >
          <Dumbbell size={20} color="white" />
        </div>
        <div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.02em',
          }}>
            Gym<span style={{ color: 'var(--accent-primary)' }}>CRM</span>
          </div>
          <div style={{
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            FITNESS PLATFORM
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-0.5 overflow-y-auto">
        <div style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          padding: '10px 14px 6px',
          textTransform: 'uppercase',
        }}>
          Main Menu
        </div>
        {navItems.filter(item => user?.role === 'admin' || ['Member Portal', 'Workout Schedules', 'Weight Management', 'Daily Updates'].includes(item.label)).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            </NavLink>
          )
        })}
      </nav>

      {/* Quick Stats Strip */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Flame size={13} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <span style={{ color: '#4ade80', fontWeight: 700 }}>{activeCount}</span> active · <span style={{ color: '#fbbf24', fontWeight: 700 }}>{expiringCount}</span> expiring
          </span>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4">
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #FACC15, #FDE047)',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin User'}</div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.email || 'admin@gymcrm.com'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              color: 'var(--text-muted)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f43f5e')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
