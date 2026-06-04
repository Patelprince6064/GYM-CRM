// PAGE 4 - WORKOUT SCHEDULING (Premium Dark Fitness Theme)
import { useState } from 'react'
import { Plus, Edit2, Clock, Flame, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { workoutSchedule } from '../data/mockData'

const intensityColor: Record<string, string> = {
  'Very High': '#f43f5e',
  'High': '#FF6B00',
  'Medium': '#f59e0b',
  'Low': '#4ade80',
}

export default function WorkoutSchedules() {
  const [expanded, setExpanded] = useState<string | null>('Tuesday')

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Calendar size={11} style={{ display: 'inline', marginRight: '5px' }} />
            TRAINING PLAN
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Workout Schedules
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Weekly training plan · <span style={{ color: '#4ade80', fontWeight: 700 }}>6</span> active days
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Edit2 size={15} /> Edit Schedule
          </button>
          <button className="btn-primary">
            <Plus size={16} /> Assign Workout
          </button>
        </div>
      </div>

      {/* Day Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {workoutSchedule.map((item, idx) => {
          const isToday = item.day === 'Tuesday'
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
                  border: isToday ? '1px solid rgba(255,107,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isToday ? '0 0 30px rgba(255,107,0,0.1)' : undefined,
                }}
              >
                {/* Card Top Gradient Bar */}
                <div style={{ height: '4px', background: `linear-gradient(90deg, ${item.color.replace('from-', '').replace(' to-', ', ').split(',')[0]})`, backgroundImage: `linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}>
                  <div style={{ height: '4px', background: item.isRest ? 'linear-gradient(90deg, #475569, #64748b)' : item.day === 'Monday' ? 'linear-gradient(90deg,#7c3aed,#6d28d9)' : item.day === 'Tuesday' ? 'linear-gradient(90deg,#2563eb,#0891b2)' : item.day === 'Wednesday' ? 'linear-gradient(90deg,#059669,#0d9488)' : item.day === 'Thursday' ? 'linear-gradient(90deg,#d97706,#ea580c)' : item.day === 'Friday' ? 'linear-gradient(90deg,#e11d48,#db2777)' : item.day === 'Saturday' ? 'linear-gradient(90deg,#9333ea,#7c3aed)' : 'linear-gradient(90deg,#475569,#64748b)' }} />
                </div>

                <div style={{ padding: '20px' }}>
                  {/* Day Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center text-2xl"
                        style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.15)' }}
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
                        background: 'rgba(255,107,0,0.12)', color: 'var(--accent-primary)',
                        border: '1px solid rgba(255,107,0,0.25)',
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
                  <div className="flex gap-2 mt-4">
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.78rem' }}>
                      <Plus size={13} /> Assign
                    </button>
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
                      <Edit2 size={13} />
                    </button>
                  </div>
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
            { label: 'Active Training Days', value: '6', color: '#FF6B00' },
            { label: 'Total Weekly Duration', value: '355 min', color: '#4ade80' },
            { label: 'Avg Session Length', value: '59 min', color: '#f59e0b' },
            { label: 'Rest Days', value: '1', color: 'var(--text-muted)' },
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
    </div>
  )
}
