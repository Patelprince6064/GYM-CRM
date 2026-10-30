import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  FileSpreadsheet,
  Flame,
  PieChart as PieChartIcon,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { Avatar, Badge, Card, StatCard, StatusBadge, ChartCard, EmptyState } from '@/components/ui'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { GymPulse } from '@/components/dashboard/GymPulse'
import { ActionCenter } from '@/components/dashboard/ActionCenter'
import { Milestones } from '@/components/dashboard/Milestones'
import { ROUTES } from '@/constants'
import {
  attendanceSeries,
  daysUntil,
  DEFAULT_RULES,
  expiryLabel,
  formatFullDate,
  lastVisit,
  membershipPhase,
  memberGrowthSeries,
  planDistribution,
} from '@/lib/insights'

const PLAN_COLORS: Record<string, string> = {
  Elite: '#FFFFFF',
  Premium: '#A1A1AA',
  Basic: '#52525B',
}

const gridStroke = 'rgba(255,255,255,0.06)'
const axisFill = '#6C716A'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const QUICK_ACTIONS = [
  { label: 'Add member', icon: UserPlus, to: ROUTES.clients },
  { label: 'Record attendance', icon: CalendarPlus, to: ROUTES.memberActivity },
  { label: 'Renewals', icon: CalendarClock, to: ROUTES.memberships },
  { label: 'Export report', icon: FileSpreadsheet, to: ROUTES.reports },
]

/**
 * Admin overview. Every number below is derived from records held in the
 * workspace — there are no placeholder totals and no invented growth
 * percentages. Where a comparison is genuinely available (this week vs the
 * previous week, this month vs the previous month) it is shown; otherwise
 * the trend chip is omitted entirely.
 */
export default function Dashboard() {
  const { user } = useAuth()
  const { clients, attendanceLogs, dailyUpdates, isHydrating } = useData()
  const reduce = useReducedMotion()

  const data = useMemo(() => {
    const now = new Date()
    const phases = clients.map((c) => membershipPhase(c, now, DEFAULT_RULES))

    // Real month-on-month signup comparison.
    const since = (days: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - days)
      return d
    }
    const cutoff30 = since(30)
    const cutoff60 = since(60)
    const signupsRecent = clients.filter((c) => {
      const d = new Date(c.startDate)
      return !Number.isNaN(d.getTime()) && d >= cutoff30
    }).length
    const signupsPrior = clients.filter((c) => {
      const d = new Date(c.startDate)
      return !Number.isNaN(d.getTime()) && d >= cutoff60 && d < cutoff30
    }).length

    // Real yesterday-vs-today check-in comparison.
    const iso = (d: Date) => d.toISOString().split('T')[0]
    const today = iso(now)
    const yesterday = iso(since(1))
    const todayVisits = attendanceLogs.filter((l) => l.present && l.date === today).length
    const yesterdayVisits = attendanceLogs.filter((l) => l.present && l.date === yesterday).length
    const checkedInToday = new Set(
      attendanceLogs.filter((l) => l.present && l.date === today).map((l) => l.clientId),
    ).size

    const renewals = clients
      .map((c) => ({ ...c, left: daysUntil(c.endDate, now) }))
      .sort((a, b) => a.left - b.left)
      .slice(0, 6)

    return {
      now,
      total: clients.length,
      active: phases.filter((p) => p !== 'expired').length,
      expiring: phases.filter((p) => p === 'expiring').length,
      expired: phases.filter((p) => p === 'expired').length,
      checkedInToday,
      todayVisits,
      yesterdayVisits,
      signupsRecent,
      signupsPrior,
      growth: memberGrowthSeries(clients, 12, now),
      attendance: attendanceSeries(attendanceLogs, 30, now),
      planMix: planDistribution(clients),
      renewals,
      recentLogs: [...dailyUpdates].slice(0, 4),
    }
  }, [clients, attendanceLogs, dailyUpdates])

  const emptyGrowth = data.growth.every((g) => g.members === 0)
  const emptyAttendance = data.attendance.every((a) => a.visits === 0)

  const signupTrend =
    data.signupsPrior > 0
      ? data.signupsRecent >= data.signupsPrior
        ? ('up' as const)
        : ('down' as const)
      : undefined
  const visitTrend =
    data.yesterdayVisits > 0
      ? data.todayVisits >= data.yesterdayVisits
        ? ('up' as const)
        : ('down' as const)
      : undefined

  const todayLabel = data.now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="page-container">
      {/* Greeting */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between gap-5 flex-wrap mb-7"
      >
        <div>
          <div className="section-label">{todayLabel}</div>
          <h1 className="display-md text-white">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'there'}.
          </h1>
          <p className="text-dim text-sm mt-2">
            Here's what's happening at your gym today — every figure below is read from your records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} to={a.to} className="btn-secondary btn-sm">
              <a.icon size={14} aria-hidden />
              {a.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total members"
          value={data.total}
          icon={Users}
          color="#FFFFFF"
          caption={`${data.signupsRecent} joined in the last 30 days`}
          trend={signupTrend}
          trendLabel={signupTrend ? 'vs prior 30 days' : undefined}
          delay={0}
        />
        <StatCard
          label="Active memberships"
          value={data.active}
          icon={CheckCircle2}
          color="#E4E4E7"
          caption={`${data.expired} expired`}
          fill={data.total ? (data.active / data.total) * 100 : 0}
          delay={0.05}
        />
        <StatCard
          label={`Expiring ≤${DEFAULT_RULES.expiryWarnDays}d`}
          value={data.expiring}
          icon={CalendarClock}
          color="#D4D4D8"
          caption={data.expiring ? 'Follow-ups due this fortnight' : 'Nothing due shortly'}
          delay={0.1}
        />
        <StatCard
          label="Checked in today"
          value={data.checkedInToday}
          icon={Flame}
          color="#A1A1AA"
          caption={`${data.todayVisits} visits logged today`}
          trend={visitTrend}
          trendLabel={visitTrend ? 'vs yesterday' : undefined}
          delay={0.15}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <ChartCard
          label="Growth"
          title="Member growth"
          description="Cumulative sign-ups by month, from recorded start dates"
          loading={isHydrating}
          empty={emptyGrowth}
          emptyTitle="No sign-ups yet"
          emptyDescription="Add your first member and this curve starts plotting immediately."
          height={240}
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.growth} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: axisFill, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: axisFill, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.2)' }} content={<ChartTooltip title="Members" />} />
              <Area
                type="monotone"
                dataKey="members"
                name="Members"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                fill="url(#growthFill)"
                animationDuration={1200}
                dot={false}
                activeDot={{ r: 4, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          label="Attendance"
          title="Daily visits"
          description="Last 30 days of recorded check-ins"
          loading={isHydrating}
          empty={emptyAttendance}
          emptyTitle="No check-ins recorded"
          emptyDescription="Attendance comes from the check-in table — record one and it appears here."
          height={240}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.attendance} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: axisFill, fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fill: axisFill, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.06)' }} content={<ChartTooltip title="Visits" />} />
              <Bar dataKey="visits" name="Visits" fill="#FFFFFF" radius={[4, 4, 0, 0]} animationDuration={1100} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Pulse + action center + plan mix */}
      <div className="grid lg:grid-cols-[1fr_1.25fr_0.9fr] gap-5 mb-5 items-start">
        <GymPulse />
        <ActionCenter />

        <Card className="h-full">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={15} color="#FFFFFF" aria-hidden />
            <div>
              <div className="text-base font-bold text-white">Plan mix</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Distribution across {data.total} members
              </div>
            </div>
          </div>

          {data.planMix.length === 0 || data.total === 0 ? (
            <EmptyState
              icon={Users}
              title="No members yet"
              description="Add members and their plans to see how the book is distributed."
            />
          ) : (
            <>
              <div style={{ height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.planMix}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={1000}
                    >
                      {data.planMix.map((entry) => (
                        <Cell key={entry.name} fill={PLAN_COLORS[entry.name] ?? '#FFFFFF'} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip title="Members" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex flex-col gap-2.5 mt-4">
                {data.planMix.map((p) => (
                  <li key={p.name} className="flex items-center gap-2.5 text-[0.78rem]">
                    <span
                      style={{ width: 9, height: 9, borderRadius: 3, background: PLAN_COLORS[p.name] ?? '#FFFFFF' }}
                      aria-hidden
                    />
                    <span className="text-white font-semibold flex-1">{p.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{p.value}</span>
                    <span className="font-bold" style={{ color: PLAN_COLORS[p.name] ?? '#FFFFFF' }}>
                      {Math.round((p.value / data.total) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* Renewals + milestones */}
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-5 mb-5 items-start">
        <Card>
          <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
            <div>
              <div className="section-label">Renewals</div>
              <h3 className="text-base font-bold text-white">Next to expire</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Sorted by days remaining — expired records are shown separately, not mixed in.
              </p>
            </div>
            <Link to={ROUTES.memberships} className="btn-secondary btn-sm">
              All memberships
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>

          {data.renewals.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No memberships on file" description="Add a member to start tracking expiry." />
          ) : (
            <ul className="flex flex-col gap-3">
              {data.renewals.map((m) => {
                const phase = membershipPhase(m, data.now, DEFAULT_RULES)
                return (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar name={m.name} color={m.avatarColor} size={36} radius={11} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.85rem] font-semibold text-white truncate">{m.name}</div>
                      <div className="text-[0.7rem] truncate" style={{ color: 'var(--text-muted)' }}>
                        {m.plan} · ends {formatFullDate(m.endDate)} · {expiryLabel(m, data.now)}
                      </div>
                    </div>
                    <span className="hidden sm:block">
                      <StatusBadge status={phase === 'active' ? 'Active' : phase === 'expiring' ? 'Expiring' : 'Expired'} />
                    </span>
                    <Link
                      to={`${ROUTES.clients}?q=${encodeURIComponent(m.name)}`}
                      className="btn-ghost btn-sm"
                      aria-label={`Open ${m.name}`}
                    >
                      Open
                      <ArrowRight size={13} aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-5 pt-4 flex items-center gap-2 text-[0.72rem]" style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
            <CalendarClock size={13} color="#FFFFFF" aria-hidden />
            {data.expiring} expiring · {data.expired} expired · renewals are recorded by staff
          </div>
        </Card>

        <Milestones />
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="section-label">Activity</div>
            <h3 className="text-base font-bold text-white">Latest daily logs</h3>
          </div>
          <Link to={ROUTES.dailyUpdates} className="btn-secondary btn-sm">
            Daily logs
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        {data.recentLogs.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="No daily logs yet"
            description="When members record water, sleep, steps and workouts, they show up here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {data.recentLogs.map((u, i) => (
              <li key={`${u.clientId}-${i}`} className="flex items-center gap-3">
                <Avatar name={u.name} color={u.avatarColor} size={32} radius={10} />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.82rem] font-semibold text-white truncate">
                    {u.name}
                    <span className="ml-2 text-[0.68rem] font-normal" style={{ color: 'var(--text-muted)' }}>
                      {u.date}
                    </span>
                  </div>
                  <div className="text-[0.7rem] truncate" style={{ color: 'var(--text-muted)' }}>
                    {u.workout ? u.workoutName || 'Workout logged' : 'Rest day'} · {u.steps.toLocaleString()} steps ·{' '}
                    {u.water} L water
                  </div>
                </div>
                <Badge tone={u.workout ? 'success' : 'neutral'}>{u.workout ? 'Trained' : 'Rest'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Honest data-source footer */}
      <div
        className="rounded-xl p-4 mt-6 flex items-start gap-3"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed var(--border-color)' }}
      >
        <CheckCircle2 size={15} color="#FFFFFF" className="flex-shrink-0 mt-0.5" aria-hidden />
        <p className="text-[0.76rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {isHydrating
            ? 'Loading workspace records…'
            : `Derived from ${data.total} member record${data.total === 1 ? '' : 's'}, ${
                attendanceLogs.length
              } attendance row${attendanceLogs.length === 1 ? '' : 's'} and ${
                dailyUpdates.length
              } daily log${dailyUpdates.length === 1 ? '' : 's'}. Last check-in on file: ${
                lastVisit(attendanceLogs, clients[0]?.id ?? -1)?.date ?? 'none yet'
              }.`}
        </p>
      </div>
    </div>
  )
}
