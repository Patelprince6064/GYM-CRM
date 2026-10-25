// PAGE 7 - MEMBER PORTAL (Clean Monochrome Black & White Theme)
import { useState, useRef } from 'react'
import {
  CheckCircle2, Calendar, Weight, Clock, Flame, Droplets, Moon, Star,
  Plus, CheckSquare2, X, MessageSquare, Camera, Send
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useData } from '../../context/DataContext'
import { findOwnMember, useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui'
import { workoutSchedule } from '../../data/seed'

type TooltipPayload = { value: string | number }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111113',
        border: '1px solid rgba(255, 255, 255, 0.2)',
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

export default function MemberPortal() {
  const { clients, updateClient, weightHistory, addWeightEntry, addWeightTableEntry, addNotification, dailyUpdates, chatMessages, addChatMessage } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const currentMember = findOwnMember(user, clients) ?? clients[0]

  const [selectedClientId, setSelectedClientId] = useState(String(clients[0]?.id || ''))
  
  // Find the actual member to display based on role
  const member = isAdmin ? (clients.find(c => String(c.id) === selectedClientId) || clients[0]) : currentMember

  // Modals state
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!member) {
    return (
      <div className="page-container" style={{ color: 'var(--text-muted)' }}>
        No client data available in system.
      </div>
    )
  }

  const todayUpdate = dailyUpdates.find(d => d.clientId === member.id) || {
    water: 3.5,
    calories: 2200,
    sleep: 8,
    workout: true,
  }

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayDayName = dayNames[new Date().getDay()]
  const todaySchedule = workoutSchedule.find(w => w.day === todayDayName)
  const todayWorkout = todaySchedule ? {
    day: todaySchedule.day,
    focus: todaySchedule.focus,
    exercises: todaySchedule.exercises,
    duration: todaySchedule.duration,
    intensity: todaySchedule.intensity,
    icon: todaySchedule.icon,
  } : {
    day: todayDayName,
    focus: "Rest Day",
    exercises: ["Light stretching", "Foam rolling"],
    duration: "30 min",
    intensity: "Low",
    icon: "🧘",
  }

  const baseAttendanceDays = [
    { day: 'Mon', present: true },
    { day: 'Tue', present: true },
    { day: 'Wed', present: false },
    { day: 'Thu', present: true },
    { day: 'Fri', present: true },
    { day: 'Sat', present: false },
    { day: 'Sun', present: false },
  ]

  const attendanceDays = attendanceMarked
    ? baseAttendanceDays.map(d => d.day === 'Tue' ? { ...d, present: true } : d)
    : baseAttendanceDays

  const remainingPct = Math.min(100, Math.round((member.remainingDays / 180) * 100))

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
      bmi: (weightNum / ((member.height / 100) ** 2)).toFixed(1)
    })

    addNotification(`${member.name} updated weight to ${weightNum}kg`, 'success')
    setShowWeightModal(false)
  }

  const handleMarkAttendance = () => {
    if (attendanceMarked) {
      alert('Attendance already marked for today!')
      return
    }
    setAttendanceMarked(true)

    const newRate = Math.min(100, member.attendance + 1)
    updateClient(member.id, { attendance: newRate })

    addNotification(`${member.name} marked attendance for today`, 'success')
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateClient(member.id, { avatarUrl: base64String })
        addNotification('Profile picture updated successfully', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return
    addChatMessage({
      text: messageText,
      sender: 'user',
      senderName: member.name
    })
    setMessageText('')
  }

  return (
    <div className="page-container">
      {isAdmin && (
        <div className="flex items-center gap-3 mb-6">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Viewing Portal For:</span>
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

      {/* Member Header Card */}
      <div
        className="glass-strong p-6 sm:p-7 mb-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6"
        style={{ borderTop: '2px solid rgba(255, 255, 255, 0.4)' }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full md:w-auto text-center sm:text-left">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleProfilePicChange} 
          />
          <div
            className="relative flex-shrink-0 cursor-pointer group"
            style={{ width: '74px', height: '74px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
            role="button"
            tabIndex={0}
            title="Change Profile Picture"
            aria-label="Change profile picture"
          >
            <Avatar
              name={member.name}
              initials={member.avatarUrl ? undefined : member.avatar}
              src={member.avatarUrl}
              color={member.avatarColor}
              size={74}
              radius={18}
              fontSize={24}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.65)' }}>
              <Camera size={20} color="white" />
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{member.name}</h1>
              <span className="badge badge-active">{member.status}</span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 800, color: '#000000',
                background: '#FFFFFF', padding: '3px 10px', borderRadius: '999px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {member.plan}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-2">
              Goal: <span className="text-zinc-200 font-medium">{member.goal}</span> · Age {member.age} · {member.height} cm · {member.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center w-full md:w-auto">
          <button className="btn-secondary" onClick={() => setShowMessageModal(true)}>
            <MessageSquare size={15} /> Message
          </button>
          {!isAdmin && (
            <>
              <button className="btn-secondary" onClick={handleOpenWeightModal}>
                <Plus size={15} /> Log Weight
              </button>
              <button
                className="btn-primary"
                onClick={handleMarkAttendance}
                style={{ opacity: attendanceMarked ? 0.7 : 1 }}
              >
                <CheckSquare2 size={15} /> {attendanceMarked ? 'Checked In ✓' : 'Check In'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Days Remaining', value: member.remainingDays, unit: 'days', icon: Calendar, caption: `${remainingPct}% of term left` },
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

      {/* Middle Section: Subscription & Today's Workout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Membership Info */}
        <div className="glass p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="section-label">SUBSCRIPTION</div>
            <h3 className="text-lg font-bold text-white mb-5">Membership Information</h3>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-zinc-400">Validity Period</span>
                <span className="text-xs font-bold text-white">{remainingPct}% remaining</span>
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${remainingPct}%`, background: '#FFFFFF' }} />
              </div>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {[
                { label: 'Membership Plan', value: `${member.plan} Tier` },
                { label: 'Start Date', value: new Date(member.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
                { label: 'End Date', value: new Date(member.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
                { label: 'Days Remaining', value: `${member.remainingDays} days` },
                { label: 'Fitness Goal', value: member.goal },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2.5">
                  <span className="text-xs text-zinc-400">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Workout */}
        <div className="glass p-6 sm:p-7 flex flex-col justify-between" style={{ border: '1px solid rgba(255, 255, 255, 0.16)' }}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="section-label">TRAINING PROGRAM</div>
                <h3 className="text-lg font-bold text-white">Today's Workout</h3>
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 10px',
                borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {todayWorkout.day.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
              }}>
                {todayWorkout.icon}
              </div>
              <div>
                <div className="text-base font-bold text-white">{todayWorkout.focus}</div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock size={13} /> {todayWorkout.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Flame size={13} color="#FFFFFF" /> {todayWorkout.intensity} Intensity
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {todayWorkout.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, color: '#FFFFFF',
                  }}>
                    {i + 1}
                  </div>
                  <span className="text-sm text-zinc-200 font-medium">{ex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Schedule */}
        <div className="glass p-6 sm:p-7">
          <div className="section-label">ROUTINE</div>
          <h3 className="text-lg font-bold text-white mb-4">Weekly Schedule</h3>
          <div className="flex flex-col gap-2">
            {[
              { day: "Monday", focus: "Chest + Triceps", duration: "60 min", isRest: false },
              { day: "Tuesday", focus: "Back + Biceps", duration: "65 min", isRest: false },
              { day: "Wednesday", focus: "Legs", duration: "70 min", isRest: false },
              { day: "Thursday", focus: "Shoulders", duration: "55 min", isRest: false },
              { day: "Friday", focus: "Cardio", duration: "60 min", isRest: false },
              { day: "Saturday", focus: "Core", duration: "45 min", isRest: false },
              { day: "Sunday", focus: "Rest Day", duration: "30 min", isRest: true }
            ].map((ws, i) => {
              const isToday = ws.day === todayDayName
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-colors" style={{
                  background: isToday ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isToday ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                }}>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-white w-20">{ws.day}</div>
                    <div className="text-xs text-zinc-300 font-medium">{ws.focus}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">{ws.duration}</span>
                    {isToday && (
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 800, color: '#000000',
                        background: '#FFFFFF', padding: '2px 8px', borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}>
                        Today
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Attendance + Daily Summary */}
        <div className="flex flex-col gap-6">
          {/* Attendance This Week */}
          <div className="glass p-6">
            <div className="section-label">ATTENDANCE LOG</div>
            <h3 className="text-lg font-bold text-white mb-4">This Week's Attendance</h3>
            <div className="grid grid-cols-7 gap-2">
              {attendanceDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: d.present ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${d.present ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)'}`,
                    fontSize: '0.85rem',
                    color: d.present ? '#000000' : '#71717A',
                    fontWeight: 800,
                  }}>
                    {d.present ? '✓' : '—'}
                  </div>
                  <span className="text-[0.68rem] text-zinc-400 font-semibold">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Update Summary */}
          <div className="glass p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="section-label">METRICS</div>
              <h3 className="text-lg font-bold text-white mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Droplets, label: 'Water', value: `${todayUpdate.water} L` },
                  { icon: Flame, label: 'Calories', value: `${todayUpdate.calories} kcal` },
                  { icon: Moon, label: 'Sleep', value: `${todayUpdate.sleep} hrs` },
                  { icon: CheckCircle2, label: 'Workout', value: todayUpdate.workout ? 'Completed' : 'Pending' },
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="p-3.5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                      <div className="flex items-center gap-2 mb-1 text-zinc-400 text-xs font-semibold">
                        <Icon size={14} color="#FFFFFF" />
                        <span>{s.label}</span>
                      </div>
                      <div className="text-base font-bold text-white mt-1">{s.value}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Tracking Chart */}
      <div className="glass p-6 sm:p-7">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="section-label">PROGRESS TRACKING</div>
            <h3 className="text-lg font-bold text-white">Weight Progression</h3>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <span className="text-xs text-zinc-400">
              Current: <strong className="text-white font-extrabold text-sm ml-1">{member.currentWeight} kg</strong>
            </span>
            <span className="text-xs text-zinc-400">
              Goal: <strong className="text-white font-extrabold text-sm ml-1">{member.goalWeight} kg</strong>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weightHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
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

      {/* ===== UPDATE WEIGHT MODAL ===== */}
      {showWeightModal && (
        <div className="modal-overlay" onClick={() => setShowWeightModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Log Weight Entry</h2>
              <button
                onClick={() => setShowWeightModal(false)}
                className="btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
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

      {/* ===== MESSAGE ADMIN MODAL ===== */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '520px', maxHeight: '85vh' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#111113', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-base font-bold text-white">Message Management</h2>
              <button onClick={() => setShowMessageModal(false)} className="btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#08080a' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%'
                }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                    {msg.senderName}
                  </div>
                  <div style={{
                    background: msg.sender === 'user' ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                    color: msg.sender === 'user' ? '#000000' : '#FFFFFF',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.86rem',
                    fontWeight: 500,
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#111113', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-glass"
                style={{ flex: 1, borderRadius: '999px', padding: '9px 16px', fontSize: '0.88rem' }}
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
