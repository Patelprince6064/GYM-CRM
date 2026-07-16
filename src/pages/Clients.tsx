// PAGE 3 - CLIENT MANAGEMENT (Premium Dark Fitness Theme)
import { useState } from 'react'
import { Search, Plus, Phone, Mail, Target, X, ChevronRight, Users, Trash2, Edit2, MessageSquare } from 'lucide-react'
import { useData, type Client } from '../context/DataContext'

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
  const { clients, addClient, updateClient, deleteClient, addNotification } = useData()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Client | null>(null)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('Premium')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('Weight Loss')
  const [status, setStatus] = useState('Active')

  // Message state
  const [messageText, setMessageText] = useState('')

  const filters = ['All', 'Active', 'Expiring', 'Expired']

  const filtered = clients.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.plan.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter
    return matchSearch && matchFilter
  })

  const selectedClient = clients.find(c => c.id === selected?.id) || null

  const bmi = selectedClient
    ? (selectedClient.currentWeight / ((selectedClient.height / 100) ** 2)).toFixed(1)
    : null

  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#06b6d4' }
    if (bmi < 25) return { label: 'Normal', color: '#4ade80' }
    if (bmi < 30) return { label: 'Overweight', color: '#fbbf24' }
    return { label: 'Obese', color: '#f43f5e' }
  }

  const handleOpenAdd = () => {
    setName('')
    setAge('25')
    setPhone('')
    setEmail('')
    setPlan('Premium')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    setWeight('70')
    setGoalWeight('65')
    setHeight('170')
    setGoal('Weight Loss')
    setStatus('Active')
    setShowAddModal(true)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !email) {
      alert('Please fill out Name, Phone, and Email')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.max(0, end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    addClient({
      name,
      age: Number(age),
      phone,
      email,
      plan,
      startDate,
      endDate,
      remainingDays: diffDays,
      currentWeight: Number(weight),
      goalWeight: Number(goalWeight),
      height: Number(height),
      status,
      goal,
      attendance: 100
    })


    setShowAddModal(false)
  }

  const handleOpenEdit = () => {
    if (!selectedClient) return
    setName(selectedClient.name)
    setAge(String(selectedClient.age))
    setPhone(selectedClient.phone)
    setEmail(selectedClient.email)
    setPlan(selectedClient.plan)
    setStartDate(selectedClient.startDate)
    setEndDate(selectedClient.endDate)
    setWeight(String(selectedClient.currentWeight))
    setGoalWeight(String(selectedClient.goalWeight))
    setHeight(String(selectedClient.height))
    setGoal(selectedClient.goal)
    setStatus(selectedClient.status)
    setShowEditModal(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.max(0, end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    updateClient(selectedClient.id, {
      name,
      age: Number(age),
      phone,
      email,
      plan,
      startDate,
      endDate,
      remainingDays: diffDays,
      currentWeight: Number(weight),
      goalWeight: Number(goalWeight),
      height: Number(height),
      status,
      goal
    })

    setShowEditModal(false)
    addNotification(`Updated profile details for "${name}"`, 'info')
  }

  const handleDelete = () => {
    if (!selectedClient) return
    if (window.confirm(`Are you sure you want to delete ${selectedClient.name}?`)) {
      deleteClient(selectedClient.id)
      setSelected(null)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || !messageText.trim()) return
    addNotification(`Message sent to ${selectedClient.name}: "${messageText.slice(0, 30)}..."`, 'success')
    setMessageText('')
    setShowMessageModal(false)
    alert(`Message sent to ${selectedClient.name}!`)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeInUp flex-wrap gap-4" style={{ animationFillMode: 'forwards' }}>
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
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Table Area */}
        <div style={{ flex: selectedClient ? 1 : '1 1 100%', minWidth: 0, transition: 'all 0.3s ease' }}>
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
            <div className="flex items-center gap-2 flex-wrap">
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
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
                        style={{ width: '36px', height: '36px', fontSize: '0.7rem', borderRadius: '10px', overflow: 'hidden' }}
                      >
                        {client.avatarUrl ? (
                          <img src={client.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : client.avatar}
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
        {selectedClient && (
          <div
            className="glass-strong animate-scaleIn"
            style={{
              flex: 1, minWidth: 0, alignSelf: 'flex-start',
              position: 'sticky', top: '32px', animationFillMode: 'forwards',
              padding: '16px', borderRadius: '16px'
            }}
          >
            {/* Top Yellow Bar */}
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '12px' }} />

            <div className="flex items-center justify-between mb-4">
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-primary)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Client Profile</span>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px 5px' }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-4">
              <div
                className={`bg-gradient-to-br ${selectedClient.avatarColor} flex items-center justify-center text-white font-black text-lg mb-2`}
                style={{ width: '56px', height: '56px', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', overflow: 'hidden' }}
              >
                {selectedClient.avatarUrl ? (
                  <img src={selectedClient.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : selectedClient.avatar}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white' }}>{selectedClient.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>Age {selectedClient.age} · {selectedClient.goal}</div>
              <span className={`${getStatusClass(selectedClient.status)} mt-1.5`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{selectedClient.status}</span>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-2">
                <Phone size={11} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedClient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={11} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedClient.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={11} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Goal: {selectedClient.goal}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Membership Plan', value: selectedClient.plan, color: getPlanColor(selectedClient.plan) },
                { label: 'Start Date', value: new Date(selectedClient.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'End Date', value: new Date(selectedClient.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { label: 'Days Remaining', value: selectedClient.remainingDays === 0 ? 'Expired' : `${selectedClient.remainingDays} days`, color: selectedClient.remainingDays <= 14 ? '#fbbf24' : '#4ade80' },
                { label: 'Current Weight', value: `${selectedClient.currentWeight} kg` },
                { label: 'Goal Weight', value: `${selectedClient.goalWeight} kg` },
                { label: 'Height', value: `${selectedClient.height} cm` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (item as {color?: string}).color || 'white' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* BMI */}
            {bmi && (() => {
              const bmiNum = parseFloat(bmi)
              const info = getBmiLabel(bmiNum)
              return (
                <div style={{
                  marginTop: '12px', padding: '10px', borderRadius: '10px',
                  background: `${info.color}08`, border: `1px solid ${info.color}20`,
                }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BMI Score</div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: info.color }}>{bmi}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: info.color }}>{info.label}</span>
                  </div>
                </div>
              )
            })()}

            {/* Attendance Bar */}
            <div style={{ marginTop: '12px' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80' }}>{selectedClient.attendance}%</span>
              </div>
              <div className="progress-bar" style={{ height: '5px' }}>
                <div className="progress-fill" style={{ width: `${selectedClient.attendance}%`, background: 'linear-gradient(90deg, #FACC15, #FDE047)' }} />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.75rem' }} onClick={handleOpenEdit}>
                <Edit2 size={12} /> Edit
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.75rem' }} onClick={() => setShowMessageModal(true)}>
                <MessageSquare size={12} /> Message
              </button>
              <button className="btn-danger" style={{ padding: '8px' }} onClick={handleDelete} title="Delete Client">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== ADD CLIENT MODAL ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>➕ Add New Client</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Full Name</label>
                  <input className="input-glass w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
                </div>
                <div>
                  <label className="section-label">Age</label>
                  <input className="input-glass w-full" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" required />
                </div>
                <div>
                  <label className="section-label">Phone</label>
                  <input className="input-glass w-full" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" required />
                </div>
                <div>
                  <label className="section-label">Email</label>
                  <input className="input-glass w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="@email.com" required />
                </div>
                <div>
                  <label className="section-label">Plan</label>
                  <select className="input-glass w-full" value={plan} onChange={e => setPlan(e.target.value)}>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Goal</label>
                  <select className="input-glass w-full" value={goal} onChange={e => setGoal(e.target.value)}>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Toning">Toning</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Start Date</label>
                  <input className="input-glass w-full" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">End Date</label>
                  <input className="input-glass w-full" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Height (cm)</label>
                  <input className="input-glass w-full" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" required />
                </div>
                <div>
                  <label className="section-label">Current Weight (kg)</label>
                  <input className="input-glass w-full" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="80" required />
                </div>
                <div>
                  <label className="section-label">Goal Weight (kg)</label>
                  <input className="input-glass w-full" type="number" step="0.1" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} placeholder="72" required />
                </div>
                <div>
                  <label className="section-label">Status</label>
                  <select className="input-glass w-full" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Expiring">Expiring</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary w-full justify-center" style={{ marginTop: '12px', padding: '12px' }} type="submit">
                Create Client Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT CLIENT MODAL ===== */}
      {showEditModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>✏️ Edit Client Profile</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="section-label">Full Name</label>
                  <input className="input-glass w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" required />
                </div>
                <div>
                  <label className="section-label">Age</label>
                  <input className="input-glass w-full" type="number" value={age} onChange={e => setAge(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Phone</label>
                  <input className="input-glass w-full" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Email</label>
                  <input className="input-glass w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Plan</label>
                  <select className="input-glass w-full" value={plan} onChange={e => setPlan(e.target.value)}>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Goal</label>
                  <select className="input-glass w-full" value={goal} onChange={e => setGoal(e.target.value)}>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Toning">Toning</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Start Date</label>
                  <input className="input-glass w-full" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">End Date</label>
                  <input className="input-glass w-full" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Height (cm)</label>
                  <input className="input-glass w-full" type="number" value={height} onChange={e => setHeight(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Current Weight (kg)</label>
                  <input className="input-glass w-full" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Goal Weight (kg)</label>
                  <input className="input-glass w-full" type="number" step="0.1" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} required />
                </div>
                <div>
                  <label className="section-label">Status</label>
                  <select className="input-glass w-full" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Expiring">Expiring</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary w-full justify-center" style={{ marginTop: '12px', padding: '12px' }} type="submit">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== SEND MESSAGE MODAL ===== */}
      {showMessageModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>💬 Send Message to {selectedClient.name}</h2>
              <button onClick={() => setShowMessageModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #FACC15, #FDE047)', borderRadius: '2px', marginBottom: '20px' }} />

            <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
              <div>
                <label className="section-label">Message Text</label>
                <textarea
                  className="input-glass w-full"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  required
                  rows={4}
                  style={{ minHeight: '120px' }}
                />
              </div>

              <button className="btn-primary w-full justify-center" type="submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
