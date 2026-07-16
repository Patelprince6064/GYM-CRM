// PAGE 4 - WORKOUT SCHEDULING (Premium Dark Fitness Theme)
import { useState } from 'react'
import { Plus, Edit2, Clock, Flame, ChevronDown, ChevronUp, Calendar, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { workoutSchedule as initialWorkoutSchedule } from '../data/mockData'

const intensityColor: Record<string, string> = {
  'Very High': '#f43f5e',
  'High': '#FACC15',
  'Medium': '#f59e0b',
  'Low': '#4ade80',
}

interface WorkoutDay {
  day: string
  short: string
  focus: string
  exercises: string[]
  duration: string
  intensity: string
  color: string
  icon: string
  isRest: boolean
}

export default function WorkoutSchedules() {
  const { user } = useAuth()
  const { clients, addNotification } = useData()
  const [schedules, setSchedules] = useState<WorkoutDay[]>(initialWorkoutSchedule)
  const [expanded, setExpanded] = useState<string | null>('Tuesday')

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Edit form states
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null)
  const [editFocus, setEditFocus] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editIntensity, setEditIntensity] = useState('Medium')
  const [editExercises, setEditExercises] = useState('')

  // Assign form states
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedDay, setSelectedDay] = useState('Monday')

  const handleOpenEdit = (dayObj: WorkoutDay) => {
    setEditingDay(dayObj)
    setEditFocus(dayObj.focus)
    setEditDuration(dayObj.duration)
    setEditIntensity(dayObj.intensity)
    setEditExercises(dayObj.exercises.join('\n'))
    setShowEditModal(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDay) return

    setSchedules(prev => prev.map(s => {
      if (s.day === editingDay.day) {
        return {
          ...s,
          focus: editFocus,
          duration: editDuration,
          intensity: editIntensity,
          exercises: editExercises.split('\n').filter(ex => ex.trim() !== ''),
          isRest: editFocus.toLowerCase().includes('rest')
        }
      }
      return s
    }))

    addNotification(`Workout schedule for ${editingDay.day} updated`, 'info')
    setShowEditModal(false)
  }

  const handleOpenAssign = (dayName?: string) => {
    if (clients.length > 0) {
      setSelectedClientId(String(clients[0].id))
    }
    if (dayName) {
      setSelectedDay(dayName)
    }
    setShowAssignModal(true)
  }

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const client = clients.find(c => String(c.id) === selectedClientId)
    const dayObj = schedules.find(s => s.day === selectedDay)

    if (client && dayObj) {
      addNotification(`Assigned "${dayObj.focus}" workout to ${client.name} for ${selectedDay}`, 'success')
      alert(`Successfully assigned ${selectedDay}'s workout (${dayObj.focus}) to ${client.name}!`)
    }
    setShowAssignModal(false)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp flex-wrap gap-4" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Calendar size={11} style={{ display: 'inline', marginRight: '5px' }} />
            TRAINING PLAN
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Workout Schedules
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Weekly training plan · <span style={{ color: '#4ade80', fontWeight: 700 }}>{schedules.filter(s => !s.isRest).length}</span> active days
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => handleOpenAssign()}>
              Assign Workout
            </button>
          </div>
        )}
      </div>

      {/* Day Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {schedules.map((item, idx) => {
          const todayDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
          const isToday = item.day === todayDayName
          const isOpen = expanded === item.day

          return (
            <div
              key={item.day}
              className="animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.07}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div
                className="glass"
                style={{
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: isToday ? '1px solid rgba(250, 204, 21,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isToday ? '0 0 30px rgba(250, 204, 21,0.1)' : undefined,
                }}
              >
                {/* Card Top Gradient Bar */}
                <div style={{ height: '4px', background: item.isRest ? 'linear-gradient(90deg, #475569, #64748b)' : item.day === 'Monday' ? 'linear-gradient(90deg,#7c3aed,#6d28d9)' : item.day === 'Tuesday' ? 'linear-gradient(90deg,#2563eb,#0891b2)' : item.day === 'Wednesday' ? 'linear-gradient(90deg,#059669,#0d9488)' : item.day === 'Thursday' ? 'linear-gradient(90deg,#d97706,#ea580c)' : item.day === 'Friday' ? 'linear-gradient(90deg,#e11d48,#db2777)' : item.day === 'Saturday' ? 'linear-gradient(90deg,#9333ea,#7c3aed)' : 'linear-gradient(90deg,#475569,#64748b)' }} />

                <div style={{ padding: '20px' }}>
                  {/* Day Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center text-2xl"
                        style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(250, 204, 21,0.08)', border: '1px solid rgba(250, 204, 21,0.15)' }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{item.day}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.focus}</div>
                      </div>
                    </div>
                    {isToday && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        background: 'rgba(250, 204, 21,0.12)', color: 'var(--accent-primary)',
                        border: '1px solid rgba(250, 204, 21,0.25)',
                        padding: '3px 10px', borderRadius: '12px',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>TODAY</span>
                    )}
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame size={13} color={intensityColor[item.intensity] || '#6366f1'} />
                      <span style={{ fontSize: '0.78rem', color: intensityColor[item.intensity] || '#6366f1', fontWeight: 600 }}>{item.intensity}</span>
                    </div>
                  </div>

                  {/* Exercise Preview */}
                  {!item.isRest ? (
                    <>
                      <div className="flex flex-col gap-1.5" style={{ marginBottom: '12px' }}>
                        {(isOpen ? item.exercises : item.exercises.slice(0, 3)).map((ex, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, opacity: 0.7 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex}</span>
                          </div>
                        ))}
                      </div>
                      {item.exercises.length > 3 && (
                        <button
                          onClick={() => setExpanded(isOpen ? null : item.day)}
                          className="flex items-center gap-1"
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          {isOpen ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> +{item.exercises.length - 3} more exercises</>}
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{
                      padding: '12px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.82rem', color: 'var(--text-muted)',
                      textAlign: 'center', fontStyle: 'italic',
                    }}>
                      🧘 Active recovery & mobility
                    </div>
                  )}

                  {/* Action buttons */}
                  {user?.role === 'admin' && (
                    <div className="flex gap-2 mt-4">
                      <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.78rem' }} onClick={() => handleOpenAssign(item.day)}>
                        <Plus size={13} /> Assign
                      </button>
                      <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.78rem' }} onClick={() => handleOpenEdit(item)}>
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Bar */}
      <div className="glass p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="section-label" style={{ marginBottom: 0 }}>Weekly Summary</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Training Days', value: String(schedules.filter(s => !s.isRest).length), color: '#FACC15' },
            { label: 'Total Weekly Duration', value: `${schedules.reduce((acc, s) => acc + parseInt(s.duration || '0'), 0)} min`, color: '#4ade80' },
            { label: 'Avg Session Length', value: `${Math.round(schedules.reduce((acc, s) => acc + parseInt(s.duration || '0'), 0) / (schedules.filter(s => !s.isRest).length || 1))} min`, color: '#f59e0b' },
            { label: 'Rest Days', value: String(schedules.filter(s => s.isRest).length), color: 'var(--text-muted)' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '16px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, marginBottom: '4px', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== EDIT SCHEDULE MODAL ===== */}
      {showEditModal && editingDay && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>✏️ Edit {editingDay.day}'s Schedule</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Focus / Target Muscle</label>
                <input className="input-glass w-full" value={editFocus} onChange={e => setEditFocus(e.target.value)} required />
              </div>
              <div>
                <label className="section-label">Duration (e.g. 60 min)</label>
                <input className="input-glass w-full" value={editDuration} onChange={e => setEditDuration(e.target.value)} required />
              </div>
              <div>
                <label className="section-label">Intensity</label>
                <select className="input-glass w-full" value={editIntensity} onChange={e => setEditIntensity(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>
              <div>
                <label className="section-label">Exercises (One per line)</label>
                <textarea
                  className="input-glass w-full"
                  value={editExercises}
                  onChange={e => setEditExercises(e.target.value)}
                  rows={6}
                  style={{ minHeight: '140px' }}
                  required
                />
              </div>

              <button className="btn-primary w-full justify-center" type="submit">
                Save Workout Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== ASSIGN WORKOUT MODAL ===== */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>📋 Assign Workout to Client</h2>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Select Client</label>
                <select className="input-glass w-full" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                  {clients.length === 0 ? (
                    <option disabled>No clients available</option>
                  ) : (
                    clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.plan})</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="section-label">Select Training Day</label>
                <select className="input-glass w-full" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                  {schedules.map(s => (
                    <option key={s.day} value={s.day}>{s.day} - {s.focus}</option>
                  ))}
                </select>
              </div>

              <button className="btn-primary w-full justify-center" type="submit" disabled={clients.length === 0}>
                Assign Program
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
