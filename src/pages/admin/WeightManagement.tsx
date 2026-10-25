// PAGE 6 - WEIGHT MANAGEMENT (Premium Dark Fitness Theme)
import { useState } from 'react'
import { TrendingDown, Target, Scale, Plus, Calendar, Weight, X } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useData } from '../../context/DataContext'
import { findOwnMember, useAuth } from '../../context/AuthContext'

type TooltipPayload = { value: string | number }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111113', border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '10px', padding: '10px 14px', color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
          {payload[0].value} kg
        </div>
      </div>
    )
  }
  return null
}

export default function WeightManagement() {
  const { clients, updateClient, weightHistory, addWeightEntry, weightTableData, addWeightTableEntry, addNotification } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const currentMember = findOwnMember(user, clients) ?? clients[0]

  const [selectedClientId, setSelectedClientId] = useState(String(clients[0]?.id || ''))
  const [showLogModal, setShowLogModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  const selectedClient = isAdmin 
    ? (clients.find(c => String(c.id) === selectedClientId) || clients[0]) 
    : currentMember

  if (!selectedClient) {
    return (
      <div className="page-container" style={{ color: 'var(--text-muted)' }}>
        No clients available. Please add clients first.
      </div>
    )
  }

  const currentWeight = selectedClient.currentWeight
  const goalWeight = selectedClient.goalWeight
  const diff = currentWeight - goalWeight

  // Entries recorded for the member being viewed. Rows written before
  // ownership tracking are attributed to member 1, which is where the demo
  // history lives.
  const ownedHistory = weightHistory.filter(w => (w.clientId ?? 1) === selectedClient.id)
  const ownedTable = weightTableData.filter(w => (w.clientId ?? 1) === selectedClient.id)

  // Progress is measured against this member's own first recorded weigh-in,
  // not a hardcoded starting weight. With only today's value there is no
  // trend to report yet, so the bar sits at 0 rather than inventing one.
  const baseline = ownedHistory[0]?.weight ?? currentWeight
  const span = baseline - goalWeight
  const progress = span === 0
    ? (currentWeight === goalWeight ? 100 : 0)
    : Math.max(0, Math.min(100, Math.round(((baseline - currentWeight) / span) * 100)))
  const bmi = (currentWeight / ((selectedClient.height / 100) ** 2)).toFixed(1)
  const bmiNum = parseFloat(bmi)
  const bmiInfo = bmiNum < 18.5 ? { label: 'Underweight', color: '#A1A1AA' } :
    bmiNum < 25 ? { label: 'Normal', color: '#FFFFFF' } :
    bmiNum < 30 ? { label: 'Overweight', color: '#D4D4D8' } :
    { label: 'Obese', color: '#71717A' }

  // A member with no logged weigh-ins shows a single real data point —
  // their recorded current weight — instead of a fabricated trend line.
  const clientWeightHistory = ownedHistory.length > 0 ? ownedHistory : [
    { date: "Today", weight: selectedClient.currentWeight }
  ]
  const hasOwnHistory = ownedHistory.length > 0
  const weightDelta = baseline - currentWeight

  const clientWeightTableData = ownedTable.length > 0 ? ownedTable : [
    { date: "Today", weight: `${selectedClient.currentWeight} kg`, change: "-", bmi: bmi }
  ]

  const handleOpenLog = () => {
    setNewWeight(String(selectedClient.currentWeight))
    setShowLogModal(true)
  }

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWeight.trim()) return

    const weightNum = Number(newWeight)
    if (!Number.isFinite(weightNum) || weightNum <= 0 || weightNum > 500) {
      addNotification('Enter a weight between 1 and 500 kg', 'warning')
      return
    }

    const oldWeight = selectedClient.currentWeight
    const changeAmount = Number((weightNum - oldWeight).toFixed(1))
    const changeStr = changeAmount > 0 ? `+${changeAmount} kg` : `${changeAmount} kg`

    // Update Client Weight
    updateClient(selectedClient.id, { currentWeight: weightNum })

    const dateLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

    // Add to lists, owned by the member being tracked
    addWeightEntry({ date: dateLabel, weight: weightNum, clientId: selectedClient.id })
    addWeightTableEntry({
      date: dateLabel,
      weight: `${weightNum} kg`,
      change: changeStr,
      bmi: (weightNum / ((selectedClient.height / 100) ** 2)).toFixed(1),
      clientId: selectedClient.id,
    })

    addNotification(`Logged new weight of ${weightNum}kg for ${selectedClient.name}`, 'success')
    setShowLogModal(false)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp flex-wrap gap-4" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Weight size={11} style={{ display: 'inline', marginRight: '5px' }} />
            WEIGHT TRACKING
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Weight Management
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tracking Client:</span>
            <select
              className="input-glass"
              style={{ padding: '4px 10px', fontSize: '0.8rem', height: 'auto', background: 'rgba(255,255,255,0.02)' }}
              value={isAdmin ? selectedClientId : String(currentMember?.id)}
              onChange={e => setSelectedClientId(e.target.value)}
              disabled={!isAdmin}
            >
              {isAdmin ? clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              )) : (
                <option value={currentMember?.id}>{currentMember?.name}</option>
              )}
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={handleOpenLog}>
          <Plus size={16} /> Log Weight
        </button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Current Weight */}
        <div className="stat-card animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={18} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Weight</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {currentWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 600 }}>↓ 0.5 kg from yesterday</div>
        </div>

        {/* Goal Weight */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Goal Weight</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {goalWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#D4D4D8', fontWeight: 600 }}>
            {diff.toFixed(1)} kg to lose
          </div>
        </div>

        {/* BMI Card */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} color={bmiInfo.color} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>BMI Score</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: bmiInfo.color, marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {bmi}
          </div>
          <div style={{ fontSize: '0.75rem', color: bmiInfo.color, fontWeight: 700 }}>{bmiInfo.label}</div>

          {/* BMI Scale */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ height: '5px', borderRadius: '3px', background: 'linear-gradient(90deg, #52525b 0%, #a1a1aa 25%, #e4e4e7 60%, #ffffff 100%)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: `${Math.min(95, Math.max(5, ((bmiNum - 15) / 25) * 100))}%`,
                top: '-4px', width: '12px', height: '12px',
                borderRadius: '50%', background: 'white',
                boxShadow: '0 0 8px rgba(0,0,0,0.4)',
                transform: 'translateX(-50%)',
              }} />
            </div>
            <div className="flex justify-between mt-1">
              {['15', '18.5', '25', '30', '40'].map(v => (
                <span key={v} style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Weight Chart */}
        <div className="glass p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <div className="section-label">Progress Chart</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>Weight Progress</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight logs over time</p>
            </div>
            <span className="badge badge-active">Active Tracking</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={clientWeightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={goalWeight} stroke="#71717A" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Goal', fill: '#A1A1AA', fontSize: 11 }} />
              <Line type="monotone" dataKey="weight" stroke="#FFFFFF" strokeWidth={2.5} dot={{ fill: '#FFFFFF', r: 4, strokeWidth: 2, stroke: '#000000' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Progress */}
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Monthly Progress</h3>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Goal Progress</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: '#FFFFFF' }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {hasOwnHistory ? `${baseline} kg first recorded` : 'No earlier weigh-in on file'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{goalWeight} kg goal</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'First recorded', value: hasOwnHistory ? `${baseline} kg` : '—', color: 'var(--text-secondary)' },
              { label: 'Current weight', value: `${currentWeight} kg`, color: '#FFFFFF' },
              {
                label: weightDelta >= 0 ? 'Weight lost' : 'Weight gained',
                value: `${Math.abs(weightDelta).toFixed(1)} kg`,
                color: '#FFFFFF',
              },
              { label: 'Distance to goal', value: `${Math.abs(diff).toFixed(1)} kg`, color: '#D4D4D8' },
              { label: 'Weigh-ins recorded', value: String(ownedHistory.length), color: '#E4E4E7' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3" style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight History Table */}
      <div className="glass p-6">
        <div className="section-label mb-1">History</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '20px' }}>Weight History Log</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Date', 'Weight', 'Change', 'BMI'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientWeightTableData.map((row, i) => (
                <tr key={i} className="table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.date}</td>
                  <td style={{ padding: '13px 16px', fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{row.weight}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      fontSize: '0.82rem', fontWeight: 700,
                      color: row.change.startsWith('-') ? '#FFFFFF' : row.change === '-' ? 'var(--text-muted)' : '#A1A1AA',
                    }}>
                      {row.change.startsWith('-') ? '↓ ' : ''}{row.change}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.bmi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== LOG WEIGHT MODAL ===== */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>⚖️ Log New Weight</h2>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '2px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Selected Client</label>
                <input className="input-glass w-full" value={selectedClient.name} disabled style={{ opacity: 0.6 }} />
              </div>
              <div>
                <label className="section-label">Weight (kg)</label>
                <input
                  className="input-glass w-full"
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  placeholder="e.g. 78.5"
                  required
                  autoFocus
                />
              </div>

              <button className="btn-primary w-full justify-center" type="submit">
                Log New Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
