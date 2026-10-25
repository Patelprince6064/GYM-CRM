import { useState } from 'react'
import {
  Users, Activity, Calendar, Weight, Search,
  Droplets, Flame, Moon, Footprints, ChevronRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useData } from '../../context/DataContext'
import { findOwnMember, useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui'

type TabType = 'workout' | 'weight' | 'attendance'

export default function MemberActivity() {
  const { clients, dailyUpdates, weightHistory, weightTableData, attendanceLogs } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [search, setSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('workout')

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.plan?.toLowerCase().includes(search.toLowerCase())
  )

  const ownMember = findOwnMember(user, clients) ?? clients[0]
  const currentMember = isAdmin
    ? (clients.find(c => c.id === selectedClientId) ?? ownMember)
    : ownMember

  const memberDailyUpdates = dailyUpdates.filter(u => u.clientId === currentMember.id)
  const memberAttendance = attendanceLogs.filter(l => l.clientId === currentMember.id)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="section-label">
            <Activity size={12} style={{ display: 'inline', marginRight: '5px' }} />
            ANALYTICS & HISTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Member Activity
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Activity logs, weight progression curves, and timestamped attendance history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Members List */}
        <div className="glass p-5 flex flex-col gap-4" style={{ height: 'fit-content' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-white">Members ({filteredClients.length})</span>
            <Users size={16} color="#FFFFFF" />
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717A' }} />
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
                  onClick={() => setSelectedClientId(client.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedClientId(client.id)
                    }
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <Avatar name={client.name} initials={client.avatarUrl ? undefined : client.avatar} src={client.avatarUrl} color={client.avatarColor} size={38} radius={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-bold text-white truncate">{client.name}</div>
                    <div className="text-xs text-zinc-400">{client.plan} · {client.currentWeight} kg</div>
                  </div>
                  <ChevronRight size={15} color={isSelected ? '#FFFFFF' : '#71717A'} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Member Detail Activity Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Member Header Card */}
          <div className="glass-strong p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar
              name={currentMember.name}
              initials={currentMember.avatarUrl ? undefined : currentMember.avatar}
              src={currentMember.avatarUrl}
              color={currentMember.avatarColor}
              size={64}
              radius={16}
              fontSize={20}
            />
            <div style={{ flex: 1 }} className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-extrabold text-white">{currentMember.name}</h2>
                <span className="badge badge-active">{currentMember.status}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800, color: '#000000',
                  background: '#FFFFFF', padding: '2px 10px', borderRadius: '999px',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {currentMember.plan}
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Goal: <span className="text-zinc-200">{currentMember.goal}</span> · Height: {currentMember.height} cm · Weight: {currentMember.currentWeight} kg (Target: {currentMember.goalWeight} kg)
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="glass p-2 flex gap-2">
            {[
              { id: 'workout', label: 'Workout Activity', icon: Activity },
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
                    flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#000000' : 'var(--text-muted)',
                    border: isActive ? '1px solid #FFFFFF' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
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
            <div className="glass p-6 sm:p-7 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Daily Workout Logs</h3>
                <span className="text-xs text-zinc-400">{memberDailyUpdates.length} updates recorded</span>
              </div>

              {memberDailyUpdates.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-sm">
                  No logged workout activity recorded for {currentMember.name} yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {memberDailyUpdates.map((update, idx) => (
                    <div key={idx} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-white">{update.workoutName}</span>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px',
                            background: update.workout ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            color: update.workout ? '#FFFFFF' : '#71717A',
                            border: '1px solid rgba(255,255,255,0.15)',
                          }}>
                            {update.workout ? 'Completed ✓' : 'Rest Day'}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">{update.date}</span>
                      </div>

                      {/* Stat chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Droplets size={13} color="#FFFFFF" />
                          <span className="text-xs text-zinc-200 font-semibold">{update.water} L Water</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Flame size={13} color="#FFFFFF" />
                          <span className="text-xs text-zinc-200 font-semibold">{update.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Moon size={13} color="#FFFFFF" />
                          <span className="text-xs text-zinc-200 font-semibold">{update.sleep} hrs Sleep</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Footprints size={13} color="#FFFFFF" />
                          <span className="text-xs text-zinc-200 font-semibold">{update.steps} steps</span>
                        </div>
                      </div>

                      {update.notes && (
                        <div className="text-xs text-zinc-400 italic p-2.5 rounded-lg mt-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
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
            <div className="glass p-6 sm:p-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Weight Progression</h3>
                  <p className="text-xs text-zinc-400">Recorded history and trend curve</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white">{currentMember.currentWeight} kg</span>
                  <div className="text-xs text-zinc-400">Target: {currentMember.goalWeight} kg</div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111113', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', color: '#FFFFFF' }} />
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

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Date', 'Recorded Weight', 'Change', 'BMI Score'].map(h => (
                        <th key={h} className="text-left p-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {weightTableData.map((row, i) => (
                      <tr key={i} className="table-row">
                        <td className="p-3 text-xs text-white font-medium">{row.date}</td>
                        <td className="p-3 text-xs text-white font-extrabold">{row.weight}</td>
                        <td className="p-3 text-xs font-bold text-zinc-300">
                          {row.change}
                        </td>
                        <td className="p-3 text-xs text-zinc-400">{row.bmi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="glass p-6 sm:p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Attendance Log</h3>
                  <p className="text-xs text-zinc-400">Date & timestamped check-in records</p>
                </div>
                <span className="badge badge-active" style={{ fontSize: '0.72rem', padding: '4px 12px' }}>
                  {currentMember.attendance}% Attendance Rate
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Date', 'Status', 'Check-In Time', 'Check-Out Time'].map(h => (
                        <th key={h} className="text-left p-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {memberAttendance.slice(0, 15).map(log => (
                      <tr key={log.id} className="table-row">
                        <td className="p-3 text-xs text-white font-medium">{log.date}</td>
                        <td className="p-3">
                          {log.present ? (
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 800, color: '#000000',
                              background: '#FFFFFF', padding: '3px 10px', borderRadius: '6px',
                            }}>
                              ✓ Present
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 600, color: '#71717A',
                              background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: '6px',
                            }}>
                              ✗ Absent
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-zinc-200">
                          {log.present ? log.checkInTime : '—'}
                        </td>
                        <td className="p-3 text-xs text-zinc-400">
                          {log.present ? (log.checkOutTime || '—') : '—'}
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
