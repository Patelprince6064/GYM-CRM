/**
 * Deterministic insight engine.
 *
 * Every function here is a *transparent rule* over records we actually
 * hold — no ML, no invented predictions. Each derived value can be traced
 * back to a specific member, date or count, which is what makes the
 * dashboard, the landing-page intelligence section and the CSV reports
 * agree with each other.
 */
import type { AttendanceLog, Client, DailyUpdate, WeightEntry } from '@/types'

export const DAY_MS = 86_400_000

export const DEFAULT_RULES = {
  /** Days before expiry at which a member is flagged for renewal follow-up. */
  expiryWarnDays: 14,
  /** Days without a recorded check-in at which a member is flagged as inactive. */
  inactiveDays: 21,
  /** Relative drop in visits required to flag an engagement decline. */
  declineThreshold: 0.4,
} as const

export type InsightRules = { [K in keyof typeof DEFAULT_RULES]: number }

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

/** Local-safe "YYYY-MM-DD" for a Date (avoids UTC off-by-one). */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse "YYYY-MM-DD" as a local date so expiry maths never drifts. */
export function parseISODate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / DAY_MS)
}

/** Days until an ISO date. Negative once the date has passed. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const d = parseISODate(iso)
  if (!d) return Number.POSITIVE_INFINITY
  return daysBetween(from, d)
}

/** Days since an ISO date. Negative for future dates. */
export function daysSince(iso: string, from: Date = new Date()): number {
  const d = parseISODate(iso)
  if (!d) return Number.POSITIVE_INFINITY
  return daysBetween(d, from)
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFullDate(iso: string): string {
  const d = parseISODate(iso)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/* ------------------------------------------------------------------ */
/* Membership state                                                    */
/* ------------------------------------------------------------------ */

export type MembershipPhase = 'active' | 'expiring' | 'expired'

export function remainingDays(client: Client, from: Date = new Date()): number {
  return daysUntil(client.endDate, from)
}

export function membershipPhase(
  client: Client,
  from: Date = new Date(),
  rules: InsightRules = DEFAULT_RULES,
): MembershipPhase {
  const left = remainingDays(client, from)
  if (!Number.isFinite(left)) return 'active'
  if (left < 0) return 'expired'
  if (left <= rules.expiryWarnDays) return 'expiring'
  return 'active'
}

/** "42 days left" / "expired 3 days ago" — never confuses the two. */
export function expiryLabel(client: Client, from: Date = new Date()): string {
  const left = remainingDays(client, from)
  if (!Number.isFinite(left)) return 'No expiry set'
  if (left < 0) return `Expired ${Math.abs(left)}d ago`
  if (left === 0) return 'Expires today'
  return `${left}d left`
}

/* ------------------------------------------------------------------ */
/* Attendance helpers                                                  */
/* ------------------------------------------------------------------ */

export function visitLogsFor(logs: AttendanceLog[], clientId: number): AttendanceLog[] {
  return logs.filter((l) => l.clientId === clientId && l.present)
}

export function lastVisit(logs: AttendanceLog[], clientId: number): AttendanceLog | null {
  const visits = visitLogsFor(logs, clientId)
  if (visits.length === 0) return null
  return visits.reduce((a, b) => (a.date >= b.date ? a : b))
}

export function visitsInRange(
  logs: AttendanceLog[],
  clientId: number,
  from: Date,
  to: Date = new Date(),
): number {
  return logs.filter((l) => {
    if (l.clientId !== clientId || !l.present) return false
    const d = parseISODate(l.date)
    if (!d) return false
    const delta = daysBetween(from, d)
    return delta >= 0 && delta <= daysBetween(from, to)
  }).length
}

/** Current consecutive-day check-in streak (today or yesterday must be present). */
export function currentStreak(logs: AttendanceLog[], clientId: number): number {
  const dates = new Set(visitLogsFor(logs, clientId).map((l) => l.date))
  if (dates.size === 0) return 0
  const cursor = new Date()
  if (!dates.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1)
  if (!dates.has(toISODate(cursor))) return 0
  let streak = 0
  while (dates.has(toISODate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/* ------------------------------------------------------------------ */
/* Engagement signals                                                  */
/* ------------------------------------------------------------------ */

export type SignalKind = 'expiry' | 'inactive' | 'decline' | 'incomplete'
export type Severity = 'high' | 'medium' | 'low'

export interface EngagementSignal {
  /** Stable key so dismissals survive re-computation. */
  id: string
  kind: SignalKind
  clientId: number
  clientName: string
  severity: Severity
  headline: string
  /** Plain-language explanation of *why* this member was flagged. */
  reason: string
  metricLabel: string
  metricValue: string
}

/**
 * Flags members that may deserve a follow-up, using only recorded facts:
 *  1. expiry      — membership ends within `expiryWarnDays` (or has ended)
 *  2. inactive    — no recorded check-in for `inactiveDays`
 *  3. decline     — recent visits dropped by `declineThreshold` vs prior period
 *  4. incomplete  — required contact fields are missing
 *
 * These are operational prompts for gym staff, not medical judgements.
 */
export function engagementSignals(
  clients: Client[],
  logs: AttendanceLog[],
  rules: InsightRules = DEFAULT_RULES,
  from: Date = new Date(),
): EngagementSignal[] {
  const out: EngagementSignal[] = []

  for (const client of clients) {
    const left = remainingDays(client, from)

    if (Number.isFinite(left) && left < 0) {
      out.push({
        id: `expiry:${client.id}`,
        kind: 'expiry',
        clientId: client.id,
        clientName: client.name,
        severity: 'high',
        headline: 'Membership expired',
        reason: `Plan ${client.plan} ended on ${formatFullDate(client.endDate)} — ${Math.abs(left)} days ago.`,
        metricLabel: 'Expired',
        metricValue: `${Math.abs(left)}d ago`,
      })
    } else if (Number.isFinite(left) && left <= rules.expiryWarnDays) {
      out.push({
        id: `expiry:${client.id}`,
        kind: 'expiry',
        clientId: client.id,
        clientName: client.name,
        severity: left <= 3 ? 'high' : 'medium',
        headline: 'Renewal due',
        reason: `Plan ${client.plan} ends ${formatFullDate(client.endDate)} — ${left} day${left === 1 ? '' : 's'} from now.`,
        metricLabel: 'Expires in',
        metricValue: `${left}d`,
      })
    }

    const last = lastVisit(logs, client.id)
    const idle = last ? daysSince(last.date, from) : null
    if (idle === null) {
      if (client.startDate && daysSince(client.startDate, from) >= rules.inactiveDays) {
        out.push({
          id: `inactive:${client.id}`,
          kind: 'inactive',
          clientId: client.id,
          clientName: client.name,
          severity: 'medium',
          headline: 'No visits on record',
          reason: `Joined ${formatFullDate(client.startDate)} with no check-in recorded yet.`,
          metricLabel: 'Last visit',
          metricValue: 'Never',
        })
      }
    } else if (last && idle !== null && idle >= rules.inactiveDays) {
      out.push({
        id: `inactive:${client.id}`,
        kind: 'inactive',
        clientId: client.id,
        clientName: client.name,
        severity: idle >= rules.inactiveDays * 2 ? 'high' : 'medium',
        headline: idle >= rules.inactiveDays * 2 ? 'Long inactive' : 'Check-in gap',
        reason: `Last recorded visit was ${formatFullDate(last.date)} — ${idle} days ago.`,
        metricLabel: 'Last visit',
        metricValue: `${idle}d ago`,
      })
    }

    // Engagement decline: needs a meaningful prior baseline to be honest.
    const recentWindow = new Date(from)
    recentWindow.setDate(recentWindow.getDate() - 30)
    const priorWindow = new Date(from)
    priorWindow.setDate(priorWindow.getDate() - 60)
    const recent = visitsInRange(logs, client.id, recentWindow, from)
    const prior = visitsInRange(logs, client.id, priorWindow, recentWindow)
    if (prior >= 6 && recent <= Math.floor(prior * (1 - rules.declineThreshold))) {
      out.push({
        id: `decline:${client.id}`,
        kind: 'decline',
        clientId: client.id,
        clientName: client.name,
        severity: 'low',
        headline: 'Engagement dropping',
        reason: `Visits fell from ${prior} to ${recent} over the last 30 days (baseline: the 30 days before that).`,
        metricLabel: 'Visits / 30d',
        metricValue: `${prior} → ${recent}`,
      })
    }

    const missing: string[] = []
    if (!client.phone) missing.push('phone')
    if (!client.email) missing.push('email')
    if (!client.goal) missing.push('fitness goal')
    if (missing.length > 0) {
      out.push({
        id: `incomplete:${client.id}`,
        kind: 'incomplete',
        clientId: client.id,
        clientName: client.name,
        severity: 'low',
        headline: 'Profile incomplete',
        reason: `Missing ${missing.join(', ')}.`,
        metricLabel: 'Missing',
        metricValue: `${missing.length} field${missing.length === 1 ? '' : 's'}`,
      })
    }
  }

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 }
  return out.sort((a, b) => order[a.severity] - order[b.severity] || a.clientName.localeCompare(b.clientName))
}

/* ------------------------------------------------------------------ */
/* Gym Pulse                                                           */
/* ------------------------------------------------------------------ */

export interface GymPulse {
  today: string
  checkedInToday: number
  activeMembers: number
  expiringSoon: number
  expired: number
  inactive: number
  /** Visits recorded in the last 7 days. */
  visitsThisWeek: number
  /** Visits recorded in the previous 7 days — for a genuine comparison. */
  visitsLastWeek: number
  /** Members checked in today, most recent first. */
  todayRoster: { clientId: number; name: string; time: string }[]
}

export function gymPulse(
  clients: Client[],
  logs: AttendanceLog[],
  rules: InsightRules = DEFAULT_RULES,
  from: Date = new Date(),
): GymPulse {
  const today = toISODate(from)
  const todayLogs = logs.filter((l) => l.date === today && l.present)
  const checkedInToday = new Set(todayLogs.map((l) => l.clientId)).size

  const byName = new Map(clients.map((c) => [c.id, c.name]))

  let visitsThisWeek = 0
  let visitsLastWeek = 0

  for (const log of logs) {
    if (!log.present) continue
    const d = parseISODate(log.date)
    if (!d) continue
    const delta = daysBetween(d, from)
    if (delta >= 0 && delta <= 6) visitsThisWeek += 1
    else if (delta >= 7 && delta <= 13) visitsLastWeek += 1
  }

  const phases = clients.map((c) => membershipPhase(c, from, rules))
  const inactiveCount = engagementSignals(clients, logs, rules, from).filter(
    (s) => s.kind === 'inactive',
  ).length

  return {
    today,
    checkedInToday,
    activeMembers: phases.filter((p) => p !== 'expired').length,
    expiringSoon: phases.filter((p) => p === 'expiring').length,
    expired: phases.filter((p) => p === 'expired').length,
    inactive: inactiveCount,
    visitsThisWeek,
    visitsLastWeek,
    todayRoster: todayLogs
      .map((l) => ({
        clientId: l.clientId,
        name: byName.get(l.clientId) ?? `Member #${l.clientId}`,
        time: l.checkInTime,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}

/* ------------------------------------------------------------------ */
/* Smart action centre                                                 */
/* ------------------------------------------------------------------ */

export type ActionKind = 'renewal' | 'inactive' | 'profile' | 'milestone' | 'attendance' | 'decline'

/**
 * Every `SignalKind` must map to an `ActionKind`.
 *
 * This table is deliberately exhaustive rather than an inline `as ActionKind`
 * cast: a cast compiles even when a new signal kind has no matching action
 * kind, which is exactly how `decline` shipped without an icon and crashed
 * the dashboard (`KIND_ICON[kind]` evaluated to `undefined`, so React threw
 * error #130 and unmounted the tree). With `Record<SignalKind, ActionKind>`
 * the compiler rejects any unmapped kind instead.
 */
const SIGNAL_TO_ACTION: Record<SignalKind, ActionKind> = {
  expiry: 'renewal',
  inactive: 'inactive',
  decline: 'decline',
  incomplete: 'profile',
}

export interface ActionItem {
  id: string
  kind: ActionKind
  /** 1 = do first, 2 = this week, 3 = when convenient. */
  priority: 1 | 2 | 3
  title: string
  description: string
  clientId?: number
  clientName?: string
}

const SEVERITY_PRIORITY: Record<Severity, 1 | 2 | 3> = { high: 1, medium: 2, low: 3 }

/** Prioritised, de-duplicated task list derived from the same signals. */
export function buildActionCenter(
  clients: Client[],
  logs: AttendanceLog[],
  rules: InsightRules = DEFAULT_RULES,
  from: Date = new Date(),
  dismissed: string[] = [],
): ActionItem[] {
  const items: ActionItem[] = engagementSignals(clients, logs, rules, from)
    .filter((s) => !dismissed.includes(s.id))
    .map((s) => ({
      id: s.id,
      kind: SIGNAL_TO_ACTION[s.kind],
      priority: SEVERITY_PRIORITY[s.severity],
      title: `${s.clientName} — ${s.headline}`,
      description: s.reason,
      clientId: s.clientId,
      clientName: s.clientName,
    }))

  // Members checked in today but with no daily log yet → quick nudge.
  const today = toISODate(from)
  const seen = new Set(logs.filter((l) => l.date === today && l.present).map((l) => l.clientId))
  for (const id of seen) {
    const key = `attendance:${id}`
    if (dismissed.includes(key)) continue
    const name = clients.find((c) => c.id === id)?.name
    if (!name) continue
    items.push({
      id: key,
      kind: 'attendance',
      priority: 3,
      title: `${name} — checked in today`,
      description: 'Add today\'s training notes while the session is still fresh.',
      clientId: id,
      clientName: name,
    })
  }

  return items.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
}

/* ------------------------------------------------------------------ */
/* Milestones                                                          */
/* ------------------------------------------------------------------ */

export interface Milestone {
  id: string
  clientId: number
  clientName: string
  kind: 'streak' | 'visits' | 'weight'
  title: string
  detail: string
  value: string
}

const VISIT_MILESTONES = [10, 15, 20, 25, 30]

/** Only emits achievements the underlying records actually support. */
export function milestones(
  clients: Client[],
  logs: AttendanceLog[],
  from: Date = new Date(),
): Milestone[] {
  const out: Milestone[] = []
  const window = new Date(from)
  window.setDate(window.getDate() - 30)

  for (const client of clients) {
    const streak = currentStreak(logs, client.id)
    if (streak >= 3) {
      out.push({
        id: `streak:${client.id}`,
        clientId: client.id,
        clientName: client.name,
        kind: 'streak',
        title: `${streak}-day check-in streak`,
        detail: `Checked in ${streak} days in a row.`,
        value: `${streak}`,
      })
    }

    const recent = visitsInRange(logs, client.id, window, from)
    const hit = [...VISIT_MILESTONES].reverse().find((n) => recent >= n)
    if (hit) {
      out.push({
        id: `visits:${client.id}`,
        clientId: client.id,
        clientName: client.name,
        kind: 'visits',
        title: `${hit} visits this month`,
        detail: `${recent} recorded check-ins in the last 30 days.`,
        value: `${recent}`,
      })
    }
  }

  return out
}

/**
 * Weight milestone for the *signed-in* member. `weightHistory` holds one
 * person's series (it has no member id), so it is only ever attributed to
 * the member whose portal is open.
 */
export function weightMilestone(client: Client, weights: WeightEntry[]): Milestone | null {
  if (weights.length < 2) return null
  const start = weights[0]?.weight
  const latest = weights[weights.length - 1]?.weight
  if (start == null || latest == null) return null

  const delta = Number((latest - start).toFixed(1))
  if (Math.abs(delta) < 1) return null

  const target = client.goalWeight ? client.currentWeight - client.goalWeight : 0
  const movingTowardGoal = target === 0 ? true : Math.sign(delta) === Math.sign(target)

  return {
    id: `weight:${client.id}`,
    clientId: client.id,
    clientName: client.name,
    kind: 'weight',
    title: `${Math.abs(delta)} kg ${delta < 0 ? 'lost' : 'gained'}`,
    detail: `${weights.length} weigh-ins recorded since ${formatShortDate(weights[0]?.date ?? '')}${
      movingTowardGoal ? ' — moving toward goal.' : ''
    }`,
    value: `${delta > 0 ? '+' : ''}${delta} kg`,
  }
}

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

export interface GrowthPoint {
  label: string
  members: number
}

/** Cumulative member count by signup month — real dates, no invented curve. */
export function memberGrowthSeries(clients: Client[], months = 12, from: Date = new Date()): GrowthPoint[] {
  const buckets: { key: string; label: string; count: number }[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  cursor.setMonth(cursor.getMonth() - (months - 1))

  for (let i = 0; i < months; i += 1) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() + i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
    })
  }

  for (const c of clients) {
    const d = parseISODate(c.startDate)
    if (!d) continue
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) bucket.count += 1
  }

  let running = 0
  return buckets.map((b) => {
    running += b.count
    return { label: b.label, members: running }
  })
}

export interface AttendancePoint {
  label: string
  date: string
  visits: number
}

/** Daily visit counts for the last `days` days (zero-filled). */
export function attendanceSeries(
  logs: AttendanceLog[],
  days = 30,
  from: Date = new Date(),
): AttendancePoint[] {
  const counts = new Map<string, number>()
  for (const l of logs) {
    if (!l.present) continue
    counts.set(l.date, (counts.get(l.date) ?? 0) + 1)
  }

  const out: AttendancePoint[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(from)
    d.setDate(d.getDate() - i)
    const iso = toISODate(d)
    out.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: iso,
      visits: counts.get(iso) ?? 0,
    })
  }
  return out
}

export function planDistribution(clients: Client[]): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const c of clients) map.set(c.plan || 'Unassigned', (map.get(c.plan || 'Unassigned') ?? 0) + 1)
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function statusDistribution(
  clients: Client[],
  from: Date = new Date(),
  rules: InsightRules = DEFAULT_RULES,
): { name: string; value: number }[] {
  const counts: Record<'active' | 'expiring' | 'expired', number> = { active: 0, expiring: 0, expired: 0 }
  for (const c of clients) counts[membershipPhase(c, from, rules)] += 1
  return [
    { name: 'Active', value: counts.active },
    { name: 'Expiring', value: counts.expiring },
    { name: 'Expired', value: counts.expired },
  ]
}

/** Visits per member over the trailing 30 days — drives engagement views. */
export function engagementBreakdown(
  clients: Client[],
  logs: AttendanceLog[],
  from: Date = new Date(),
): { name: string; value: number }[] {
  const window = new Date(from)
  window.setDate(window.getDate() - 30)
  return clients
    .map((c) => ({ name: c.name.split(' ')[0] ?? c.name, value: visitsInRange(logs, c.id, window, from) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

/* ------------------------------------------------------------------ */
/* Daily-log rollups                                                   */
/* ------------------------------------------------------------------ */

export function latestDailyLog(updates: DailyUpdate[], clientId?: number): DailyUpdate | null {
  const scoped = clientId == null ? updates : updates.filter((u) => u.clientId === clientId)
  if (scoped.length === 0) return null
  return scoped.reduce((a, b) => ((a.date ?? '') >= (b.date ?? '') ? a : b))
}

/* ------------------------------------------------------------------ */
/* CSV export                                                          */
/* ------------------------------------------------------------------ */

/**
 * RFC-4180 CSV with formula-injection guarding: cells that begin with
 * `= + - @` or a tab/CR are prefixed with an apostrophe so spreadsheet
 * apps treat them as text.
 */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: unknown): string => {
    let cell = value === null || value === undefined ? '' : String(value)
    if (/^[=+\-@\t\r]/.test(cell)) cell = `'${cell}`
    if (/[",\n\r]/.test(cell)) cell = `"${cell.replace(/"/g, '""')}"`
    return cell
  }
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(','))
  return lines.join('\r\n')
}

/** Triggers a browser download of `rows` as a UTF-8 CSV file. */
export function downloadCSV(filename: string, rows: Record<string, unknown>[]): void {
  const blob = new Blob([`\uFEFF${toCSV(rows)}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
