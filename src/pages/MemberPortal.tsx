// PAGE 7 - MEMBER PORTAL (Premium Dark Fitness Theme)
import { useState, useRef } from 'react'
import { CheckCircle2, Calendar, Weight, Clock, Flame, Droplets, Moon, Star, Plus, CheckSquare2, X, MessageSquare, Camera, Send } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { workoutSchedule } from '../data/mockData'

type TooltipPayload = { value: string | number }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1A1A1A', border: '1px solid rgba(250, 204, 21,0.2)',
        borderRadius: '10px', padding: '8px 12px', color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{label}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FACC15' }}>{payload[0].value} kg</div>
      </div>
    )
  }
  return null
}

export default function MemberPortal() {
  const { clients, updateClient, weightHistory, addWeightEntry, addWeightTableEntry, addNotification, dailyUpdates, chatMessages, addChatMessage } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const currentMember = clients.find(c => c.email.toLowerCase() === user?.email.toLowerCase()) || clients[0]

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

    addNotification(`Rahul Sharma updated weight to ${weightNum}kg`, 'success')
    setShowWeightModal(false)
    alert('Weight logged successfully!')
  }

  const handleMarkAttendance = () => {
    if (attendanceMarked) {
      alert('Attendance already marked for today!')
      return
    }
    setAttendanceMarked(true)

    // Calculate new attendance rate
    const newRate = Math.min(100, member.attendance + 1)
    updateClient(member.id, { attendance: newRate })

    addNotification('Rahul Sharma marked attendance for today', 'success')
    alert('Attendance marked successfully! Keep up the good work! 💪')
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
        <div className="flex items-center gap-3 mb-6 animate-fadeInUp">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Viewing Portal For:</span>
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
      {/* Member Header */}
      <div
        className="glass-strong p-5 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 animate-fadeInUp text-center sm:text-left"
        style={{ animationFillMode: 'forwards', opacity: 0, borderTop: '3px solid var(--accent-primary)' }}
      >
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleProfilePicChange} 
        />
        <div
          className={`bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-black text-2xl relative cursor-pointer`}
          style={{ width: '72px', height: '72px', borderRadius: '20px', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' }}
          onClick={() => fileInputRef.current?.click()}
          title="Change Profile Picture"
        >
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            member.avatar
          )}
          <div className="absolute bottom-0 w-full bg-black bg-opacity-60 flex justify-center py-1 opacity-0 hover:opacity-100 transition-opacity h-full items-center">
            <Camera size={20} color="white" />
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col items-center sm:items-start">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{member.name}</h1>
            <span className="badge badge-active">{member.status}</span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)',
              background: 'rgba(250, 204, 21,0.1)', border: '1px solid rgba(250, 204, 21,0.25)',
              padding: '2px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {member.plan} Member
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '6px' }}>
            Goal: {member.goal} <span className="hidden sm:inline">·</span><span className="sm:hidden"><br/></span> Age {member.age} · {member.height} cm · {member.phone}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start w-full sm:w-auto mt-2 sm:mt-0">
          <button className="btn-secondary flex-1 sm:flex-none justify-center" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => setShowMessageModal(true)}>
            <MessageSquare size={14} /> Message
          </button>
          {!isAdmin && (
            <>
              <button className="btn-primary flex-1 sm:flex-none justify-center" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={handleOpenWeightModal}>
                <Plus size={14} /> Weight
              </button>
              <button className="btn-green flex-1 sm:flex-none justify-center" onClick={handleMarkAttendance} style={{ opacity: attendanceMarked ? 0.7 : 1, padding: '8px 12px', fontSize: '0.8rem' }}>
                <CheckSquare2 size={14} /> {attendanceMarked ? 'Done ✓' : 'Attend'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Days Remaining', value: `${member.remainingDays}`, unit: 'days', color: 'var(--accent-primary)', icon: Calendar },
          { label: 'Current Weight', value: `${member.currentWeight}`, unit: 'kg', color: '#4ade80', icon: Weight },
          { label: 'Goal Weight', value: `${member.goalWeight}`, unit: 'kg', color: '#fbbf24', icon: Star },
          { label: 'Attendance Rate', value: `${member.attendance}`, unit: '%', color: '#a78bfa', icon: CheckCircle2 },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards', textAlign: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: `${s.color}12`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon size={18} color={s.color} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {s.value}<span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}> {s.unit}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Membership Info */}
        <div className="glass p-6">
          <div className="section-label mb-1">Subscription</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '20px' }}>Membership Information</h3>
          <div style={{ marginBottom: '20px' }}>
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validity</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ade80' }}>{remainingPct}% remaining</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className="progress-fill" style={{ width: `${remainingPct}%`, background: 'linear-gradient(90deg, #FACC15, #FDE047)' }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Plan', value: member.plan, color: 'var(--accent-primary)' },
              { label: 'Start Date', value: new Date(member.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
              { label: 'End Date', value: new Date(member.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
              { label: 'Days Remaining', value: `${member.remainingDays} days`, color: '#4ade80' },
              { label: 'Fitness Goal', value: member.goal },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: (item as {color?: string}).color || 'white' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Workout */}
        <div className="glass p-6" style={{ border: '1px solid rgba(250, 204, 21,0.2)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-label mb-1">Today's Training</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Today's Workout</h3>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(250, 204, 21,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(250, 204, 21,0.2)', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {todayWorkout.day.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(250, 204, 21,0.1)', border: '1px solid rgba(250, 204, 21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
              {todayWorkout.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{todayWorkout.focus}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1"><Clock size={13} style={{ color: 'var(--text-muted)' }} /><span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{todayWorkout.duration}</span></div>
                <div className="flex items-center gap-1"><Flame size={13} color="#FACC15" /><span style={{ fontSize: '0.73rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{todayWorkout.intensity}</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {todayWorkout.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(250, 204, 21,0.1)', border: '1px solid rgba(250, 204, 21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Schedule + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Weekly Schedule */}
        <div className="glass p-6">
          <div className="section-label mb-1">Weekly Plan</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Weekly Schedule</h3>
          <div className="flex flex-col gap-2">
            {[
              { day: "Monday", focus: "Chest + Triceps", duration: "60 min", icon: "💪", isRest: false },
              { day: "Tuesday", focus: "Back + Biceps", duration: "65 min", icon: "🏋️", isRest: false },
              { day: "Wednesday", focus: "Legs", duration: "70 min", icon: "🦵", isRest: false },
              { day: "Thursday", focus: "Shoulders", duration: "55 min", icon: "🏆", isRest: false },
              { day: "Friday", focus: "Cardio", duration: "60 min", icon: "🏃", isRest: false },
              { day: "Saturday", focus: "Core", duration: "45 min", icon: "🎯", isRest: false },
              { day: "Sunday", focus: "Rest Day", duration: "30 min", icon: "😴", isRest: true }
            ].map((ws, i) => {
              const isToday = ws.day === 'Tuesday'
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{
                  background: isToday ? 'rgba(250, 204, 21,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isToday ? '1px solid rgba(250, 204, 21,0.2)' : '1px solid transparent',
                }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: ws.isRest ? 'rgba(100,116,139,0.08)' : 'rgba(250, 204, 21,0.08)', border: ws.isRest ? '1px solid rgba(100,116,139,0.15)' : '1px solid rgba(250, 204, 21,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {ws.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{ws.day}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ws.focus}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ws.duration}</div>
                  {isToday && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(250, 204, 21,0.1)', padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase' }}>Today</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Attendance + Daily Summary */}
        <div className="flex flex-col gap-5">
          {/* Attendance This Week */}
          <div className="glass p-5">
            <div className="section-label mb-1">Attendance</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '14px' }}>This Week's Attendance</h3>
            <div className="flex gap-1 sm:gap-2 justify-between">
              {attendanceDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: d.present ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.06)',
                    border: `1px solid ${d.present ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.12)'}`,
                    fontSize: '0.8rem',
                    color: d.present ? '#4ade80' : '#f43f5e',
                    fontWeight: 800,
                  }}>
                    {d.present ? '✓' : '✗'}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Update Summary */}
          <div className="glass p-5" style={{ flex: 1 }}>
            <div className="section-label mb-1">Daily Log</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '14px' }}>Today's Summary</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { icon: Droplets, label: 'Water', value: `${todayUpdate.water}L`, color: '#06b6d4' },
                { icon: Flame, label: 'Calories', value: `${todayUpdate.calories}`, color: '#f59e0b' },
                { icon: Moon, label: 'Sleep', value: `${todayUpdate.sleep}h`, color: '#a78bfa' },
                { icon: CheckCircle2, label: 'Workout', value: todayUpdate.workout ? 'Done ✓' : 'Skipped', color: todayUpdate.workout ? '#4ade80' : '#f43f5e' },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={13} color={s.color} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Weight Tracking Chart */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="section-label mb-1">Weight Chart</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Weight Tracking</h3>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Current: <strong style={{ color: 'var(--accent-primary)' }}>{member.currentWeight} kg</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Goal: <strong style={{ color: '#4ade80' }}>{member.goalWeight} kg</strong>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="weight" stroke="#FACC15" strokeWidth={2.5} dot={{ fill: '#FACC15', r: 3, strokeWidth: 1.5, stroke: '#0A0A0A' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ===== UPDATE WEIGHT MODAL ===== */}
      {showWeightModal && (
        <div className="modal-overlay" onClick={() => setShowWeightModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>⚖️ Log New Weight</h2>
              <button onClick={() => setShowWeightModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

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

              <button className="btn-primary w-full justify-center" type="submit">
                Log Weight Entry
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ===== MESSAGE ADMIN MODAL ===== */}
      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '100%', maxWidth: '400px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px', maxHeight: '80vh' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>Message Admin</h2>
              <button onClick={() => setShowMessageModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#0a0a0a' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                    {msg.senderName}
                  </div>
                  <div style={{
                    background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    color: msg.sender === 'user' ? 'black' : 'white',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#111', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-glass"
                style={{ flex: 1, borderRadius: '20px', padding: '10px 16px', fontSize: '0.9rem' }}
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
