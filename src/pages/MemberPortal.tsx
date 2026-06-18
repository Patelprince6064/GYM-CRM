// PAGE 7 - MEMBER PORTAL (Premium Dark Fitness Theme)
import { CheckCircle2, Calendar, Weight, Clock, Flame, Droplets, Moon, Star, Plus, CheckSquare2 } from 'lucide-react'
import { clients, workoutSchedule, dailyUpdates, weightHistory } from '../data/mockData'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const member = clients[0] // Rahul Sharma
const todayUpdate = dailyUpdates.find(d => d.clientId === member.id)!
const todayWorkout = workoutSchedule[1] // Tuesday - Back + Biceps

const attendanceDays = [
  { day: 'Mon', present: true },
  { day: 'Tue', present: true },
  { day: 'Wed', present: false },
  { day: 'Thu', present: true },
  { day: 'Fri', present: true },
  { day: 'Sat', present: false },
  { day: 'Sun', present: false },
]

const CustomTooltip = ({ active, payload, label }: any) => {
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
  const remainingPct = Math.min(100, Math.round((member.remainingDays / 180) * 100))

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Member Header */}
      <div
        className="glass-strong p-6 mb-8 flex flex-wrap items-center gap-5 animate-fadeInUp"
        style={{ animationFillMode: 'forwards', opacity: 0, borderTop: '3px solid var(--accent-primary)' }}
      >
        <div
          className={`bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-black text-2xl`}
          style={{ width: '72px', height: '72px', borderRadius: '20px', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          {member.avatar}
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '5px' }}>
            Goal: {member.goal} · Age {member.age} · {member.height} cm · {member.phone}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-primary">
            <Plus size={15} /> Update Weight
          </button>
          <button className="btn-green">
            <CheckSquare2 size={15} /> Mark Attendance
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: (item as any).color || 'white' }}>{item.value}</span>
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
              TUESDAY
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Schedule */}
        <div className="glass p-6">
          <div className="section-label mb-1">Weekly Plan</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Weekly Schedule</h3>
          <div className="flex flex-col gap-2">
            {workoutSchedule.map((ws, i) => {
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
            <div className="flex gap-2">
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
            <div className="grid grid-cols-2 gap-3">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-label mb-1">Weight Chart</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Weight Tracking</h3>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Current: <strong style={{ color: 'var(--accent-primary)' }}>{member.currentWeight} kg</strong>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Goal: <strong style={{ color: '#4ade80' }}>{member.goalWeight} kg</strong>
            </span>
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }}>
              <Plus size={13} /> Update Weight
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[79, 83]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="weight" stroke="#FACC15" strokeWidth={2.5} dot={{ fill: '#FACC15', r: 3, strokeWidth: 1.5, stroke: '#0A0A0A' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
