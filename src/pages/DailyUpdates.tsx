// PAGE 5 - DAILY UPDATES (Premium Dark Fitness Theme)
import { useState } from 'react'
import { CheckCircle2, XCircle, Droplets, Flame, Moon, Footprints, Heart, StickyNote, TrendingUp, Zap, Activity, Plus, X } from 'lucide-react'
import { useData, type DailyUpdate } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const moodColor: Record<string, string> = {
  'Excellent': '#4ade80',
  'Good': '#FDE047',
  'Tired': '#f59e0b',
  'Poor': '#f43f5e',
}

const moodEmoji: Record<string, string> = {
  'Excellent': '🔥',
  'Good': '😊',
  'Tired': '😴',
  'Poor': '😞',
}

export default function DailyUpdates() {
  const { clients, dailyUpdates, addDailyUpdate, addNotification } = useData()
  const { user } = useAuth()
  const currentMember = clients.find(c => c.email.toLowerCase() === user?.email.toLowerCase()) || clients[0]
  const isAdmin = user?.role === 'admin'
  const visibleUpdates = isAdmin ? dailyUpdates : dailyUpdates.filter(u => u.clientId === currentMember?.id)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Log Update modal state
  const [showLogModal, setShowLogModal] = useState(false)

  // Form states
  const [clientId, setClientId] = useState('')
  const [workout, setWorkout] = useState(true)
  const [workoutName, setWorkoutName] = useState('Chest + Triceps')
  const [water, setWater] = useState('3.0')
  const [calories, setCalories] = useState('2500')
  const [sleep, setSleep] = useState('8')
  const [steps, setSteps] = useState('10000')
  const [mood, setMood] = useState('Good')
  const [notes, setNotes] = useState('')
  const [heartRate, setHeartRate] = useState('70')

  const completedCount = visibleUpdates.filter(u => u.workout).length
  const avgWater = (visibleUpdates.reduce((s, u) => s + u.water, 0) / (visibleUpdates.length || 1)).toFixed(1)
  const avgSleep = (visibleUpdates.reduce((s, u) => s + u.sleep, 0) / (visibleUpdates.length || 1)).toFixed(1)
  const avgCalories = Math.round(visibleUpdates.reduce((s, u) => s + u.calories, 0) / (visibleUpdates.length || 1))

  const handleOpenLog = () => {
    if (isAdmin) {
      if (clients.length > 0) setClientId(String(clients[0].id))
    } else {
      setClientId(String(currentMember?.id))
    }
    setWorkout(true)
    setWorkoutName('Chest + Triceps')
    setWater('3.0')
    setCalories('2500')
    setSleep('8')
    setSteps('10000')
    setMood('Good')
    setNotes('')
    setHeartRate('70')
    setShowLogModal(true)
  }

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedClient = clients.find(c => String(c.id) === clientId)
    if (!selectedClient) return

    // Add log
    const newLog: DailyUpdate = {
      clientId: selectedClient.id,
      name: selectedClient.name,
      avatar: selectedClient.avatar,
      avatarColor: selectedClient.avatarColor,
      date: new Date().toISOString().split('T')[0],
      workout,
      workoutName: workout ? workoutName : 'Rest Day',
      water: Number(water),
      calories: Number(calories),
      sleep: Number(sleep),
      steps: Number(steps),
      mood,
      notes,
      heartRate: Number(heartRate),
    }

    addDailyUpdate(newLog)
    addNotification(`Logged daily updates for ${selectedClient.name}`, 'success')
    setShowLogModal(false)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp flex-wrap gap-4" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Activity size={11} style={{ display: 'inline', marginRight: '5px' }} />
            TODAY'S LOGS
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Daily Updates
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleOpenLog}>
            <Plus size={16} /> Log Update
          </button>
          <div className="flex items-center gap-2" style={{
            padding: '8px 16px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }} className="btn-text-hide-sm">Live Logs</span>
          </div>
        </div>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workouts Completed', value: `${completedCount}/${visibleUpdates.length}`, icon: Zap, color: '#FACC15', sub: `${Math.round(completedCount/(visibleUpdates.length || 1)*100)}% completion` },
          { label: 'Avg Water Intake', value: `${avgWater}L`, icon: Droplets, color: '#06b6d4', sub: 'Recommended: 3L' },
          { label: 'Avg Sleep Hours', value: `${avgSleep}h`, icon: Moon, color: '#a78bfa', sub: 'Recommended: 7-9h' },
          { label: 'Avg Calories', value: avgCalories.toLocaleString(), icon: Flame, color: '#f59e0b', sub: 'kcal consumed' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${s.color}10`, border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '2px', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600 }}>{s.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Update Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleUpdates.map((update, idx) => (
          <div
            key={`${update.clientId}-${idx}`}
            className="glass animate-fadeInUp"
            style={{
              padding: '20px', animationDelay: `${idx * 0.07}s`,
              opacity: 0, animationFillMode: 'forwards',
              borderColor: update.workout ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.12)',
            }}
          >
            {/* Client Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`avatar bg-gradient-to-br ${update.avatarColor}`}
                  style={{ width: '42px', height: '42px', fontSize: '0.82rem', borderRadius: '12px' }}
                >
                  {update.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{update.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{update.workoutName}</div>
                </div>
              </div>
              <div style={{
                fontSize: '1.2rem', width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(250, 204, 21,0.08)', border: '1px solid rgba(250, 204, 21,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {moodEmoji[update.mood] || '😊'}
              </div>
            </div>

            {/* Workout Status */}
            <div className="flex items-center gap-2 mb-4" style={{
              padding: '10px 14px', borderRadius: '10px',
              background: update.workout ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
              border: `1px solid ${update.workout ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
            }}>
              {update.workout
                ? <CheckCircle2 size={16} color="#4ade80" />
                : <XCircle size={16} color="#f43f5e" />
              }
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: update.workout ? '#4ade80' : '#f43f5e' }}>
                Workout {update.workout ? 'Completed' : 'Skipped'}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: Droplets, label: 'Water', value: `${update.water}L`, color: '#06b6d4' },
                { icon: Flame, label: 'Calories', value: `${update.calories} kcal`, color: '#f59e0b' },
                { icon: Moon, label: 'Sleep', value: `${update.sleep}h`, color: '#8b5cf6' },
                { icon: Footprints, label: 'Steps', value: update.steps.toLocaleString(), color: '#10b981' },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={13} color={stat.color} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{stat.value}</div>
                  </div>
                )
              })}
            </div>

            {/* Heart Rate */}
            <div className="flex items-center justify-between mb-3" style={{
              padding: '8px 12px', borderRadius: '10px',
              background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.1)',
            }}>
              <div className="flex items-center gap-1.5">
                <Heart size={13} color="#f43f5e" />
                <span style={{ fontSize: '0.75rem', color: 'rgba(244,63,94,0.8)' }}>Resting Heart Rate</span>
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f43f5e' }}>{update.heartRate} bpm</span>
            </div>

            {/* Mood */}
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mood</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: moodColor[update.mood] || '#FDE047' }}>
                {update.mood}
              </span>
            </div>

            {/* Notes */}
            {update.notes && (
              <div style={{
                padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <StickyNote size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{update.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="glass p-6 mt-8">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Daily Activity Feed</h3>
        </div>
        <div className="flex flex-col" style={{ gap: '0' }}>
          {visibleUpdates.map((update, i) => (
            <div key={`${update.clientId}-${i}`} className="flex gap-4" style={{ paddingBottom: '20px', position: 'relative' }}>
              {i < visibleUpdates.length - 1 && (
                <div style={{ position: 'absolute', left: '17px', top: '36px', bottom: '0', width: '1px', background: 'rgba(255,255,255,0.05)' }} />
              )}
              <div
                className={`avatar bg-gradient-to-br ${update.avatarColor} flex-shrink-0`}
                style={{ width: '36px', height: '36px', fontSize: '0.7rem', borderRadius: '10px' }}
              >
                {update.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.87rem', fontWeight: 700, color: 'white' }}>{update.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {update.workout ? `completed ${update.workoutName}` : `skipped workout`}
                  </span>
                  {update.workout
                    ? <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>✓ Done</span>
                    : <span className="badge badge-expired" style={{ fontSize: '0.65rem' }}>✗ Skipped</span>
                  }
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Water {update.water}L · {update.calories} kcal · {update.sleep}h sleep · {update.heartRate} bpm
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LOG DAILY UPDATE MODAL ===== */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>📝 Log Daily Activity</h2>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Select Client</label>
                <select className="input-glass w-full" value={clientId} onChange={e => setClientId(e.target.value)} disabled={!isAdmin}>
                  {isAdmin ? clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  )) : (
                    <option value={currentMember?.id}>{currentMember?.name}</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'white', cursor: 'pointer' }}>
                  <input type="radio" checked={workout} onChange={() => setWorkout(true)} />
                  Workout Done
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'white', cursor: 'pointer' }}>
                  <input type="radio" checked={!workout} onChange={() => setWorkout(false)} />
                  Rest/Skipped
                </label>
              </div>

              {workout && (
                <div>
                  <label className="section-label">Workout Type</label>
                  <input className="input-glass w-full" value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="Chest + Triceps" required />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Water Intake (Liters)</label>
                  <input className="input-glass w-full" type="number" step="0.1" value={water} onChange={e => setWater(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Calories Burned/Kcal</label>
                  <input className="input-glass w-full" type="number" value={calories} onChange={e => setCalories(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Sleep (Hours)</label>
                  <input className="input-glass w-full" type="number" step="0.5" value={sleep} onChange={e => setSleep(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Steps Count</label>
                  <input className="input-glass w-full" type="number" value={steps} onChange={e => setSteps(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Heart Rate (bpm)</label>
                  <input className="input-glass w-full" type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Mood</label>
                  <select className="input-glass w-full" value={mood} onChange={e => setMood(e.target.value)}>
                    <option value="Excellent">Excellent 🔥</option>
                    <option value="Good">Good 😊</option>
                    <option value="Tired">Tired 😴</option>
                    <option value="Poor">Poor 😞</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="section-label">Notes</label>
                <textarea className="input-glass w-full" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Feeling good, pushed hard today..." rows={3} />
              </div>

              <button className="btn-primary w-full justify-center" style={{ padding: '12px' }} type="submit">
                Submit Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
