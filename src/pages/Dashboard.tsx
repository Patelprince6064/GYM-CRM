// PAGE 2 - ADMIN DASHBOARD (Premium Dark Fitness Theme)
import { useState } from 'react'
import { Users, CreditCard, AlertTriangle, CheckSquare, TrendingUp, ArrowUpRight, Bell, Flame, Zap, Target, X, Download, MessageSquare, Send } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import {
  membershipGrowthData, attendanceData
} from '../data/mockData'

const weekSchedule = [
  { day: 'Mon', focus: 'Chest + Triceps', color: '#FACC15' },
  { day: 'Tue', focus: 'Back + Biceps', color: '#FDE047' },
  { day: 'Wed', focus: 'Legs', color: '#22c55e' },
  { day: 'Thu', focus: 'Shoulders', color: '#f59e0b' },
  { day: 'Fri', focus: 'Cardio', color: '#f43f5e' },
]

const motivationalQuotes = [
  'Every rep counts. Every session matters.',
  'Build strength. Build discipline. Build legacy.',
  'The iron never lies. Neither do your results.',
]

type TooltipPayload = { name: string; value: string | number; color?: string }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1A1A1A', border: '1px solid rgba(250, 204, 21,0.2)',
        borderRadius: '10px', padding: '10px 14px', color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{label}</div>
        {payload.map((p: TooltipPayload, i: number) => (
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
  if (plan === 'Elite') return '#FACC15'
  if (plan === 'Premium') return '#FDE047'
  return 'var(--text-secondary)'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { clients, notifications, markNotificationRead, clearNotifications, chatMessages, addChatMessage, dailyUpdates } = useData()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [adminMessage, setAdminMessage] = useState('')

  const handleAdminSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminMessage.trim()) return
    addChatMessage({
      text: adminMessage,
      sender: 'admin',
      senderName: user?.name || 'Admin'
    })
    setAdminMessage('')
  }

  const unreadUserMessages = chatMessages.filter(m => m.sender === 'user').length

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const randomQuote = motivationalQuotes[now.getDate() % motivationalQuotes.length]

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'Active').length
  const expiringClients = clients.filter(c => c.status === 'Expiring').length
  const todayAttendance = Math.round(clients.reduce((s, c) => s + c.attendance, 0) / (clients.length || 1))
  const unreadCount = notifications.filter(n => !n.read).length

  const dayOfWeek = now.getDay()
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const statCards = [
    { label: 'Total Clients', value: String(totalClients), change: `+${Math.max(0, totalClients - 100)} this month`, icon: Users, color: '#FACC15', glow: 'rgba(250, 204, 21,0.25)' },
    { label: 'Active Memberships', value: String(activeClients), change: `${activeClients} active now`, icon: CreditCard, color: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
    { label: 'Expiring Soon', value: String(expiringClients), change: 'Within 30 days', icon: AlertTriangle, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
    { label: "Avg Attendance", value: `${todayAttendance}%`, change: 'Average attendance rate', icon: CheckSquare, color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
  ]

  // Build membership table from live clients
  const membershipTable = clients.slice(0, 6).map(c => ({
    name: c.name,
    plan: c.plan,
    start: new Date(c.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    end: new Date(c.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    remaining: c.remainingDays,
    status: c.status,
    avatar: c.avatar,
    color: c.avatarColor,
  }))

  const handleGenerateReport = () => {
    setShowReport(true)
  }

  const downloadReport = () => {
    const reportData = `GYM CRM REPORT - ${dateStr}\n${'='.repeat(50)}\n\nTotal Clients: ${totalClients}\nActive Memberships: ${activeClients}\nExpiring Soon: ${expiringClients}\nAvg Attendance Rate: ${todayAttendance}%\n\n--- CLIENT LIST ---\n${clients.map(c => `${c.name} | ${c.plan} | ${c.status} | ${c.remainingDays} days left`).join('\n')}\n\n--- Generated by GymCRM ---`
    const blob = new Blob([reportData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GymCRM-Report-${now.toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setShowReport(false)
  }

  let liveActivity = notifications.slice(0, 5).map((n) => {
    const mentionedClient = clients.find(c => n.message.toLowerCase().includes(c.name.toLowerCase()))
    let actionText = n.message
    if (mentionedClient) {
      actionText = actionText.replace(new RegExp(` for ${mentionedClient.name}`, 'i'), '')
      if (actionText.toLowerCase().startsWith(mentionedClient.name.toLowerCase())) {
        actionText = actionText.substring(mentionedClient.name.length).trim()
        actionText = actionText.charAt(0).toUpperCase() + actionText.slice(1)
      }
    }
    return {
      id: `notif-${n.id}`,
      name: mentionedClient ? mentionedClient.name : 'System',
      action: actionText,
      time: n.time,
      avatar: mentionedClient ? mentionedClient.avatar : '⚙️',
      color: mentionedClient ? mentionedClient.avatarColor : 'from-gray-600 to-gray-900'
    }
  })

  if (liveActivity.length === 0 && dailyUpdates) {
    liveActivity = dailyUpdates.slice(0, 5).map((u, i) => ({
      id: `update-${i}`,
      name: u.name,
      action: u.workout ? `Completed ${u.workoutName}` : 'Logged rest day',
      time: u.date === new Date().toISOString().split('T')[0] ? 'Today' : u.date,
      avatar: u.avatar,
      color: u.avatarColor
    }))
  }

  return (
    <div className="page-container">

      {/* ===== HERO BANNER ===== */}
      <div
        className="hero-banner mb-8 animate-fadeInUp"
        style={{ animationFillMode: 'forwards' }}
      >
        <img src="/gym-hero.png" alt="Gym" className="hero-banner-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div className="hero-overlay" />
        {/* Yellow top line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #FACC15, #FDE047, transparent)',
        }} />

        {/* Hero Content */}
        <div className="hero-content">
          {/* Top Row */}
          <div className="hero-top-row">
            <div>
              <div className="section-label" style={{ marginBottom: '4px' }}>
                <Flame size={11} style={{ display: 'inline', marginRight: '5px' }} />
                DASHBOARD OVERVIEW
              </div>
              <h1 className="hero-title">
                {greeting}, <span className="gradient-text">{user?.name || 'Admin'}</span> 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>
                {dateStr}
              </p>
            </div>
            <div className="flex items-center gap-3" style={{ position: 'relative' }}>
              <button
                className="btn-secondary"
                style={{ position: 'relative', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px',
                    borderRadius: '50%', background: '#f43f5e', fontSize: '0.6rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button className="btn-primary" onClick={handleGenerateReport}>
                <TrendingUp size={16} /> <span className="btn-text-hide-sm">Generate Report</span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="notifications-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => clearNotifications()}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            background: n.read ? 'transparent' : 'rgba(250, 204, 21, 0.04)',
                            transition: 'background 0.15s',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div style={{
                              width: '6px', height: '6px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                              background: n.read ? 'transparent' : n.type === 'success' ? '#4ade80' : n.type === 'warning' ? '#fbbf24' : '#FACC15',
                            }} />
                            <div>
                              <div style={{ fontSize: '0.8rem', color: 'white', fontWeight: n.read ? 500 : 600, lineHeight: 1.4 }}>{n.message}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.time}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
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
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="members" name="Members" stroke="#FACC15" strokeWidth={2.5} fill="url(#membersGrad)" dot={{ fill: '#FACC15', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Overview */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
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
              <Bar dataKey="present" name="Present" fill="#FACC15" radius={[4, 4, 0, 0]} />
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
            {liveActivity.length > 0 ? liveActivity.map((item, idx) => (
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
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity</div>
            )}
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
            {weekSchedule.map((item, i) => {
              const isToday = i === (todayIndex <= 4 ? todayIndex : 0)
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    background: isToday ? `${item.color}08` : 'rgba(255,255,255,0.02)',
                    border: isToday ? `1px solid ${item.color}25` : '1px solid rgba(255,255,255,0.03)',
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
                  {isToday && (
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, color: item.color,
                      background: `${item.color}15`, padding: '2px 8px',
                      borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>Today</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== MEMBERSHIP TABLE ===== */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <div className="section-label">Members</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Membership Overview</h3>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>View All</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Client Name', 'Plan', 'Start', 'End', 'Remaining', 'Status'].map(h => (
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

      {/* ===== REPORT MODAL ===== */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>📊 Generated Report</h2>
              <button onClick={() => setShowReport(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <div className="flex flex-col gap-3">
              {[
                { label: 'Total Clients', value: totalClients, color: '#FACC15' },
                { label: 'Active Memberships', value: activeClients, color: '#4ade80' },
                { label: 'Expiring Soon', value: expiringClients, color: '#fbbf24' },
                { label: 'Avg Attendance', value: `${todayAttendance}%`, color: '#a78bfa' },
                { label: 'Report Date', value: dateStr, color: 'white' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary w-full justify-center" style={{ marginTop: '20px', padding: '12px' }} onClick={downloadReport}>
              <Download size={16} /> Download Report
            </button>
          </div>
        </div>
      )}

      {/* ===== FLOATING CHAT BUTTON ===== */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FACC15, #FDE047)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(250,204,21,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <MessageSquare size={22} color="black" />
        {unreadUserMessages > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#f43f5e', color: 'white', fontSize: '0.65rem', fontWeight: 800,
            width: '20px', height: '20px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadUserMessages}
          </span>
        )}
      </button>

      {/* ===== ADMIN CHAT PANEL ===== */}
      {showChat && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 1000,
          width: '380px', maxWidth: '90vw', height: '500px', maxHeight: '70vh',
          borderRadius: '20px', overflow: 'hidden',
          background: '#111', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', margin: 0 }}>💬 Member Chat</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{unreadUserMessages} message{unreadUserMessages !== 1 ? 's' : ''} from members</span>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#0a0a0a' }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '3px', textAlign: msg.sender === 'admin' ? 'right' : 'left', fontWeight: 600 }}>
                  {msg.senderName}
                </div>
                <div style={{
                  background: msg.sender === 'admin' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                  color: msg.sender === 'admin' ? 'black' : 'white',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '3px', textAlign: msg.sender === 'admin' ? 'right' : 'left' }}>
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAdminSend} style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#111', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-glass"
              style={{ flex: 1, borderRadius: '20px', padding: '10px 16px', fontSize: '0.85rem' }}
              placeholder="Reply to member..."
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
