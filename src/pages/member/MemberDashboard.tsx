// MEMBER DASHBOARD – Clean Monochrome Black & White Theme
import { useState, useRef } from 'react'
import {
  CheckCircle2, Calendar, Weight, Clock, Flame, Star,
  Plus, X, Camera, AlertTriangle, Check,
  TrendingDown, TrendingUp, LayoutDashboard,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { useData } from '../../context/DataContext'
import { findOwnMember, useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui'
import { workoutSchedule } from '../../data/seed'

// ── Types ────────────────────────────────────────────────────────────────────
type TooltipPayload = { value: string | number }

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({
  active, payload, label,
}: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111113',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '10px',
        padding: '8px 14px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
      }}>
        <div style={{ fontSize: '0.7rem', color: '#A1A1AA', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>{payload[0].value} kg</div>
      </div>
    )
  }
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function getAttendanceCalendar() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const attendance: Record<number, boolean> = {}
  for (let d = 1; d <= Math.min(today.getDate(), daysInMonth); d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6) {
      attendance[d] = (d % 3 !== 0)
    }
  }
  return { year, month, daysInMonth, firstDay, attendance, today }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function MemberDashboard() {
  const { clients, updateClient, weightHistory, addWeightEntry, addWeightTableEntry, addNotification } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const currentMember = findOwnMember(user, clients) ?? clients[0]

  const [selectedClientId, setSelectedClientId] = useState(String(clients[0]?.id || ''))
  const member = isAdmin
    ? (clients.find(c => String(c.id) === selectedClientId) || clients[0])
    : currentMember

  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!member) {
    return (
      <div className="page-container" style={{ color: 'var(--text-muted)' }}>
        No client data available in system.
      </div>
    )
  }

  const endDate = new Date(member.endDate)
  const today = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / msPerDay)
  const showExpiryBanner = daysLeft > 0 && daysLeft <= 31

  const { year, month, daysInMonth, firstDay, attendance } = getAttendanceCalendar()

  const todayDayName = dayNames[today.getDay()]
  const todaySchedule = workoutSchedule.find(w => w.day === todayDayName) || {
    day: todayDayName,
    focus: 'Rest Day',
    exercises: ['Light stretching', 'Foam rolling'],
    duration: '30 min',
    intensity: 'Low',
    icon: '🧘',
    isRest: true,
  }

  const currentIdx = workoutSchedule.findIndex(w => w.day === todayDayName)
  const upcomingSchedules = [
    workoutSchedule[(currentIdx + 1) % workoutSchedule.length],
    workoutSchedule[(currentIdx + 2) % workoutSchedule.length],
    workoutSchedule[(currentIdx + 3) % workoutSchedule.length],
  ]

  const remainingPct = Math.min(100, Math.round((member.remainingDays / 180) * 100))

  const weightTrend = weightHistory.length >= 2
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight
    : 0

  const handleOpenWeightModal = () => {
    setNewWeight(String(member.currentWeight))
    setShowWeightModal(true)
  }

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWeight.trim()) return

    const weightNum = Number(newWeight)
    const oldWeight = member.currentWeight
    const changeAmount = (weightNum - oldWeight).toFixed(1)
    const changeStr = Number(changeAmount) > 0 ? `+${changeAmount} kg` : `${changeAmount} kg`

    updateClient(member.id, { currentWeight: weightNum })

    const dateLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    addWeightEntry({ date: dateLabel, weight: weightNum })
    addWeightTableEntry({
      date: dateLabel,
      weight: `${weightNum} kg`,
      change: changeStr,
      bmi: (weightNum / ((member.height / 100) ** 2)).toFixed(1),
    })

    addNotification(`${member.name} updated weight to ${weightNum}kg`, 'success')
    setShowWeightModal(false)
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateClient(member.id, { avatarUrl: reader.result as string })
        addNotification('Profile picture updated successfully', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleExercise = (idx: number) => {
    setCompletedExercises(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const completionRate = todaySchedule.exercises.length > 0
    ? Math.round((completedExercises.size / todaySchedule.exercises.length) * 100)
    : 0

  return (
    <div className="page-container">
      {/* Admin selector */}
      {isAdmin && (
        <div className="flex items-center gap-3 mb-6">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Viewing Dashboard For:</span>
          <select
            className="input-glass"
            style={{ padding: '7px 14px', fontSize: '0.85rem', height: 'auto', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id} style={{ background: '#111', color: '#fff' }}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Header banner */}
      <div className="glass-strong p-6 mb-8 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LayoutDashboard size={22} color="#FFFFFF" />
          </div>
          <div>
            <div className="section-label">OVERVIEW</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Member Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleProfilePicChange} />
          <div
            className="relative flex-shrink-0 cursor-pointer group"
            style={{ width: '50px', height: '50px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            title="Change Profile Picture"
          >
            <Avatar
              name={member.name}
              initials={member.avatarUrl ? undefined : member.avatar}
              src={member.avatarUrl}
              color={member.avatarColor}
              size={50}
              radius={14}
              fontSize={18}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <Camera size={16} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Banner */}
      {showExpiryBanner && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#FFFFFF" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Subscription Renewal Notice</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Your subscription expires on <span className="text-white font-bold">{formatDate(member.endDate)}</span> ({daysLeft} days remaining).
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Days Remaining', value: member.remainingDays, unit: 'days', icon: Calendar, caption: `${remainingPct}% remaining` },
          { label: 'Current Weight', value: member.currentWeight, unit: 'kg', icon: Weight, caption: `Target: ${member.goalWeight} kg` },
          { label: 'Goal Weight', value: member.goalWeight, unit: 'kg', icon: Star, caption: `Diff: ${Math.abs(member.currentWeight - member.goalWeight).toFixed(1)} kg` },
          { label: 'Attendance Rate', value: member.attendance, unit: '%', icon: CheckCircle2, caption: 'Recorded check-ins' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color="#FFFFFF" />
                </div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight leading-none mt-2">
                {s.value}<span className="text-base font-normal text-zinc-400 ml-1">{s.unit}</span>
              </div>
              <div className="text-xs text-zinc-400 mt-2 font-medium">{s.caption}</div>
            </div>
          )
        })}
      </div>

      {/* Row 1: Weight Chart + Membership Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weight Progress Graph (2 cols) */}
        <div className="glass p-6 sm:p-7 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="section-label">PROGRESS</div>
                <h3 className="text-lg font-bold text-white">Weight History</h3>
                <div className="flex items-center gap-5 mt-2 flex-wrap">
                  <span className="text-xs text-zinc-400">
                    Current: <strong className="text-white font-bold ml-1">{member.currentWeight} kg</strong>
                  </span>
                  <span className="text-xs text-zinc-400">
                    Target: <strong className="text-white font-bold ml-1">{member.goalWeight} kg</strong>
                  </span>
                  {weightTrend !== 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-white">
                      {weightTrend < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                      {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)} kg
                    </span>
                  )}
                </div>
              </div>
              {!isAdmin && (
                <button className="btn-secondary" onClick={handleOpenWeightModal}>
                  <Plus size={15} /> Log Weight
                </button>
              )}
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={member.goalWeight}
                  stroke="rgba(255,255,255,0.4)"
                  strokeDasharray="4 4"
                  label={{ value: 'Target', fill: '#FFFFFF', fontSize: 11, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  dot={{ fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: '#FFFFFF', stroke: '#FFFFFF', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Status (1 col) */}
        <div className="glass p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="section-label">SUBSCRIPTION</div>
            <h3 className="text-lg font-bold text-white mb-5">Membership Status</h3>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-zinc-400">Validity</span>
                <span className="text-xs font-bold text-white">{remainingPct}% remaining</span>
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${remainingPct}%`, background: '#FFFFFF' }} />
              </div>
            </div>

            <div className="flex flex-col divide-y divide-white/5">
              {[
                { label: 'Plan', value: member.plan },
                { label: 'Member Since', value: new Date(member.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'Expires On', value: new Date(member.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'Days Left', value: `${member.remainingDays} days` },
                { label: 'Status', value: member.status },
                { label: 'Goal', value: member.goal },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2.5">
                  <span className="text-xs text-zinc-400">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Attendance Calendar */}
      <div className="glass p-6 sm:p-7 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="section-label">ATTENDANCE</div>
            <h3 className="text-lg font-bold text-white">
              {MONTH_NAMES[month]} {year} — Monthly Attendance
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#FFFFFF' }} />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
              <span>Absent</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px', marginBottom: '8px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const todayDate = new Date()
            const isToday = day === todayDate.getDate()
            const isFuture = day > todayDate.getDate()
            const dow = new Date(year, month, day).getDay()
            const isWeekend = dow === 0 || dow === 6
            const present = attendance[day]
            const hasRecord = !isFuture && !isWeekend && present !== undefined

            let bg = 'rgba(255,255,255,0.02)'
            let border = '1px solid rgba(255,255,255,0.06)'
            let color = '#71717A'

            if (isToday) {
              border = '1px solid #FFFFFF'
              bg = 'rgba(255,255,255,0.12)'
              color = '#FFFFFF'
            } else if (hasRecord && present) {
              bg = '#FFFFFF'
              border = '1px solid #FFFFFF'
              color = '#000000'
            }

            return (
              <div
                key={day}
                style={{
                  aspectRatio: '1',
                  borderRadius: '10px',
                  background: bg,
                  border,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '38px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: isToday || (hasRecord && present) ? 800 : 500, color }}>
                  {day}
                </span>
                {hasRecord && present && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#000000' }}>✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 3: Today's Workout + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout (2 cols) */}
        <div className="glass p-6 sm:p-7 lg:col-span-2 flex flex-col justify-between" style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
          <div>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="section-label">ROUTINE</div>
                <h3 className="text-lg font-bold text-white">Today's Workout</h3>
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 10px',
                borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {todaySchedule.day.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
              }}>
                {todaySchedule.icon}
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-white">{todaySchedule.focus}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {todaySchedule.duration}</span>
                  <span className="flex items-center gap-1.5 font-bold text-white"><Flame size={13} /> {todaySchedule.intensity}</span>
                  {!todaySchedule.isRest && completedExercises.size > 0 && (
                    <span className="text-white font-bold ml-auto">{completedExercises.size}/{todaySchedule.exercises.length} completed</span>
                  )}
                </div>
              </div>
            </div>

            {!todaySchedule.isRest && (
              <div className="mb-4">
                <div className="flex justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Completion</span>
                  <span className="font-bold text-white">{completionRate}%</span>
                </div>
                <div className="progress-bar" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${completionRate}%`, background: '#FFFFFF' }} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
              {todaySchedule.exercises.map((ex, i) => {
                const done = completedExercises.has(i)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{
                      background: done ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: done ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: done ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                        color: done ? '#000000' : '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800,
                      }}>
                        {done ? <Check size={12} /> : i + 1}
                      </div>
                      <span className={`text-sm ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {ex}
                      </span>
                    </div>

                    {!todaySchedule.isRest && (
                      <button
                        onClick={() => toggleExercise(i)}
                        className={done ? 'btn-secondary' : 'btn-primary'}
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      >
                        {done ? 'Done' : 'Mark Done'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Workouts (1 col) */}
        <div className="glass p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="section-label">UPCOMING</div>
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Schedule</h3>
            <div className="flex flex-col gap-3">
              {upcomingSchedules.map((ws, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{ws.day}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{ws.focus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">{ws.duration}</div>
                      <div className="text-[0.65rem] font-bold text-white uppercase">{ws.intensity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="modal-overlay" onClick={() => setShowWeightModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Log Weight Entry</h2>
              <button onClick={() => setShowWeightModal(false)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }} />
            <form onSubmit={handleWeightSubmit} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Current Weight (kg)</label>
                <input
                  className="input-glass w-full"
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  placeholder="e.g. 74.5"
                  required
                  autoFocus
                />
              </div>
              <button className="btn-primary w-full justify-center mt-2" type="submit">
                Save Weight Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
