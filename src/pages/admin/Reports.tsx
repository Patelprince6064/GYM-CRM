import { useMemo, useState } from 'react'
import {
  CalendarRange,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
} from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useToast } from '@/components/ui'
import { Button, Card, EmptyState, PageHeading, StatCard, ChartCard } from '@/components/ui'
import { attendanceSeries, DEFAULT_RULES, downloadCSV, membershipPhase, toISODate } from '@/lib/insights'

type DatasetKey = 'members' | 'memberships' | 'attendance' | 'logs'
type RangeKey = 'all' | '7' | '30' | '90' | '365'

const DATASETS: { key: DatasetKey; label: string; icon: typeof Users; blurb: string }[] = [
  { key: 'members', label: 'Members', icon: Users, blurb: 'Profiles, goals and body metrics' },
  { key: 'memberships', label: 'Memberships', icon: CalendarRange, blurb: 'Plan terms and expiry dates' },
  { key: 'attendance', label: 'Attendance', icon: FileSpreadsheet, blurb: 'One row per check-in' },
  { key: 'logs', label: 'Daily logs', icon: FileText, blurb: 'Water, sleep, steps and mood' },
]

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: 'all', label: 'All dates', days: null },
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '90', label: 'Last 90 days', days: 90 },
  { key: '365', label: 'Last 12 months', days: 365 },
]

const PREVIEW_LIMIT = 25

function within(iso: string | undefined, days: number | null): boolean {
  if (days == null) return true
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return d.getTime() >= cutoff.getTime()
}

/**
 * Reporting: date-filtered datasets with a real CSV download.
 * Every cell is escaped (and formula-guarded) by `toCSV` before it
 * reaches a spreadsheet.
 */
export default function Reports() {
  const { clients, attendanceLogs, dailyUpdates, isHydrating, isBackendConnected } = useData()
  const toast = useToast()

  const [dataset, setDataset] = useState<DatasetKey>('members')
  const [range, setRange] = useState<RangeKey>('30')

  const days = RANGES.find((r) => r.key === range)?.days ?? null

  const rows = useMemo<Record<string, unknown>[]>(() => {
    if (dataset === 'members') {
      return clients
        .filter((c) => within(c.startDate, days))
        .map((c) => ({
          Name: c.name,
          Age: c.age,
          Email: c.email ?? '',
          Phone: c.phone ?? '',
          Plan: c.plan,
          Goal: c.goal ?? '',
          'Current weight (kg)': c.currentWeight,
          'Goal weight (kg)': c.goalWeight,
          Height: c.height,
          Address: c.address ?? '',
          Notes: c.notes ?? '',
          'Joined': c.startDate,
        }))
    }

    if (dataset === 'memberships') {
      return clients
        .filter((c) => within(c.endDate, days))
        .map((c) => ({
          Name: c.name,
          Plan: c.plan,
          'Start date': c.startDate,
          'End date': c.endDate,
          'Days remaining': c.remainingDays,
          Status: c.status,
          'Membership amount': c.membershipAmount ?? '',
        }))
    }

    if (dataset === 'attendance') {
      return attendanceLogs
        .filter((l) => within(l.date, days))
        .map((l) => ({
          Date: l.date,
          Member: clients.find((c) => c.id === l.clientId)?.name ?? `Member #${l.clientId}`,
          'Check-in': l.checkInTime || '',
          'Check-out': l.checkOutTime || '',
          Present: l.present ? 'Yes' : 'No',
        }))
    }

    return dailyUpdates
      .filter((u) => within(u.date, days))
      .map((u) => ({
        Date: u.date,
        Member: u.name,
        Workout: u.workout ? u.workoutName || 'Yes' : 'Rest day',
        Water: u.water,
        Calories: u.calories,
        Sleep: u.sleep,
        Steps: u.steps,
        Mood: u.mood,
        'Heart rate': u.heartRate,
        Notes: u.notes ?? '',
      }))
  }, [dataset, days, clients, attendanceLogs, dailyUpdates])

  const headers = rows.length > 0 ? Object.keys(rows[0]) : []

  const meta = DATASETS.find((d) => d.key === dataset)!

  const summary = useMemo(() => {
    const now = new Date()
    const phase = clients.map((c) => membershipPhase(c, now, DEFAULT_RULES))
    return {
      rows: rows.length,
      columns: headers.length,
      active: phase.filter((p) => p === 'active').length,
      checkins: attendanceLogs.filter((l) => l.present && within(l.date, days)).length,
      checkedInToday: attendanceLogs.filter((l) => l.present && l.date === toISODate(now)).length,
      expiring: phase.filter((p) => p === 'expiring').length,
    }
  }, [rows, headers.length, clients, attendanceLogs, days])

  const series = useMemo(
    () => attendanceSeries(attendanceLogs, Math.min(days ?? 30, 60), new Date()),
    [attendanceLogs, days],
  )
  const emptySeries = series.every((p) => p.visits === 0)

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.toast('Nothing to export for this selection', 'error')
      return
    }
    const filename = `${dataset}-${range === 'all' ? 'all-dates' : `last-${range}d`}-${toISODate(new Date())}`
    downloadCSV(filename, rows)
    toast.toast(`Downloaded ${rows.length} row${rows.length === 1 ? '' : 's'} as CSV`, 'success')
  }

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Workspace"
        title="Reports"
        description="Pick a dataset, set a date window, preview it, then export. CSV cells are quoted and formula-guarded so spreadsheet apps treat them as text."
        actions={
          <Button
            icon={<Download size={16} />}
            onClick={exportCsv}
            disabled={rows.length === 0}
            loading={false}
          >
            Download CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Rows in view" value={summary.rows} icon={FileSpreadsheet} color="#FFFFFF" caption={`${meta.label} · ${RANGES.find((r) => r.key === range)?.label}`} />
        <StatCard label="Columns" value={summary.columns} icon={FileText} color="#E4E4E7" caption="Exported as CSV headers" />
        <StatCard label="Active members" value={summary.active} icon={Users} color="#D4D4D8" caption="Valid membership today" />
        <StatCard label="Check-ins in range" value={summary.checkins} icon={CalendarRange} color="#A1A1AA" caption={`${summary.checkedInToday} today`} />
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          <div style={{ flex: 1 }}>
            <div className="section-label mb-3">Dataset</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Report dataset">
              {DATASETS.map((d) => {
                const active = d.key === dataset
                return (
                  <button
                    key={d.key}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDataset(d.key)}
                    className="text-left rounded-xl p-3 transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : 'var(--border-faint)'}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <d.icon size={14} color={active ? '#FFFFFF' : '#969B93'} aria-hidden />
                      <span className="text-[0.8rem] font-bold" style={{ color: active ? '#FFFFFF' : 'var(--text-primary)' }}>
                        {d.label}
                      </span>
                    </div>
                    <div className="text-[0.66rem] mt-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                      {d.blurb}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="section-label mb-3">Date range</div>
            <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Date range">
              {RANGES.map((r) => {
                const active = r.key === range
                return (
                  <button
                    key={r.key}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setRange(r.key)}
                    className="px-3 py-2 rounded-lg text-[0.74rem] font-bold whitespace-nowrap transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#FFFFFF' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : 'var(--border-faint)'}`,
                    }}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        {/* Preview table */}
        <Card padded={false}>
          <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-faint)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="section-label">Preview</div>
                <h2 className="text-base font-bold text-white">{meta.label}</h2>
              </div>
              <div className="text-[0.7rem] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <span className="badge badge-neutral">{rows.length} rows</span>
                <span aria-hidden>·</span>
                <span>{isBackendConnected ? 'Live API data' : 'Local data (API offline)'}</span>
              </div>
            </div>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title={isHydrating ? 'Loading records…' : 'No rows in this window'}
              description={
                isHydrating
                  ? 'Reading the workspace…'
                  : `Nothing in the ${meta.label.toLowerCase()} dataset falls inside “${
                      RANGES.find((r) => r.key === range)?.label
                    }”. Widen the range to see more.`
              }
              action={
                range !== 'all' ? (
                  <Button variant="secondary" size="sm" onClick={() => setRange('all')}>
                    Show all dates
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto" style={{ maxHeight: 520, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, PREVIEW_LIMIT).map((row, i) => (
                    <tr key={i}>
                      {headers.map((h) => (
                        <td key={h} title={String(row[h] ?? '')}>
                          {row[h] === '' || row[h] == null ? <span className="text-faint">—</span> : String(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > PREVIEW_LIMIT && (
                <div
                  className="px-5 py-3 text-[0.7rem]"
                  style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-faint)' }}
                >
                  Showing the first {PREVIEW_LIMIT} of {rows.length} rows. The CSV export contains every row.
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Attendance trend + notes */}
        <div className="flex flex-col gap-6">
          <ChartCard
            label="Trend"
            title="Attendance in range"
            description={days == null ? 'Last 60 days' : `Last ${Math.min(days, 60)} days`}
            loading={isHydrating}
            empty={emptySeries}
            emptyTitle="No check-ins recorded"
            emptyDescription="Once members start checking in, this chart fills in from the attendance table."
            height={200}
          >
            <div className="flex items-end gap-[3px]" style={{ height: 150 }} role="img" aria-label="Attendance bar chart">
              {series.map((p, i) => {
                const max = Math.max(...series.map((s) => s.visits), 1)
                return (
                  <div
                    key={p.date}
                    title={`${p.label}: ${p.visits} visit${p.visits === 1 ? '' : 's'}`}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${Math.max((p.visits / max) * 100, 2)}%`,
                      background:
                        p.visits === 0
                          ? 'rgba(255,255,255,0.07)'
                          : `linear-gradient(180deg, rgba(198,255,61,${0.45 + (i / series.length) * 0.45}), rgba(198,255,61,0.16))`,
                      transition: 'height 420ms cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
              <span>{series[0]?.label}</span>
              <span>{series[series.length - 1]?.label}</span>
            </div>
          </ChartCard>

          <Card>
            <div className="section-label">Export notes</div>
            <ul className="flex flex-col gap-3 mt-3 text-[0.76rem]" style={{ color: 'var(--text-secondary)' }}>
              <li>
                <strong className="text-white">Escaping.</strong> Commas, quotes and line breaks are quoted per
                RFC 4180; values starting with <code>=</code>, <code>+</code>, <code>-</code> or <code>@</code> are
                prefixed with an apostrophe so they can't execute in a spreadsheet.
              </li>
              <li>
                <strong className="text-white">Scope.</strong> Exports contain exactly the rows you can see — no
                hidden columns and no synthetic totals.
              </li>
              <li>
                <strong className="text-white">Renewals.</strong> {summary.expiring} membership
                {summary.expiring === 1 ? '' : 's'} expire within {DEFAULT_RULES.expiryWarnDays} days.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
