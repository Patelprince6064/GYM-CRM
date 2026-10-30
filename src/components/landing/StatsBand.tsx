import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Activity,
  CalendarClock,
  Dumbbell,
  FileSpreadsheet,
  Scale,
  Users,
} from 'lucide-react'
import { AnimatedCounter, Marquee } from '@/components/motion'
import { initialClients, initialDailyUpdates } from '@/data/seed'
import { attendanceSeries, DEFAULT_RULES, membershipPhase } from '@/lib/insights'
import { buildSampleLogs } from '@/lib/sampleAttendance'

const EASE = [0.22, 1, 0.36, 1] as const

const TICKER = [
  { icon: Users, label: 'Member records' },
  { icon: CalendarClock, label: 'Renewal tracking' },
  { icon: Activity, label: 'Attendance logs' },
  { icon: Scale, label: 'Progress history' },
  { icon: FileSpreadsheet, label: 'CSV reporting' },
  { icon: Dumbbell, label: 'Workout schedules' },
]

/**
 * Full-bleed kinetic band: an infinite capability ticker over a row of
 * large counting metrics. Every number is derived from the bundled sample
 * workspace — no invented claims.
 */
export function StatsBand() {
  const stats = useMemo(() => {
    const now = new Date()
    const logs = buildSampleLogs()
    const phases = initialClients.map((c) => membershipPhase(c, now, DEFAULT_RULES))
    const week = attendanceSeries(logs, 7, now)
    return {
      members: initialClients.length,
      active: phases.filter((p) => p !== 'expired').length,
      expiring: phases.filter((p) => p === 'expiring').length,
      visits: week.reduce((s, d) => s + d.visits, 0),
      logs: initialDailyUpdates.length,
    }
  }, [])

  const metrics = [
    { value: stats.members, suffix: '', label: 'Members on the books', decimals: 0 },
    { value: stats.active, suffix: '', label: 'Active memberships', decimals: 0 },
    { value: stats.visits, suffix: '', label: 'Visits logged this week', decimals: 0 },
    { value: stats.expiring, suffix: '', label: 'Renewals due ≤14 days', decimals: 0 },
  ]

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-faint)',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      {/* Ticker */}
      <div className="py-4" style={{ borderBottom: '1px solid var(--border-faint)' }}>
        <Marquee duration={34}>
          {TICKER.map((t) => (
            <span key={t.label} className="chip whitespace-nowrap">
              <t.icon size={13} color="#FFFFFF" aria-hidden />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.08em' }}>
                {t.label}
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* Counting metrics */}
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16" style={{ maxWidth: 1440 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.09, ease: EASE }}
              className="relative"
            >
              <div
                className="text-[0.6rem] uppercase tracking-[0.18em] font-bold mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="display-lg text-white leading-none">
                <AnimatedCounter value={m.value} suffix={m.suffix} decimals={m.decimals} duration={1.6} />
              </div>
              <div className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                {m.label}
              </div>
              <motion.div
                aria-hidden
                className="mt-4 h-px origin-left"
                style={{ background: 'linear-gradient(90deg, #ffffff, transparent)' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.09, ease: EASE }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
