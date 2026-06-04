import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, Activity, Weight,
  Dumbbell, LogOut, ChevronRight, User, Flame
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Workout Schedules', icon: Calendar, path: '/workouts' },
  { label: 'Daily Updates', icon: Activity, path: '/daily-updates' },
  { label: 'Weight Management', icon: Weight, path: '/weight' },
  { label: 'Member Portal', icon: User, path: '/member' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{
        background: '#0D0D0D',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF8C42)',
            boxShadow: '0 0 24px rgba(255,107,0,0.4)',
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
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
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
            <span style={{ color: '#4ade80', fontWeight: 700 }}>89</span> active · <span style={{ color: '#fbbf24', fontWeight: 700 }}>14</span> expiring
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
              background: 'linear-gradient(135deg, #FF6B00, #FF8C42)',
              fontSize: '0.75rem',
            }}
          >
            AD
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'white' }}>Admin User</div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              admin@gymcrm.com
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              color: 'var(--text-muted)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px',
              borderRadius: '6px',
              transition: 'all 0.2s',
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
