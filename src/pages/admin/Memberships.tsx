import { useMemo, useState } from 'react'
import { ArrowDownUp, CalendarClock, CheckCircle2, Download, RefreshCcw, Search, Users, XCircle } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useToast } from '@/components/ui'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeading,
  StatCard,
  StatusBadge,
  ConfirmDialog,
} from '@/components/ui'
import { Avatar } from '@/components/ui/Avatar'
import type { Client } from '@/types'
import {
  daysUntil,
  DEFAULT_RULES,
  downloadCSV,
  expiryLabel,
  formatFullDate,
  lastVisit,
  membershipPhase,
  toISODate,
} from '@/lib/insights'

/** Plan term used when a membership is renewed. Mirrors the seed durations. */
const PLAN_DAYS: Record<string, number> = { Basic: 30, Premium: 180, Elite: 365 }

type Filter = 'all' | 'active' | 'expiring' | 'expired'
type SortKey = 'expiry' | 'name' | 'plan'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Expiring ≤14d' },
  { key: 'expired', label: 'Expired' },
]

function nextTerm(client: Client, from = new Date()): string {
  const term = PLAN_DAYS[client.plan] ?? 180
  const anchor = Math.max(daysUntil(client.endDate, from), 0)
  const start = new Date(from)
  start.setDate(start.getDate() + anchor)
  const end = new Date(start)
  end.setDate(end.getDate() + term)
  return end.toISOString().split('T')[0]
}

/**
 * Membership lifecycle view: real expiry dates, derived status, and a
 * renewal action that extends the record rather than pretending to charge
 * a card. No payment processing happens here.
 */
export default function Memberships() {
  const { clients, updateClient, attendanceLogs, isHydrating } = useData()
  const toast = useToast()

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('expiry')
  const [asc, setAsc] = useState(true)
  const [renewTarget, setRenewTarget] = useState<Client | null>(null)

  const today = useMemo(() => new Date(), [])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const phase = (c: Client) => membershipPhase(c, today, DEFAULT_RULES)

    const filtered = clients
      .filter((c) => {
        if (filter !== 'all' && phase(c) !== filter) return false
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q) ||
          c.plan?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
        )
      })
      .map((c) => ({ client: c, days: daysUntil(c.endDate, today), phase: phase(c) }))

    const dir = asc ? 1 : -1
    return filtered.sort((a, b) => {
      if (sort === 'name') return a.client.name.localeCompare(b.client.name) * dir
      if (sort === 'plan') return a.client.plan.localeCompare(b.client.plan) * dir
      return (a.days - b.days) * dir
    })
  }, [clients, filter, query, sort, asc, today])

  const summary = useMemo(() => {
    const list = clients.map((c) => membershipPhase(c, today, DEFAULT_RULES))
    const amount = clients.reduce((sum, c) => sum + (c.membershipAmount ?? 0), 0)
    return {
      total: clients.length,
      active: list.filter((p) => p === 'active').length,
      expiring: list.filter((p) => p === 'expiring').length,
      expired: list.filter((p) => p === 'expired').length,
      recorded: amount,
      anyAmount: clients.some((c) => (c.membershipAmount ?? 0) > 0),
    }
  }, [clients, today])

  const toggleSort = (key: SortKey) => {
    if (sort === key) setAsc((v) => !v)
    else {
      setSort(key)
      setAsc(true)
    }
  }

  const confirmRenew = async () => {
    if (!renewTarget) return
    const endDate = nextTerm(renewTarget, today)
    const start = renewalStart(renewTarget, today)
    await updateClient(renewTarget.id, {
      startDate: start,
      endDate,
      status: 'Active',
      remainingDays: daysUntil(endDate, today),
    })
    toast.toast(`${renewTarget.name} renewed until ${formatFullDate(endDate)}`, 'success')
    setRenewTarget(null)
  }

  const exportCsv = () => {
    const data = rows.map(({ client, days, phase }) => ({
      Name: client.name,
      Email: client.email ?? '',
      Phone: client.phone ?? '',
      Plan: client.plan,
      'Start date': client.startDate,
      'End date': client.endDate,
      'Days remaining': days,
      Status: phase === 'active' ? 'Active' : phase === 'expiring' ? 'Expiring' : 'Expired',
      'Last visit': lastVisit(attendanceLogs, client.id)?.date ?? 'No check-ins on record',
      'Membership amount': client.membershipAmount ?? '',
    }))
    downloadCSV(`memberships-${today.toISOString().split('T')[0]}`, data)
    toast.toast(`Exported ${data.length} membership row${data.length === 1 ? '' : 's'}`, 'success')
  }

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Workspace"
        title="Memberships"
        description="Every start and end date on the book. Status is derived from the dates — never from a stale flag."
        actions={
          <Button variant="secondary" icon={<Download size={16} />} onClick={exportCsv} disabled={rows.length === 0}>
            Export CSV
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="On the books" value={summary.total} icon={Users} color="#FFFFFF" caption="Total member records" delay={0} />
        <StatCard label="Active" value={summary.active} icon={CheckCircle2} color="#E4E4E7" caption="Membership valid today" delay={0.05} />
        <StatCard
          label={`Expiring ≤${DEFAULT_RULES.expiryWarnDays}d`}
          value={summary.expiring}
          icon={CalendarClock}
          color="#D4D4D8"
          caption="Follow up this fortnight"
          delay={0.1}
        />
        <StatCard label="Expired" value={summary.expired} icon={XCircle} color="#71717A" caption="Needs a win-back call" delay={0.15} />
      </div>

      <Card padded={false}>
        {/* Controls */}
        <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-faint)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div
              className="flex gap-1 p-1 rounded-xl overflow-x-auto max-w-full"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}
              role="tablist"
              aria-label="Filter memberships"
            >
              {FILTERS.map((f) => {
                const active = filter === f.key
                return (
                  <button
                    key={f.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f.key)}
                    className="px-3.5 py-2 rounded-lg text-[0.76rem] font-bold whitespace-nowrap transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: active ? '#FFFFFF' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
                    }}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>

            <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg flex-1 sm:flex-none sm:min-w-[260px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)' }}
            >
              <Search size={15} className="text-faint" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search member, plan or phone…"
                aria-label="Search memberships"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', padding: 0 }}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-faint">
                  <XCircle size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="flex items-center gap-3 mt-4 text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
            <button className="inline-flex items-center gap-1.5 font-bold hover:text-white transition-colors" onClick={() => toggleSort('expiry')}>
              <ArrowDownUp size={12} aria-hidden />
              Sort: {sort === 'expiry' ? 'Expiry' : sort === 'name' ? 'Name' : 'Plan'} {asc ? '↑' : '↓'}
            </button>
            <span aria-hidden>·</span>
            <button
              className="inline-flex items-center gap-1.5 font-bold hover:text-white transition-colors"
              onClick={() => toggleSort(sort)}
            >
              Reverse
            </button>
            <span>·</span>
            <span>
              {rows.length} of {clients.length} shown
            </span>
          </div>
        </div>

        {/* Table / cards */}
        {rows.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={isHydrating ? 'Loading memberships…' : 'Nothing matches this view'}
            description={
              isHydrating
                ? 'Reading membership records from the workspace.'
                : query
                  ? `No member matches “${query}”. Try a different name, plan or phone number.`
                  : 'No memberships in this state right now — switch filters to see the rest.'
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>
                      <button className="table-sort" onClick={() => toggleSort('plan')}>
                        Plan <ArrowDownUp size={11} aria-hidden />
                      </button>
                    </th>
                    <th>Start</th>
                    <th>
                      <button className="table-sort" onClick={() => toggleSort('expiry')}>
                        Ends <ArrowDownUp size={11} aria-hidden />
                      </button>
                    </th>
                    <th>Status</th>
                    <th>Last visit</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ client, days, phase }, i) => (
                    <tr key={client.id} style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={client.name} color={client.avatarColor} size={34} radius={10} />
                          <div style={{ minWidth: 0 }}>
                            <div className="text-[0.84rem] font-semibold text-white truncate">{client.name}</div>
                            <div className="text-[0.68rem] truncate" style={{ color: 'var(--text-muted)' }}>
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge tone={client.plan === 'Elite' ? 'lime' : client.plan === 'Premium' ? 'success' : 'neutral'}>
                          {client.plan}
                        </Badge>
                      </td>
                      <td className="table-date">{formatFullDate(client.startDate)}</td>
                      <td>
                        <div className="text-[0.78rem] font-semibold text-white">{formatFullDate(client.endDate)}</div>
                        <div
                          className="text-[0.66rem]"
                          style={{ color: days < 0 ? '#71717A' : days <= DEFAULT_RULES.expiryWarnDays ? '#D4D4D8' : 'var(--text-muted)' }}
                        >
                          {expiryLabel(client, today)}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={phase === 'active' ? 'Active' : phase === 'expiring' ? 'Expiring' : 'Expired'} />
                      </td>
                      <td className="text-[0.76rem]" style={{ color: 'var(--text-secondary)' }}>
                        {(() => {
                          const last = lastVisit(attendanceLogs, client.id)
                          return last ? last.date : 'No check-ins'
                        })()}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Button size="sm" variant="secondary" icon={<RefreshCcw size={13} />} onClick={() => setRenewTarget(client)}>
                          Renew
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3 p-4">
              {rows.map(({ client, days, phase }) => (
                <div key={client.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={client.name} color={client.avatarColor} size={38} radius={11} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-[0.88rem] font-bold text-white truncate">{client.name}</div>
                      <div className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
                        {client.plan} plan
                      </div>
                    </div>
                    <StatusBadge status={phase === 'active' ? 'Active' : phase === 'expiring' ? 'Expiring' : 'Expired'} />
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-[0.72rem] mb-3">
                    <div>
                      <dt style={{ color: 'var(--text-muted)' }}>Started</dt>
                      <dd className="text-white font-semibold">{formatFullDate(client.startDate)}</dd>
                    </div>
                    <div>
                      <dt style={{ color: 'var(--text-muted)' }}>Ends</dt>
                      <dd className="text-white font-semibold">{formatFullDate(client.endDate)}</dd>
                    </div>
                    <div>
                      <dt style={{ color: 'var(--text-muted)' }}>Remaining</dt>
                      <dd style={{ color: days < 0 ? '#71717A' : days <= DEFAULT_RULES.expiryWarnDays ? '#D4D4D8' : '#FFFFFF' }}>
                        {expiryLabel(client, today)}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ color: 'var(--text-muted)' }}>Last visit</dt>
                      <dd className="text-white font-semibold">{lastVisit(attendanceLogs, client.id)?.date ?? 'None'}</dd>
                    </div>
                  </dl>
                  <Button size="sm" variant="secondary" icon={<RefreshCcw size={13} />} fullWidth onClick={() => setRenewTarget(client)}>
                    Renew membership
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Recorded value — honest empty state when nothing has been entered */}
      <Card className="mt-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="section-label">Recorded membership value</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {summary.anyAmount ? summary.recorded.toLocaleString('en-IN') : '—'}
            </div>
            <p className="text-xs mt-1.5 text-faint max-w-md leading-relaxed">
              {summary.anyAmount
                ? 'Sum of the membership amount field across the records above. This is data your team typed in — it is not a payment ledger.'
                : 'No membership amounts have been recorded yet. Add one on the member record and it will show up here.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle2 size={14} color="#FFFFFF" aria-hidden />
            Renewals are recorded by staff — no checkout is involved.
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(renewTarget)}
        title={`Renew ${renewTarget?.name ?? ''}'s membership?`}
        description={
          renewTarget
            ? `This extends the ${renewTarget.plan} plan from ${formatFullDate(renewTarget.endDate)} to ${formatFullDate(
                nextTerm(renewTarget, today),
              )}. No payment is taken — record it against your own billing system.`
            : ''
        }
        confirmLabel="Confirm renewal"
        onConfirm={confirmRenew}
        onCancel={() => setRenewTarget(null)}
      />

      <p className="text-[0.7rem] mt-6 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <XCircle size={13} aria-hidden />
        One record per member — renewals never create a duplicate row or duplicate alert.
      </p>
    </div>
  )
}

/** Renewals can extend from a lapsed date; the start anchor is today then. */
function renewalStart(client: Client, from: Date): string {
  const left = daysUntil(client.endDate, from)
  return left < 0 ? toISODate(from) : client.startDate
}
