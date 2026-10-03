import { useState } from 'react'
import {
  Users, Activity, Calendar, Weight, Search,
  Droplets, Flame, Moon, Footprints, ChevronRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useData, type Client } from '../../context/DataContext'

type TabType = 'workout' | 'weight' | 'attendance'

export default function MemberActivity() {
  const { clients, dailyUpdates, weightHistory, weightTableData, attendanceLogs } = useData()
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client>(clients[0])
  const [activeTab, setActiveTab] = useState<TabType>('workout')

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.plan.toLowerCase().includes(search.toLowerCase())
  )

  const currentMember = selectedClient || clients[0]

  // Filter member-specific daily workout activity
  const memberDailyUpdates = dailyUpdates.filter(u => u.clientId === currentMember.id)

  // Filter member-specific attendance logs
  const memberAttendance = attendanceLogs.filter(l => l.clientId === currentMember.id)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp flex-wrap gap-4" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Activity size={11} style={{ display: 'inline', marginRight: '5px' }} />
            ANALYTICS & HISTORY
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Member Activity
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Detailed activity records, weight progression, and attendance history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Members List */}
        <div className="glass p-5 flex flex-col gap-4" style={{ height: 'fit-content' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>Members ({filteredClients.length})</span>
            <Users size={16} color="var(--accent-primary)" />
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-glass w-full"
              style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
              placeholder="Search member..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredClients.map(client => {
              const isSelected = client.id === currentMember.id
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid rgba(250,204,21,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className={`avatar bg-gradient-to-br ${client.avatarColor}`} style={{ width: '38px', height: '38px', fontSize: '0.75rem', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                    {client.avatarUrl ? <img src={client.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : client.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#FACC15' : 'white' }}>{client.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{client.plan} · {client.currentWeight} kg</div>
                  </div>
                  <ChevronRight size={15} color={isSelected ? '#FACC15' : 'var(--text-muted)'} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Member Detail Activity Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Member Header Card */}
          <div className="glass-strong p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className={`avatar bg-gradient-to-br ${currentMember.avatarColor}`} style={{ width: '64px', height: '64px', fontSize: '1.2rem', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              {currentMember.avatarUrl ? <img src={currentMember.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : currentMember.avatar}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }} className="sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{currentMember.name}</h2>
                <span className="badge badge-active">{currentMember.status}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FACC15', background: 'rgba(250,204,21,0.1)', padding: '2px 10px', borderRadius: '12px' }}>
                  {currentMember.plan}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Goal: {currentMember.goal} · Height: {currentMember.height} cm · Weight: {currentMember.currentWeight} kg → Goal: {currentMember.goalWeight} kg
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="glass p-2 flex gap-2">
            {[
              { id: 'workout', label: 'Daily Workout Activity', icon: Activity },
              { id: 'weight', label: 'Weight History', icon: Weight },
              { id: 'attendance', label: 'Attendance History', icon: Calendar },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: isActive ? 'rgba(250,204,21,0.15)' : 'transparent',
                    color: isActive ? '#FACC15' : 'var(--text-muted)',
                    border: isActive ? '1px solid rgba(250,204,21,0.3)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* TAB 1: WORKOUT ACTIVITY */}
          {activeTab === 'workout' && (
            <div className="glass p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Daily Workout Logs</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{memberDailyUpdates.length} updates recorded</span>
              </div>

              {memberDailyUpdates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No logged workout activity recorded for {currentMember.name} yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {memberDailyUpdates.map((update, idx) => (
                    <div key={idx} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{update.workoutName}</span>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                            background: update.workout ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)',
                            color: update.workout ? '#4ade80' : '#f43f5e',
                            border: update.workout ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(244,63,94,0.2)'
                          }}>
                            {update.workout ? 'Completed ✓' : 'Incomplete / Rest'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{update.date}</span>
                      </div>

                      {/* Stat chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(6,182,212,0.08)' }}>
                          <Droplets size={13} color="#06b6d4" />
                          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700 }}>{update.water} L Water</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)' }}>
                          <Flame size={13} color="#f59e0b" />
                          <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>{update.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(167,139,250,0.08)' }}>
                          <Moon size={13} color="#a78bfa" />
                          <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700 }}>{update.sleep} hrs Sleep</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)' }}>
                          <Footprints size={13} color="#4ade80" />
                          <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>{update.steps} steps</span>
                        </div>
                      </div>

                      {update.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px' }}>
                          "{update.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEIGHT HISTORY */}
          {activeTab === 'weight' && (
            <div className="glass p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Weight Progression</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day-wise weight records & trend chart</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FACC15' }}>{currentMember.currentWeight} kg</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Goal: {currentMember.goalWeight} kg</div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111', borderColor: 'rgba(250,204,21,0.3)', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#FACC15" strokeWidth={2.5} dot={{ fill: '#FACC15', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Date', 'Recorded Weight', 'Change', 'BMI Score'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weightTableData.map((row, i) => (
                      <tr key={i} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>{row.date}</td>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: '#FACC15', fontWeight: 800 }}>{row.weight}</td>
                        <td style={{ padding: '12px', fontSize: '0.82rem', fontWeight: 700, color: row.change.startsWith('-') ? '#4ade80' : row.change === '-' ? 'var(--text-muted)' : '#f43f5e' }}>
                          {row.change}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{row.bmi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="glass p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Attendance Log</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & check-in timestamps</p>
                </div>
                <span className="badge badge-active" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                  {currentMember.attendance}% Attendance Rate
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Date', 'Status', 'Check-In Time', 'Check-Out Time'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {memberAttendance.slice(0, 15).map(log => (
                      <tr key={log.id} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>{log.date}</td>
                        <td style={{ padding: '12px' }}>
                          {log.present ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4ade80', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                              ✓ Present
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
                              ✗ Absent
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: log.present ? '#FACC15' : 'var(--text-muted)', fontWeight: log.present ? 700 : 400 }}>
                          {log.present ? log.checkInTime : '—'}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {log.present ? (log.checkOutTime || '1 Hour Later') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
