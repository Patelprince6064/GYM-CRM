// MEMBER DASHBOARD – Weight Progress, Attendance, Membership Status, Workout Schedule
import { useState, useRef } from 'react'
import {
  CheckCircle2, Calendar, Weight, Clock, Flame, Star,
  Plus, X, Camera, AlertTriangle, ChevronRight, Check,
  TrendingDown, TrendingUp, Dumbbell, LayoutDashboard,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
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
        background: '#1A1A1A',
        border: '1px solid rgba(250,204,21,0.2)',
        borderRadius: '10px',
        padding: '8px 14px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FACC15' }}>{payload[0].value} kg</div>
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
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun

  const attendance: Record<number, boolean> = {}
  // Mock some attendance data – present on weekdays up to today
  for (let d = 1; d <= Math.min(today.getDate(), daysInMonth); d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6) {
      attendance[d] = Math.random() > 0.25 // ~75% present
    }
  }
  return { year, month, daysInMonth, firstDay, attendance, today }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const { clients, updateClient, weightHistory, addWeightEntry, addWeightTableEntry, addNotification } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const currentMember = clients.find(c => c.email.toLowerCase() === user?.email.toLowerCase()) || clients[0]

  const [selectedClientId, setSelectedClientId] = useState(String(clients[0]?.id || ''))
  const member = isAdmin
    ? (clients.find(c => String(c.id) === selectedClientId) || clients[0])
    : currentMember

  // Weight modal
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  // Completed exercises for today
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())

  // Profile pic
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!member) {
    return (
      <div className="page-container" style={{ color: 'var(--text-muted)' }}>
        No client data available in system.
      </div>
    )
  }

  // ── Membership expiry notification ─────────────────────────────────────────
  const endDate = new Date(member.endDate)
  const today = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / msPerDay)
  const nextMonthThreshold = 31 // within ~1 month
  const showExpiryBanner = daysLeft > 0 && daysLeft <= nextMonthThreshold

  // ── Attendance calendar ─────────────────────────────────────────────────────
  const { year, month, daysInMonth, firstDay, attendance } = getAttendanceCalendar()

  // ── Workout data ────────────────────────────────────────────────────────────
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

  // Upcoming = next 4 days (excluding today)
  const todayIdx = dayNames.indexOf(todayDayName)
  const upcomingSchedules = [1, 2, 3, 4].map(offset => {
    const idx = (todayIdx + offset) % 7
    return workoutSchedule.find(w => w.day === dayNames[idx]) || {
      day: dayNames[idx],
      focus: 'Rest Day',
      exercises: [],
      duration: '30 min',
      intensity: 'Low',
      icon: '😴',
      isRest: true,
    }
  })

  // ── Weight stats ────────────────────────────────────────────────────────────
  const weightTrend = weightHistory.length >= 2
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight
    : 0

  const remainingPct = Math.min(100, Math.round((member.remainingDays / 180) * 100))

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  const intensityColor: Record<string, string> = {
    'Very High': '#f43f5e',
    'High': '#FACC15',
    'Medium': '#f59e0b',
    'Low': '#4ade80',
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">

      {/* ── Admin client selector ─────────────────────────── */}
      {isAdmin && (
        <div className="flex items-center gap-3 mb-6 animate-fadeInUp">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Viewing Dashboard For:</span>
          <select
            className="input-glass"
            style={{ padding: '6px 12px', fontSize: '0.85rem', height: 'auto', background: 'rgba(255,255,255,0.02)' }}
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 animate-fadeInUp" style={{ animationFillMode: 'forwards', opacity: 0 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LayoutDashboard size={20} color="#FACC15" />
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: '1px' }}>Member Portal</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            My Dashboard
          </h1>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleProfilePicChange} />
          <div
            className={`bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-black text-lg relative cursor-pointer`}
            style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', overflow: 'hidden' }}
            onClick={() => fileInputRef.current?.click()}
            title="Change Profile Picture"
          >
            {member.avatarUrl
              ? <img src={member.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : member.avatar}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={16} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Expiry notification banner ───────────────────────── */}
      {showExpiryBanner && (
        <div
          className="animate-fadeInUp"
          style={{
            animationDelay: '0.05s', animationFillMode: 'forwards', opacity: 0,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.08))',
            border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: '14px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginBottom: '2px' }}>
              Subscription Expiring Soon
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
              Your subscription is about to expire on{' '}
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>{formatDate(member.endDate)}</span>
              {' '}· <span style={{ color: '#fbbf24', fontWeight: 700 }}>{daysLeft} days</span> remaining
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Days Remaining', value: `${member.remainingDays}`, unit: 'days', color: '#FACC15', icon: Calendar },
          { label: 'Current Weight', value: `${member.currentWeight}`, unit: 'kg', color: '#4ade80', icon: Weight },
          { label: 'Goal Weight', value: `${member.goalWeight}`, unit: 'kg', color: '#fbbf24', icon: Star },
          { label: 'Attendance Rate', value: `${member.attendance}`, unit: '%', color: '#a78bfa', icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.07}s`, opacity: 0, animationFillMode: 'forwards', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}18`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon size={17} color={s.color} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {s.value}<span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}> {s.unit}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* ── Row 1: Weight Graph + Membership ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Weight Progress Graph (takes 2 cols) */}
        <div className="glass p-6 animate-fadeInUp lg:col-span-2" style={{ animationDelay: '0.15s', animationFillMode: 'forwards', opacity: 0 }}>
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="section-label mb-1">Progress</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Weight Progress</h3>
              <div className="flex items-center gap-4 mt-1">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Current: <strong style={{ color: '#FACC15' }}>{member.currentWeight} kg</strong>
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Goal: <strong style={{ color: '#4ade80' }}>{member.goalWeight} kg</strong>
                </span>
                {weightTrend !== 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.76rem', fontWeight: 700, color: weightTrend < 0 ? '#4ade80' : '#f43f5e' }}>
                    {weightTrend < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                    {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)} kg
                  </span>
                )}
              </div>
            </div>
            {!isAdmin && (
              <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={handleOpenWeightModal}>
                <Plus size={14} /> Log Weight
              </button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={member.goalWeight} stroke="rgba(74,222,128,0.4)" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#4ade80', fontSize: 10, position: 'insideTopRight' }} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FACC15"
                strokeWidth={2.5}
                dot={{ fill: '#FACC15', r: 3, strokeWidth: 1.5, stroke: '#0A0A0A' }}
                activeDot={{ r: 5, stroke: '#FACC15', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Membership Status */}
        <div className="glass p-6 animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
          <div className="section-label mb-1">Subscription</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '18px' }}>Membership Status</h3>

          {/* Validity bar */}
          <div style={{ marginBottom: '18px' }}>
            <div className="flex justify-between mb-1.5">
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Validity</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: remainingPct > 30 ? '#4ade80' : '#fbbf24' }}>
                {remainingPct}% remaining
              </span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${remainingPct}%`,
                  background: remainingPct > 30
                    ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                    : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                }}
              />
            </div>
          </div>

          {/* Info rows */}
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Plan', value: member.plan, color: '#FACC15' },
              { label: 'Member Since', value: new Date(member.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { label: 'Expires On', value: new Date(member.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: daysLeft <= 30 ? '#fbbf24' : undefined },
              { label: 'Days Left', value: `${member.remainingDays} days`, color: member.remainingDays > 30 ? '#4ade80' : '#fbbf24' },
              { label: 'Status', value: member.status, color: member.status === 'Active' ? '#4ade80' : member.status === 'Expiring' ? '#fbbf24' : '#f43f5e' },
              { label: 'Goal', value: member.goal },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: (item as { color?: string }).color || 'white' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Attendance Calendar ───────────────────────── */}
      <div className="glass p-4 mb-4 animate-fadeInUp" style={{ animationDelay: '0.25s', animationFillMode: 'forwards', opacity: 0 }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="section-label mb-1">
              <Calendar size={11} style={{ display: 'inline', marginRight: '5px' }} />
              Attendance
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>
              {MONTH_NAMES[month]} {year} — Attendance Calendar
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(34,197,94,0.6)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(244,63,94,0.4)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Weekend / Future</span>
            </div>
          </div>
        </div>

        {/* Day of week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px', marginBottom: '4px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '3px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' }}>
          {/* Empty cells for offset */}
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

            let bg = 'rgba(255,255,255,0.03)'
            let border = '1px solid rgba(255,255,255,0.05)'
            let color = 'var(--text-muted)'

            if (isToday) {
              border = '1px solid rgba(250,204,21,0.5)'
              bg = 'rgba(250,204,21,0.1)'
              color = '#FACC15'
            } else if (hasRecord && present) {
              bg = 'rgba(34,197,94,0.12)'
              border = '1px solid rgba(34,197,94,0.25)'
              color = '#4ade80'
            } else if (hasRecord && !present) {
              bg = 'rgba(244,63,94,0.08)'
              border = '1px solid rgba(244,63,94,0.15)'
              color = '#f43f5e'
            }

            return (
              <div
                key={day}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background: bg,
                  border,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  transition: 'all 0.2s ease',
                  minHeight: '28px',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: isToday ? 800 : 600, color }}>
                  {day}
                </span>
                {hasRecord && (
                  <span style={{ fontSize: '0.5rem', color: present ? '#4ade80' : '#f43f5e', fontWeight: 700 }}>
                    {present ? '✓' : '✗'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Row 3: Today's Workout + Upcoming ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Today's Workout (2 cols) */}
        <div className="glass p-6 animate-fadeInUp lg:col-span-2" style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0, border: '1px solid rgba(250,204,21,0.2)' }}>
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="section-label mb-1">
                <Dumbbell size={11} style={{ display: 'inline', marginRight: '5px' }} />
                Today's Training
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Today's Workout</h3>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(250,204,21,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(250,204,21,0.2)', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {todaySchedule.day.toUpperCase()}
            </span>
          </div>

          {/* Workout Info */}
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0 }}>
              {todaySchedule.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{todaySchedule.focus}</div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{todaySchedule.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={13} color={intensityColor[todaySchedule.intensity] || '#FACC15'} />
                  <span style={{ fontSize: '0.75rem', color: intensityColor[todaySchedule.intensity] || '#FACC15', fontWeight: 700 }}>{todaySchedule.intensity}</span>
                </div>
                {!todaySchedule.isRest && completedExercises.size > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>
                    {completedExercises.size}/{todaySchedule.exercises.length} done
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar if active workout */}
          {!todaySchedule.isRest && (
            <div style={{ marginBottom: '16px' }}>
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completion</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: completionRate === 100 ? '#4ade80' : '#FACC15' }}>{completionRate}%</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-fill" style={{ width: `${completionRate}%`, background: completionRate === 100 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#FACC15,#FDE047)', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {/* Exercise list */}
          <div className="flex flex-col gap-2">
            {todaySchedule.exercises.map((ex, i) => {
              const done = completedExercises.has(i)
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: done ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.02)',
                    border: done ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: done ? 'rgba(34,197,94,0.15)' : 'rgba(250,204,21,0.08)',
                    border: done ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(250,204,21,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.62rem', fontWeight: 800,
                    color: done ? '#4ade80' : 'var(--accent-primary)',
                    flexShrink: 0,
                  }}>
                    {done ? <Check size={12} /> : i + 1}
                  </div>
                  <span style={{ flex: 1, fontSize: '0.83rem', color: done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: done ? 'line-through' : 'none', transition: 'all 0.2s ease' }}>
                    {ex}
                  </span>
                  {!todaySchedule.isRest && (
                    <button
                      onClick={() => toggleExercise(i)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: done ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(250,204,21,0.3)',
                        background: done ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.08)',
                        color: done ? '#4ade80' : '#FACC15',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      {done ? <><Check size={11} /> Done</> : 'Complete'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Workouts (1 col) */}
        <div className="glass p-6 animate-fadeInUp" style={{ animationDelay: '0.35s', animationFillMode: 'forwards', opacity: 0 }}>
          <div className="section-label mb-1">
            <ChevronRight size={11} style={{ display: 'inline', marginRight: '3px' }} />
            Schedule
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Upcoming Workouts</h3>
          <div className="flex flex-col gap-2.5">
            {upcomingSchedules.map((ws, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: ws.isRest ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                  border: ws.isRest ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.06)',
                  opacity: ws.isRest ? 0.65 : 1,
                  transition: 'border-color 0.2s',
                }}
              >
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '11px',
                    background: ws.isRest ? 'rgba(100,116,139,0.08)' : 'rgba(250,204,21,0.07)',
                    border: ws.isRest ? '1px solid rgba(100,116,139,0.12)' : '1px solid rgba(250,204,21,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {ws.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'white' }}>{ws.day}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.focus}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ws.duration}</div>
                    {!ws.isRest && (
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: intensityColor[ws.intensity] || '#FACC15', marginTop: '1px' }}>
                        {ws.intensity}
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercises preview – read only */}
                {!ws.isRest && ws.exercises.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {ws.exercises.slice(0, 3).map((ex, j) => (
                      <div key={j} className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(250,204,21,0.5)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>{ex}</span>
                      </div>
                    ))}
                    {ws.exercises.length > 3 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' }}>
                        +{ws.exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
            📅 Upcoming workouts are view-only
          </div>
        </div>
      </div>

      {/* ── Weight Modal ─────────────────────────────────────── */}
      {showWeightModal && (
        <div className="modal-overlay" onClick={() => setShowWeightModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>⚖️ Log New Weight</h2>
              <button
                onClick={() => setShowWeightModal(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg,#FACC15,#FDE047)', borderRadius: '2px', marginBottom: '20px' }} />
            <form onSubmit={handleWeightSubmit} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Current Weight (kg)</label>
                <input
                  className="input-glass w-full"
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Previous: <strong style={{ color: 'white' }}>{member.currentWeight} kg</strong>
                {newWeight && Number(newWeight) !== member.currentWeight && (
                  <span style={{ marginLeft: '8px', fontWeight: 700, color: Number(newWeight) < member.currentWeight ? '#4ade80' : '#f43f5e' }}>
                    ({Number(newWeight) < member.currentWeight ? '↓' : '↑'} {Math.abs(Number(newWeight) - member.currentWeight).toFixed(1)} kg)
                  </span>
                )}
              </div>
              <button className="btn-primary w-full justify-center" type="submit">
                Log Weight Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
