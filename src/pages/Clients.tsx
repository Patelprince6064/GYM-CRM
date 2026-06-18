// PAGE 3 - CLIENT MANAGEMENT (Premium Dark Fitness Theme)
import { useState } from 'react'
import { Search, Plus, Filter, Phone, Mail, Target, X, ChevronRight, Users } from 'lucide-react'
import { clients } from '../data/mockData'

function getStatusClass(status: string) {
  if (status === 'Active') return 'badge badge-active'
  if (status === 'Expiring') return 'badge badge-expiring'
  return 'badge badge-expired'
}

function getPlanColor(plan: string) {
  if (plan === 'Elite') return '#FACC15'
  if (plan === 'Premium') return '#FDE047'
  return 'var(--text-secondary)'
}

export default function Clients() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<typeof clients[0] | null>(null)

  const filters = ['All', 'Active', 'Expiring', 'Expired']

  const filtered = clients.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.plan.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter
    return matchSearch && matchFilter
  })

  const bmi = selected
    ? (selected.currentWeight / ((selected.height / 100) ** 2)).toFixed(1)
    : null

  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#06b6d4' }
    if (bmi < 25) return { label: 'Normal', color: '#4ade80' }
    if (bmi < 30) return { label: 'Overweight', color: '#fbbf24' }
    return { label: 'Obese', color: '#f43f5e' }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
        <div>
          <div className="section-label">
            <Users size={11} style={{ display: 'inline', marginRight: '5px' }} />
            MANAGEMENT
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Client Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span style={{ color: '#4ade80', fontWeight: 700 }}>{clients.filter(c => c.status === 'Active').length}</span> active ·{' '}
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{clients.filter(c => c.status === 'Expiring').length}</span> expiring ·{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{clients.length} total</span>
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main Table Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-glass w-full"
                style={{ paddingLeft: '38px' }}
                placeholder="Search by name, phone, plan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: filter === f ? '1px solid rgba(250, 204, 21,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    background: filter === f ? 'rgba(250, 204, 21,0.12)' : '#1A1A1A',
                    color: filter === f ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Client Table */}
          <div className="glass" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Profile', 'Name', 'Phone', 'Plan', 'Start Date', 'End Date', 'Days Left', 'Weight', 'Status', ''].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '14px 12px',
                      fontSize: '0.68rem', fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="table-row"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: selected?.id === client.id ? 'rgba(250, 204, 21,0.06)' : undefined,
                    }}
                    onClick={() => setSelected(selected?.id === client.id ? null : client)}
                  >
                    <td style={{ padding: '12px' }}>
                      <div
                        className={`avatar bg-gradient-to-br ${client.avatarColor}`}
                        style={{ width: '36px', height: '36px', fontSize: '0.7rem', borderRadius: '10px' }}
                      >
                        {client.avatar}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'white' }}>{client.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Age {client.age}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{client.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: getPlanColor(client.plan) }}>{client.plan}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(client.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(client.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '0.87rem', fontWeight: 800,
                        color: client.remainingDays === 0 ? '#f43f5e' : client.remainingDays <= 14 ? '#fbbf24' : '#4ade80',
                      }}>
                        {client.remainingDays === 0 ? 'Expired' : `${client.remainingDays}d`}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {client.currentWeight} kg
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={getStatusClass(client.status)}>{client.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <ChevronRight size={15} style={{ color: selected?.id === client.id ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No clients match your search.
              </div>
            )}
          </div>
        </div>

        {/* Client Detail Card */}
        {selected && (
          <div
            className="glass-strong animate-scaleIn"
            style={{
              width: '300px', flexShrink: 0, padding: '24px', alignSelf: 'flex-start',
              position: 'sticky', top: '32px', animationFillMode: 'forwards',
            }}
          >
            {/* Top Yellow Bar */}
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <div className="flex items-center justify-between mb-5">
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-primary)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Client Profile</span>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 6px' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div
                className={`bg-gradient-to-br ${selected.avatarColor} flex items-center justify-center text-white font-black text-xl mb-3`}
                style={{ width: '72px', height: '72px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {selected.avatar}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>{selected.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Age {selected.age} · {selected.goal}</div>
              <span className={`${getStatusClass(selected.status)} mt-2`}>{selected.status}</span>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex items-center gap-2.5">
                <Phone size={13} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selected.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={13} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Target size={13} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Goal: {selected.goal}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Membership Plan', value: selected.plan, color: getPlanColor(selected.plan) },
                { label: 'Start Date', value: new Date(selected.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'End Date', value: new Date(selected.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'Days Remaining', value: selected.remainingDays === 0 ? 'Expired' : `${selected.remainingDays} days`, color: selected.remainingDays <= 14 ? '#fbbf24' : '#4ade80' },
                { label: 'Current Weight', value: `${selected.currentWeight} kg` },
                { label: 'Goal Weight', value: `${selected.goalWeight} kg` },
                { label: 'Height', value: `${selected.height} cm` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: (item as any).color || 'white' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* BMI */}
            {bmi && (() => {
              const bmiNum = parseFloat(bmi)
              const info = getBmiLabel(bmiNum)
              return (
                <div style={{
                  marginTop: '16px', padding: '12px', borderRadius: '12px',
                  background: `${info.color}08`, border: `1px solid ${info.color}20`,
                }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>BMI Score</div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: info.color }}>{bmi}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: info.color }}>{info.label}</span>
                  </div>
                </div>
              )
            })()}

            {/* Attendance Bar */}
            <div style={{ marginTop: '16px' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attendance</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ade80' }}>{selected.attendance}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${selected.attendance}%`, background: 'linear-gradient(90deg, #FACC15, #FDE047)' }} />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '0.8rem' }}>Edit</button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '0.8rem' }}>Message</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
