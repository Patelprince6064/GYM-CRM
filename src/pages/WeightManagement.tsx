// PAGE 6 - WEIGHT MANAGEMENT (Premium Dark Fitness Theme)
import { TrendingDown, Target, Scale, Plus, Calendar, Weight } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { weightHistory, weightTableData, clients } from '../data/mockData'

const selectedClient = clients[0] // Rahul Sharma

const CustomTooltip = ({ active, payload, label }: any) => {
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

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Weight size={11} style={{ display: 'inline', marginRight: '5px' }} />
            WEIGHT TRACKING
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Weight Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Tracking: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedClient.name}</span>
          </p>
        </div>
        <button className="btn-primary">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="section-label">Progress Chart</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>Weight Progress</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>May – June 2026</p>
            </div>
            <span className="badge badge-active">↓ 1.5 kg total</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightHistory}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[79, 83]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Date', 'Weight', 'Change', 'BMI'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weightTableData.map((row, i) => (
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
    </div>
  )
}
