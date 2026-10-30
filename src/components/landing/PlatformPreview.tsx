import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Dumbbell,
  FileSpreadsheet,
  Gauge,
  MessageSquareHeart,
  Scale,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { initialClients, initialDailyUpdates } from '@/data/seed'
import {
  attendanceSeries,
  daysUntil,
  DEFAULT_RULES,
  membershipPhase,
  memberGrowthSeries,
  planDistribution,
} from '@/lib/insights'
import { Avatar, Badge } from '@/components/ui'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { buildSampleLogs } from '@/lib/sampleAttendance'
import { Magnetic, SplitHeading, TiltCard } from '@/components/motion'

const EASE = [0.22, 1, 0.36, 1] as const

const PLAN_COLORS: Record<string, string> = {
  Elite: '#FFFFFF',
  Premium: '#D4D4D8',
  Basic: '#71717A',
}

/* ------------------------------------------------------------------ */
/* Capabilities strip                                                  */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  { icon: Users, title: 'Member records', detail: 'Profiles, plans, goals & notes' },
  { icon: CalendarClock, title: 'Renewal tracking', detail: 'Real expiry dates, no duplicates' },
  { icon: Activity, title: 'Attendance logs', detail: 'Persisted check-ins, per member' },
  { icon: Scale, title: 'Progress history', detail: 'Weight, BMI & daily activity' },
  { icon: FileSpreadsheet, title: 'CSV reporting', detail: 'Date-filtered, safely escaped' },
] as const

export function CapabilitiesStrip() {
  return (
    <section className="relative py-16 sm:py-20" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-faint)', borderBottom: '1px solid var(--border-faint)' }}>
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12" style={{ maxWidth: 1440 }}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-9">
          <div>
            <div className="section-label">Platform capabilities</div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Everything an operator touches, in one surface
            </h2>
          </div>
          <p className="text-xs max-w-md" style={{ color: 'var(--text-muted)' }}>
            Figures on this page come from the sample workspace bundled with this build — no customer
            claims, no invented testimonials.
          </p>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {CAPABILITIES.map((c, i) => (
            <motion.li
              key={c.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            >
              <TiltCard className="metric-card h-full" max={7}>
                <div
                  className="flex items-center justify-center mb-4"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <c.icon size={16} color="#FFFFFF" aria-hidden />
                </div>
                <div className="text-[0.84rem] font-bold text-white">{c.title}</div>
                <div className="text-[0.72rem] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {c.detail}
                </div>
              </TiltCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Platform preview                                                    */
/* ------------------------------------------------------------------ */

function MiniSidebar({ active }: { active: string }) {
  const items = ['Overview', 'Members', 'Memberships', 'Attendance', 'Reports']
  return (
    <div className="hidden md:flex flex-col gap-1.5 p-3" style={{ width: 148, borderRight: '1px solid var(--border-faint)', background: '#09090b' }}>
      <div className="flex items-center gap-2 px-1.5 pb-3">
        <div
          style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(140deg,#FFFFFF,#A1A1AA)' }}
          aria-hidden
        />
        <span className="text-[0.66rem] font-black text-white tracking-tight">GYM CRM</span>
      </div>
      {items.map((label) => (
        <div
          key={label}
          className="text-[0.68rem] font-semibold px-2 py-1.5 rounded-md"
          style={
            label === active
              ? { background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }
              : { color: 'var(--text-muted)' }
          }
        >
          {label}
        </div>
      ))}
    </div>
  )
}

function PreviewKpi({
  label,
  value,
  caption,
  icon: Icon,
  tone = '#FFFFFF',
}: {
  label: string
  value: string
  caption: string
  icon: typeof Users
  tone?: string
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.58rem] uppercase tracking-[0.14em] font-bold" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <Icon size={13} color={tone} aria-hidden />
      </div>
      <div className="text-xl font-extrabold text-white leading-none">{value}</div>
      <div className="text-[0.6rem] mt-1.5" style={{ color: tone }}>
        {caption}
      </div>
    </div>
  )
}

/** Large in-page dashboard mock. Every figure is computed from the seed workspace. */
export function PlatformPreview() {
  const reduce = useReducedMotion()

  const data = useMemo(() => {
    const now = new Date()
    const logs = buildSampleLogs()
    const phases = initialClients.map((c) => membershipPhase(c, now, DEFAULT_RULES))
    const attendance = attendanceSeries(logs, 7, now)
    const renewals = [...initialClients]
      .map((c) => ({ ...c, left: daysUntil(c.endDate, now) }))
      .sort((a, b) => a.left - b.left)
      .slice(0, 4)
    const growth = memberGrowthSeries(initialClients, 8, now)
    const checkedIn = new Set(logs.filter((l) => l.date === now.toISOString().split('T')[0] && l.present).map((l) => l.clientId))

    const feed = [
      ...initialDailyUpdates.map((u) => ({
        name: u.name,
        color: u.avatarColor,
        text: u.workout ? `Logged ${u.workoutName}` : 'Updated daily activity',
        time: u.date,
      })),
      ...logs
        .filter((l) => checkedIn.has(l.clientId) && l.date === now.toISOString().split('T')[0])
        .slice(0, 3)
        .map((l) => ({
          name: initialClients.find((c) => c.id === l.clientId)?.name ?? 'Member',
          color: initialClients.find((c) => c.id === l.clientId)?.avatarColor ?? 'av-0',
          text: `Checked in at ${l.checkInTime}`,
          time: 'Today',
        })),
    ].slice(0, 4)

    return {
      total: initialClients.length,
      active: phases.filter((p) => p !== 'expired').length,
      expiring: phases.filter((p) => p === 'expiring').length,
      todayVisits: attendance[attendance.length - 1]?.visits ?? 0,
      checkedIn: checkedIn.size,
      attendance,
      renewals,
      plans: planDistribution(initialClients),
      growth,
      feed,
    }
  }, [])

  const sidebarItem = 'Overview'

  return (
    <section id="preview" className="relative py-24 sm:py-32 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 radial-lime" aria-hidden />
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12 relative" style={{ maxWidth: 1440 }}>
        <div className="max-w-3xl mb-12">
          <div className="section-label">Platform preview</div>
          <SplitHeading
            as="h2"
            className="display-lg text-white"
            delay={0.1}
            lines={[
              { text: 'One console for the' },
              { text: 'whole floor', gradient: true, sheen: true },
            ]}
          />
          <p className="lede mt-5">
            The landing page and the running application are the same design system — this preview is built
            from the identical components, charts and insight rules you get once you sign in.
          </p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 60, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: EASE }}
          className="glass-strong overflow-hidden"
          style={{ padding: 0 }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-faint)' }}>
            <div className="flex gap-1.5" aria-hidden>
              {['#52525B', '#A1A1AA', '#FFFFFF'].map((c) => (
                <span key={c} style={{ width: 9, height: 9, borderRadius: 99, background: c, opacity: 0.75 }} />
              ))}
            </div>
            <div
              className="flex-1 text-center text-[0.64rem] font-semibold rounded-md px-3 py-1"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', maxWidth: 320, margin: '0 auto' }}
            >
              app.gymcrm.local/dashboard
            </div>
            <span className="badge badge-lime hidden sm:inline-flex" style={{ fontSize: '0.55rem' }}>
              Sample workspace
            </span>
          </div>

          <div className="flex" style={{ minHeight: 520 }}>
            <MiniSidebar active={sidebarItem} />

            <div className="flex-1 min-w-0 p-4 sm:p-6">
              {/* Top bar */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="text-base font-extrabold text-white tracking-tight">Good morning, Admin</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Here's what's happening at your gym today.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-[0.7rem]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  >
                    Search members…
                  </div>
                  <Avatar name="Admin" color="av-6" size={30} radius={9} />
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <PreviewKpi label="Total members" value={String(data.total)} caption="On the books" icon={Users} tone="#FFFFFF" />
                <PreviewKpi label="Active" value={String(data.active)} caption="Membership valid" icon={BadgeCheck} tone="#E4E4E7" />
                <PreviewKpi label="Expiring ≤14d" value={String(data.expiring)} caption="Needs a follow-up" icon={CalendarClock} tone="#D4D4D8" />
                <PreviewKpi label="Checked in today" value={String(data.checkedIn)} caption={`${data.todayVisits} visits logged`} icon={Activity} tone="#A1A1AA" />
              </div>

              {/* Charts + side rail */}
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-3">
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[0.64rem] uppercase tracking-[0.14em] font-bold" style={{ color: 'var(--text-muted)' }}>
                      Attendance — last 7 days
                    </span>
                    <span className="text-[0.64rem] font-bold" style={{ color: '#FFFFFF' }}>
                      {data.attendance.reduce((s, d) => s + d.visits, 0)} visits
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={148}>
                    <BarChart data={data.attendance} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#6C716A', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis tick={{ fill: '#6C716A', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.06)' }} content={<ChartTooltip title="Visits" />} />
                      <Bar dataKey="visits" fill="#FFFFFF" radius={[4, 4, 0, 0]} animationDuration={1100} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="text-[0.64rem] uppercase tracking-[0.14em] font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                      Plan mix
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {data.plans.map((p) => (
                        <li key={p.name} className="flex items-center gap-3">
                          <span className="text-[0.72rem] font-semibold text-white w-16">{p.name}</span>
                          <span className="flex-1 progress-bar">
                            <span
                              className="progress-fill"
                              style={{
                                width: `${(p.value / data.total) * 100}%`,
                                background: PLAN_COLORS[p.name] ?? '#FFFFFF',
                                display: 'block',
                              }}
                            />
                          </span>
                          <span className="text-[0.7rem] font-bold" style={{ color: 'var(--text-secondary)' }}>
                            {p.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl p-4 flex-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="text-[0.64rem] uppercase tracking-[0.14em] font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                      Renewal alerts
                    </div>
                    <ul className="flex flex-col gap-2">
                      {data.renewals.map((r) => {
                        const left = r.left
                        return (
                          <li key={r.id} className="flex items-center gap-2.5">
                            <Avatar name={r.name} color={r.avatarColor} size={24} radius={7} />
                            <span className="text-[0.72rem] font-semibold text-white truncate flex-1">{r.name}</span>
                            <Badge tone={left < 0 ? 'danger' : left <= 7 ? 'warning' : 'neutral'}>
                              {left < 0 ? `Expired ${Math.abs(left)}d` : `${left}d`}
                            </Badge>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Activity + growth */}
              <div className="grid lg:grid-cols-[1fr_1.2fr] gap-3 mt-3">
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="text-[0.64rem] uppercase tracking-[0.14em] font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                    Member activity feed
                  </div>
                  <ul className="flex flex-col gap-3">
                    {data.feed.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Avatar name={f.name} color={f.color} size={24} radius={7} />
                        <div className="min-w-0">
                          <div className="text-[0.72rem] text-white font-semibold truncate">{f.name}</div>
                          <div className="text-[0.66rem]" style={{ color: 'var(--text-muted)' }}>
                            {f.text} · {f.time}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[0.64rem] uppercase tracking-[0.14em] font-bold" style={{ color: 'var(--text-muted)' }}>
                      Cumulative sign-ups
                    </span>
                    <span className="text-[0.64rem] font-bold" style={{ color: '#FFFFFF' }}>
                      last {data.growth.length} months
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5" style={{ height: 96 }}>
                    {data.growth.map((g, i) => {
                      const max = Math.max(...data.growth.map((x) => x.members), 1)
                      return (
                        <motion.div
                          key={g.label}
                          className="flex-1 rounded-t-md"
                          style={{
                            height: `${(g.members / max) * 100}%`,
                            background: `linear-gradient(180deg, rgba(198,255,61,${0.35 + (i / data.growth.length) * 0.5}), rgba(198,255,61,0.1))`,
                          }}
                          initial={reduce ? false : { scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[0.58rem]" style={{ color: 'var(--text-muted)' }}>
                    <span>{data.growth[0]?.label}</span>
                    <span>Cumulative sign-ups</span>
                    <span>{data.growth[data.growth.length - 1]?.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4 mt-8">
          <Magnetic>
            <Link to={ROUTES.login} className="btn-primary">
              Open the real dashboard
              <ArrowRight size={16} aria-hidden />
            </Link>
          </Magnetic>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Every figure above is computed from the bundled sample dataset using the rules in{' '}
            <code style={{ color: 'var(--accent-secondary)' }}>src/lib/insights.ts</code>.
          </span>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Feature showcase                                                    */
/* ------------------------------------------------------------------ */

interface Feature {
  id: string
  index: string
  eyebrow: string
  title: string
  body: string
  points: string[]
  image: string
  fallback: string
  icon: typeof Users
}

const FEATURES: Feature[] = [
  {
    id: 'members',
    index: '01',
    eyebrow: 'Smart member management',
    title: 'Every member, one source of truth',
    body: 'Search, filter, sort and page through the whole roster — then drop into a profile that carries contact details, plan history, workout schedule, attendance and body measurements together.',
    points: ['Search by name, phone or plan', 'Status, plan and goal filters', 'Archive-safe destructive actions'],
    image: '/gym-training.png',
    fallback: '/gym-hero.png',
    icon: Users,
  },
  {
    id: 'renewals',
    index: '02',
    eyebrow: 'Membership & renewals',
    title: 'Expiry you can see coming',
    body: 'Start and end dates drive everything. The system separates "expires in 6 days" from "expired 9 days ago", so a renewal conversation never starts from the wrong place.',
    points: ['Derived status, never stale', 'Upcoming renewals list', 'Reminder actions where messaging exists'],
    image: '/gym-hero.png',
    fallback: '/gym-login.png',
    icon: CalendarClock,
  },
  {
    id: 'attendance',
    index: '03',
    eyebrow: 'Attendance & workout insights',
    title: 'Check-ins that are actually recorded',
    body: 'Attendance lives in the database — one row per member per day — so daily head-count, weekly trends and per-member visit counts all come from the same records.',
    points: ['Duplicate-proof upserts', '7- and 30-day visit trends', 'Per-member visit history'],
    image: '/gym-training.png',
    fallback: '/gym-hero.png',
    icon: Activity,
  },
  {
    id: 'progress',
    index: '04',
    eyebrow: 'Fitness progress tracking',
    title: 'Weight, BMI and daily logs',
    body: 'Members log their own water, sleep, steps and mood; coaches record weigh-ins. Progress charts read straight from those entries — no manual reconciliation.',
    points: ['Weight & BMI history', 'Water, sleep and step logging', 'Member-owned data entry'],
    image: '/gym-login.png',
    fallback: '/gym-training.png',
    icon: Scale,
  },
  {
    id: 'analytics',
    index: '05',
    eyebrow: 'Intelligent gym analytics',
    title: 'Charts with a visible data source',
    body: 'Growth, attendance, plan mix and engagement all derive from stored records. Empty states say "no data yet" rather than drawing a flat zero line that looks like a real answer.',
    points: ['Loading, empty and error states', 'Responsive charts and legends', 'Accessible labels and tooltips'],
    image: '/gym-hero.png',
    fallback: '/gym-training.png',
    icon: Gauge,
  },
  {
    id: 'communication',
    index: '06',
    eyebrow: 'Member communication',
    title: 'Notes, notifications and messages',
    body: 'Admin notes live on the member record, system events land in the notification tray, and the message thread keeps the conversation attached to the workspace.',
    points: ['Per-member notes', 'Read / unread notification tray', 'Admin ↔ member message thread'],
    image: '/gym-training.png',
    fallback: '/gym-hero.png',
    icon: MessageSquareHeart,
  },
]

function FeatureRow({ feature, reversed }: { feature: Feature; reversed: boolean }) {
  const reduce = useReducedMotion()
  const Icon = feature.icon

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      {/* Media — tilts toward the cursor on pointer devices */}
      <TiltCard className={reversed ? 'lg:order-2' : ''} max={6} glare={false}>
        <motion.div
          initial={reduce ? false : { opacity: 0, clipPath: 'inset(0 0 100% 0)', scale: 1.05 }}
          whileInView={{ opacity: 1, clipPath: 'inset(0 0 0% 0)', scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: EASE }}
          className="relative overflow-hidden"
          style={{ borderRadius: 22, border: '1px solid var(--border-color)', aspectRatio: '16 / 11' }}
        >
        <img
          src={feature.image}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'saturate(0.85) contrast(1.05)' }}
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget
            if (el.src !== feature.fallback) el.src = feature.fallback
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(150deg, rgba(7,8,7,0.86) 0%, rgba(7,8,7,0.5) 45%, rgba(7,8,7,0.88) 100%)',
          }}
        />
        <div className="absolute inset-0 grid-texture" aria-hidden />
        <div className="relative h-full flex flex-col justify-between p-6 sm:p-8">
          <div
            className="inline-flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Icon size={19} color="#FFFFFF" aria-hidden />
          </div>
          <div>
            <div className="display-md text-white" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
              {feature.title}
            </div>
            <div className="flex items-center gap-2 mt-4" style={{ color: 'var(--text-muted)' }}>
              <Dumbbell size={13} aria-hidden />
              <span className="text-[0.66rem] uppercase tracking-[0.18em] font-bold">{feature.eyebrow}</span>
            </div>
          </div>
        </div>
        </motion.div>
      </TiltCard>

      {/* Copy */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={reversed ? 'lg:order-1' : ''}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="step-index">{feature.index}</span>
          <span className="accent-rule" />
          <span className="text-[0.66rem] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--accent-secondary)' }}>
            {feature.eyebrow}
          </span>
        </div>

        <h3 className="display-md text-white">{feature.title}</h3>
        <p className="lede mt-4">{feature.body}</p>

        <ul className="mt-6 flex flex-col gap-3">
          {feature.points.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <CheckCircle2 size={15} color="#FFFFFF" className="flex-shrink-0 mt-0.5" aria-hidden />
              <span className="text-sm text-dim">{p}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

export function FeatureShowcase() {
  return (
    <section id="features" className="relative py-24 sm:py-32" style={{ background: 'var(--bg-secondary)' }}>
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12" style={{ maxWidth: 1440 }}>
        <div className="max-w-3xl mb-14">
          <div className="section-label">Feature showcase</div>
          <SplitHeading
            as="h2"
            className="display-lg text-white"
            delay={0.1}
            lines={[
              { text: 'Built around the work' },
              { text: 'you already do', gradient: true, sheen: true },
            ]}
          />
          <p className="lede mt-5">
            Six capabilities, each mapped to functionality that ships in this repository. Nothing here is a
            mock-up of something that isn't implemented.
          </p>
        </div>

        <div className="flex flex-col gap-20 lg:gap-28">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.id} feature={f} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Small helper used by the intelligence section to render a stat. */
export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="metric-card">
      <div className="text-[0.6rem] uppercase tracking-[0.14em] font-bold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold text-white mt-2 leading-none">{value}</div>
      {hint && (
        <div className="text-[0.68rem] mt-2" style={{ color: 'var(--accent-secondary)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}
