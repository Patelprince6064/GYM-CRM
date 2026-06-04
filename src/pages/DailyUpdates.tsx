// PAGE 5 - DAILY UPDATES (Premium Dark Fitness Theme)
import { CheckCircle2, XCircle, Droplets, Flame, Moon, Footprints, Heart, StickyNote, TrendingUp, Zap, Activity } from 'lucide-react'
import { dailyUpdates } from '../data/mockData'

const moodColor: Record<string, string> = {
  'Excellent': '#4ade80',
  'Good': '#FF8C42',
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
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const completedCount = dailyUpdates.filter(u => u.workout).length
  const avgWater = (dailyUpdates.reduce((s, u) => s + u.water, 0) / dailyUpdates.length).toFixed(1)
  const avgSleep = (dailyUpdates.reduce((s, u) => s + u.sleep, 0) / dailyUpdates.length).toFixed(1)
  const avgCalories = Math.round(dailyUpdates.reduce((s, u) => s + u.calories, 0) / dailyUpdates.length)

  return (
    <div style={{ padding: '32px', maxWidth: '1300px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
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
        <div className="flex items-center gap-2" style={{
          padding: '8px 16px', borderRadius: '10px',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
        }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }}>Live Updates</span>
        </div>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workouts Completed', value: `${completedCount}/${dailyUpdates.length}`, icon: Zap, color: '#FF6B00', sub: `${Math.round(completedCount/dailyUpdates.length*100)}% completion` },
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
        {dailyUpdates.map((update, idx) => (
          <div
            key={update.clientId}
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
                background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: moodColor[update.mood] || '#FF8C42' }}>
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
          {dailyUpdates.map((update, i) => (
            <div key={update.clientId} className="flex gap-4" style={{ paddingBottom: '20px', position: 'relative' }}>
              {i < dailyUpdates.length - 1 && (
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
                    {update.workout ? `completed ${update.workoutName}` : `skipped ${update.workoutName}`}
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
    </div>
  )
}
