// PAGE 6 - WEIGHT MANAGEMENT (Premium Dark Fitness Theme)
import { useState } from 'react'
import { TrendingDown, Target, Scale, Plus, Calendar, Weight, X } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

type TooltipPayload = { value: string | number }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1A1A1A', border: '1px solid rgba(250, 204, 21,0.2)',
        borderRadius: '10px', padding: '10px 14px', color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FACC15' }}>
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
  const currentMember = clients.find(c => c.email.toLowerCase() === user?.email?.toLowerCase()) || clients[0]

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
  const startWeight = 82.0
  const diff = currentWeight - goalWeight
  const progress = Math.min(100, Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100))
  const bmi = (currentWeight / ((selectedClient.height / 100) ** 2)).toFixed(1)
  const bmiNum = parseFloat(bmi)
  const bmiInfo = bmiNum < 18.5 ? { label: 'Underweight', color: '#06b6d4' } :
    bmiNum < 25 ? { label: 'Normal', color: '#4ade80' } :
    bmiNum < 30 ? { label: 'Overweight', color: '#f59e0b' } :
    { label: 'Obese', color: '#f43f5e' }

  // Filter weight entries relative to client weight (Rahul Sharma gets default history; other clients start with their current weight)
  const clientWeightHistory = selectedClient.id === 1 ? weightHistory : [
    { date: "01 Jun", weight: selectedClient.currentWeight + 1.5 },
    { date: "03 Jun", weight: selectedClient.currentWeight + 0.8 },
    { date: "Today", weight: selectedClient.currentWeight }
  ]

  const clientWeightTableData = selectedClient.id === 1 ? weightTableData : [
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
    const oldWeight = selectedClient.currentWeight
    const changeAmount = (weightNum - oldWeight).toFixed(1)
    const changeStr = Number(changeAmount) > 0 ? `+${changeAmount} kg` : `${changeAmount} kg`

    // Update Client Weight
    updateClient(selectedClient.id, { currentWeight: weightNum })

    const dateLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

    // Add to lists
    addWeightEntry({ date: dateLabel, weight: weightNum })
    addWeightTableEntry({
      date: dateLabel,
      weight: `${weightNum} kg`,
      change: changeStr,
      bmi: (weightNum / ((selectedClient.height / 100) ** 2)).toFixed(1)
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
        <div className="stat-card animate-fadeInUp" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(250, 204, 21,0.08)', border: '1px solid rgba(250, 204, 21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={18} color="var(--accent-primary)" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Weight</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {currentWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>↓ 0.5 kg from yesterday</div>
        </div>

        {/* Goal Weight */}
        <div className="stat-card animate-fadeInUp delay-100" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} color="#4ade80" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Goal Weight</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {goalWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
            {diff.toFixed(1)} kg to lose
          </div>
        </div>

        {/* BMI Card */}
        <div className="stat-card animate-fadeInUp delay-200" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${bmiInfo.color}10`, border: `1px solid ${bmiInfo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div style={{ height: '5px', borderRadius: '3px', background: 'linear-gradient(90deg, #06b6d4 0%, #4ade80 25%, #f59e0b 60%, #f43f5e 100%)', position: 'relative' }}>
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
              <ReferenceLine y={goalWeight} stroke="#4ade80" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Goal', fill: '#4ade80', fontSize: 11 }} />
              <Line type="monotone" dataKey="weight" stroke="#FACC15" strokeWidth={2.5} dot={{ fill: '#FACC15', r: 4, strokeWidth: 2, stroke: '#0A0A0A' }} activeDot={{ r: 6 }} />
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
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4ade80' }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FACC15, #FDE047)' }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{startWeight} kg start</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{goalWeight} kg goal</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Starting Weight', value: `${startWeight} kg`, color: 'var(--text-secondary)' },
              { label: 'Current Weight', value: `${currentWeight} kg`, color: 'var(--accent-primary)' },
              { label: 'Weight Lost', value: `${(startWeight - currentWeight).toFixed(1)} kg`, color: '#4ade80' },
              { label: 'Remaining to Goal', value: `${diff.toFixed(1)} kg`, color: '#fbbf24' },
              { label: 'Est. Completion', value: '~Aug 2026', color: '#a78bfa' },
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
                      color: row.change.startsWith('-') ? '#4ade80' : row.change === '-' ? 'var(--text-muted)' : '#f43f5e',
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
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

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
