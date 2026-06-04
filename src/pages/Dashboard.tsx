// PAGE 2 - ADMIN DASHBOARD (Premium Dark Fitness Theme)
import { Users, CreditCard, AlertTriangle, CheckSquare, TrendingUp, ArrowUpRight, Bell, Flame, Zap, Target } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  membershipGrowthData, attendanceData,
  recentActivity, membershipTable
} from '../data/mockData'

const weekSchedule = [
  { day: 'Mon', focus: 'Chest + Triceps', color: '#FF6B00' },
  { day: 'Tue', focus: 'Back + Biceps', color: '#FF8C42' },
  { day: 'Wed', focus: 'Legs', color: '#22c55e' },
  { day: 'Thu', focus: 'Shoulders', color: '#f59e0b' },
  { day: 'Fri', focus: 'Cardio', color: '#f43f5e' },
]

const statCards = [
  { label: 'Total Clients', value: '112', change: '+8 this month', icon: Users, color: '#FF6B00', glow: 'rgba(255,107,0,0.25)' },
  { label: 'Active Memberships', value: '89', change: '+5 this week', icon: CreditCard, color: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
  { label: 'Expiring Soon', value: '14', change: 'Within 30 days', icon: AlertTriangle, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  { label: "Today's Attendance", value: '47', change: '83% attendance rate', icon: CheckSquare, color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
]

const motivationalQuotes = [
  'Every rep counts. Every session matters.',
  'Build strength. Build discipline. Build legacy.',
  'The iron never lies. Neither do your results.',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1A1A1A', border: '1px solid rgba(255,107,0,0.2)',
        borderRadius: '10px', padding: '10px 14px', color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ fontSize: '0.88rem', fontWeight: 700, color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

function getStatusClass(status: string) {
  if (status === 'Active') return 'badge badge-active'
  if (status === 'Expiring') return 'badge badge-expiring'
  return 'badge badge-expired'
}

function getPlanColor(plan: string) {
  if (plan === 'Elite') return '#FF6B00'
  if (plan === 'Premium') return '#FF8C42'
  return 'var(--text-secondary)'
}

export default function Dashboard() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const randomQuote = motivationalQuotes[now.getDate() % motivationalQuotes.length]

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>

      {/* ===== HERO BANNER ===== */}
      <div
        className="hero-banner mb-8 animate-fadeInUp"
        style={{ height: '240px', animationFillMode: 'forwards' }}
      >
        <img src="/gym-hero.png" alt="Gym" className="hero-banner-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div className="hero-overlay" />
        {/* Orange top line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #FF6B00, #FF8C42, transparent)',
        }} />

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '32px 40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="section-label" style={{ marginBottom: '4px' }}>
                <Flame size={11} style={{ display: 'inline', marginRight: '5px' }} />
                DASHBOARD OVERVIEW
              </div>
              <h1 style={{
                fontSize: '1.9rem', fontWeight: 900, color: 'white',
                letterSpacing: '-0.02em', marginBottom: '4px',
              }}>
                {greeting}, <span className="gradient-text">Admin</span> 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>
                {dateStr}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary" style={{ position: 'relative', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
                <Bell size={16} />
                <span style={{
                  position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px',
                  borderRadius: '50%', background: '#f43f5e',
                }} />
              </button>
              <button className="btn-primary">
                <TrendingUp size={16} /> Generate Report
              </button>
            </div>
          </div>

          {/* Motivational Quote */}
          <div style={{
            borderLeft: '3px solid var(--accent-primary)',
            paddingLeft: '16px',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem',
              fontStyle: 'italic', fontWeight: 500,
            }}>
              "{randomQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className="stat-card animate-fadeInUp"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${card.color}12`,
                    border: `1px solid ${card.color}25`,
                    boxShadow: `0 0 20px ${card.glow}`,
                  }}
                >
                  <Icon size={20} color={card.color} />
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.72rem', fontWeight: 700, color: card.color,
                  background: `${card.color}10`, padding: '3px 8px',
                  borderRadius: '20px', border: `1px solid ${card.color}20`,
                }}>
                  <ArrowUpRight size={11} /> Up
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.03em' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: card.color, fontWeight: 600 }}>
                {card.change}
              </div>
              {/* Bottom bar */}
              <div style={{ marginTop: '16px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, ${card.color}, ${card.color}60)`, width: '70%', borderRadius: '2px' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Membership Growth */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="section-label">Growth</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>Membership Growth</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jan – Jun 2026</p>
            </div>
            <span className="badge badge-active">+19.1% ↑</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={membershipGrowthData}>
              <defs>
                <linearGradient id="membersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="members" name="Members" stroke="#FF6B00" strokeWidth={2.5} fill="url(#membersGrad)" dot={{ fill: '#FF6B00', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Overview */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="section-label">Attendance</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>Weekly Attendance</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This week</p>
            </div>
            <span className="badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>83% avg</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendanceData} barSize={16} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="present" name="Present" fill="#FF6B00" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="rgba(244,63,94,0.25)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== BOTTOM ROW ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="glass p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-label">Live Feed</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Recent Client Activity</h3>
            </div>
            <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="flex flex-col gap-2">
            {recentActivity.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 table-row p-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${idx * 0.06}s`,
                }}
              >
                <div className={`avatar bg-gradient-to-br ${item.color}`} style={{ borderRadius: '10px' }}>
                  {item.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '1px' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.action}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-label">Schedule</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Weekly Plan</h3>
            </div>
            <Target size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="flex flex-col gap-2">
            {weekSchedule.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: i === 1 ? `${item.color}08` : 'rgba(255,255,255,0.02)',
                  border: i === 1 ? `1px solid ${item.color}25` : '1px solid rgba(255,255,255,0.03)',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: `${item.color}15`, color: item.color, fontSize: '0.72rem' }}
                >
                  {item.day}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>{item.focus}</div>
                </div>
                {i === 1 && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, color: item.color,
                    background: `${item.color}15`, padding: '2px 8px',
                    borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>Today</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MEMBERSHIP TABLE ===== */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-label">Members</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Membership Overview</h3>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>View All</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Client Name', 'Membership Plan', 'Start Date', 'End Date', 'Remaining Days', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px',
                    fontSize: '0.68rem', fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membershipTable.map((row, i) => (
                <tr key={i} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div className="flex items-center gap-2.5">
                      <div className={`avatar bg-gradient-to-br ${row.color}`} style={{ width: '32px', height: '32px', fontSize: '0.68rem', borderRadius: '8px' }}>
                        {row.avatar}
                      </div>
                      <span style={{ fontSize: '0.87rem', fontWeight: 600, color: 'white' }}>{row.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: getPlanColor(row.plan) }}>{row.plan}</span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.start}</td>
                  <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.end}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      fontSize: '0.87rem', fontWeight: 700,
                      color: row.remaining === 0 ? '#f43f5e' : row.remaining <= 14 ? '#fbbf24' : '#4ade80',
                    }}>
                      {row.remaining === 0 ? 'Expired' : `${row.remaining} days`}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className={getStatusClass(row.status)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
