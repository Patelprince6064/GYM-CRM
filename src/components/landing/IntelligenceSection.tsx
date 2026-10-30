import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock,
  Info,
  UserRoundX,
  Waves,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { initialClients } from '@/data/seed'
import {
  DEFAULT_RULES,
  engagementSignals,
  gymPulse,
  visitsInRange,
} from '@/lib/insights'
import { Avatar, Badge } from '@/components/ui'
import { buildSampleLogs } from '@/lib/sampleAttendance'
import { Magnetic, SplitHeading } from '@/components/motion'

const EASE = [0.22, 1, 0.36, 1] as const

const RULES = [
  {
    icon: CalendarClock,
    name: 'Expiry horizon',
    threshold: `${DEFAULT_RULES.expiryWarnDays} days`,
    description: 'Membership end date falls inside the window — or has already passed.',
  },
  {
    icon: UserRoundX,
    name: 'Inactivity window',
    threshold: `${DEFAULT_RULES.inactiveDays} days`,
    description: 'No recorded check-in since the last visit within this period.',
  },
  {
    icon: Waves,
    name: 'Engagement drop',
    threshold: `${Math.round(DEFAULT_RULES.declineThreshold * 100)}%`,
    description: 'Visits in the last 30 days fell this much below the previous 30 (baseline ≥ 6 visits).',
  },
  {
    icon: Info,
    name: 'Profile completeness',
    threshold: '3 fields',
    description: 'Phone, email and fitness goal are the fields we check for gaps.',
  },
]

const SEVERITY_STYLE: Record<string, { label: string; tone: 'danger' | 'warning' | 'neutral' }> = {
  high: { label: 'Act now', tone: 'danger' },
  medium: { label: 'This week', tone: 'warning' },
  low: { label: 'When free', tone: 'neutral' },
}

const KIND_ICON = {
  expiry: Clock,
  inactive: UserRoundX,
  decline: Waves,
  incomplete: Info,
} as const

/**
 * "Real intelligence" section — a transparent rules engine, not a claim of
 * machine learning. Every card below is produced by `engagementSignals()`
 * running over the sample workspace that ships with this build.
 */
export function IntelligenceSection() {
  const reduce = useReducedMotion()

  const data = useMemo(() => {
    const now = new Date()
    const logs = buildSampleLogs()
    const signals = engagementSignals(initialClients, logs, DEFAULT_RULES, now)
    const pulse = gymPulse(initialClients, logs, DEFAULT_RULES, now)

    const window30 = new Date(now)
    window30.setDate(window30.getDate() - 30)
    const windowPrev = new Date(now)
    windowPrev.setDate(windowPrev.getDate() - 60)

    const visitsThis = initialClients.reduce((sum, c) => sum + visitsInRange(logs, c.id, window30, now), 0)
    const visitsPrev = initialClients.reduce(
      (sum, c) => sum + visitsInRange(logs, c.id, windowPrev, window30),
      0,
    )

    return {
      signals: signals.slice(0, 5),
      totalSignals: signals.length,
      expiring: signals.filter((s) => s.kind === 'expiry').length,
      inactive: signals.filter((s) => s.kind === 'inactive').length,
      pulse,
      visitsThis,
      visitsPrev,
      delta:
        visitsPrev > 0 ? Math.round(((visitsThis - visitsPrev) / visitsPrev) * 100) : 0,
    }
  }, [])

  return (
    <section
      id="intelligence"
      className="relative py-24 sm:py-32 overflow-hidden grain"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="absolute inset-0 grid-texture" aria-hidden />
      <div className="absolute inset-0 radial-lime" aria-hidden />

      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12 relative" style={{ maxWidth: 1440 }}>
        <div className="max-w-3xl mb-14">
          <div className="section-label">
            <BrainCircuit size={13} aria-hidden />
            Intelligence
          </div>
          <SplitHeading
            as="h2"
            className="display-lg text-white"
            delay={0.1}
            lines={[
              { text: 'MORE THAN MANAGEMENT.' },
              { text: 'REAL INTELLIGENCE.', gradient: true, sheen: true },
            ]}
          />
          <p className="lede mt-6">
            Four deterministic rules run against your own records and tell you exactly why each member was
            flagged. There is no model to trust on faith — read the rule, read the record, decide.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 lg:gap-10">
          {/* ---- Rules ---- */}
          <div className="flex flex-col gap-4">
            <div className="text-[0.64rem] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
              The rules, in full
            </div>

            {RULES.map((rule, i) => (
              <motion.div
                key={rule.name}
                initial={reduce ? false : { opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                className="metric-card card-hover flex gap-4"
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <rule.icon size={17} color="#FFFFFF" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="text-sm font-bold text-white">{rule.name}</span>
                    <span className="text-[0.68rem] font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {rule.threshold}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {rule.description}
                  </p>
                </div>
              </motion.div>
            ))}

            <div
              className="rounded-xl p-4 mt-1 flex items-start gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)' }}
            >
              <Info size={15} color="#FFFFFF" className="flex-shrink-0 mt-0.5" aria-hidden />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                These are operational prompts for gym staff. They are not medical assessments and they do not
                predict behaviour — they only restate what your records already show.
              </p>
            </div>
          </div>

          {/* ---- Live output ---- */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="glass-strong p-5 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <div className="text-[0.62rem] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--accent-primary)' }}>
                  Sample workspace output
                </div>
                <div className="text-base font-extrabold text-white mt-1.5">Signals generated right now</div>
              </div>
              <Badge tone="lime">{data.totalSignals} open signals</Badge>
            </div>

            {/* Pulse metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              {[
                { label: 'Checked in today', value: String(data.pulse.checkedInToday), color: '#FFFFFF' },
                { label: 'Renewals flagged', value: String(data.expiring), color: '#D4D4D8' },
                { label: 'Inactive members', value: String(data.inactive), color: '#71717A' },
                {
                  label: '30-day visits',
                  value: `${data.delta >= 0 ? '+' : ''}${data.delta}%`,
                  color: '#FFFFFF',
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border-faint)' }}
                >
                  <div className="text-base font-extrabold leading-none" style={{ color: m.color }}>
                    {m.value}
                  </div>
                  <div className="text-[0.58rem] uppercase tracking-wider font-bold mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <ul className="flex flex-col gap-3">
              {data.signals.map((s, i) => {
                const Icon = KIND_ICON[s.kind]
                const style = SEVERITY_STYLE[s.severity]
                return (
                  <motion.li
                    key={s.id}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.08 * i, ease: EASE }}
                    className="rounded-xl p-3.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={s.clientName} color="av-0" size={34} radius={10} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[0.82rem] font-bold text-white truncate">{s.clientName}</span>
                          <Badge tone={style.tone}>{style.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5" style={{ color: 'var(--accent-secondary)' }}>
                          <Icon size={12} aria-hidden />
                          <span className="text-[0.7rem] font-bold">{s.headline}</span>
                        </div>
                        <p className="text-[0.7rem] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {s.reason}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[0.58rem] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                          {s.metricLabel}
                        </div>
                        <div className="text-[0.78rem] font-extrabold text-white mt-0.5">{s.metricValue}</div>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </ul>

            <div className="flex items-center justify-between gap-3 mt-5 pt-4 flex-wrap" style={{ borderTop: '1px solid var(--border-faint)' }}>
              <div className="flex items-center gap-2 text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
                <Activity size={13} color="#FFFFFF" aria-hidden />
                {data.visitsThis} visits in 30 days · {data.visitsPrev} in the period before
              </div>
              <Magnetic strength={0.4}>
                <Link to={ROUTES.login} className="btn-secondary btn-sm">
                  See it in the dashboard
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
          <CheckCircle2 size={14} color="#FFFFFF" aria-hidden />
          The same functions power the admin dashboard, the Smart Action Center and the CSV exports — one
          implementation, one source of truth.
        </div>
      </div>
    </section>
  )
}
