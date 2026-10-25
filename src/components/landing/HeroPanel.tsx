import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { ArrowUpRight, CalendarClock, CheckCircle2, Users } from 'lucide-react'
import { initialClients, initialDailyUpdates } from '@/data/seed'
import {
  attendanceSeries,
  daysUntil,
  DEFAULT_RULES,
  membershipPhase,
  memberGrowthSeries,
} from '@/lib/insights'
import { Avatar } from '@/components/ui'
import { buildSampleLogs } from '@/lib/sampleAttendance'

function Sparkline({ data, height = 64 }: { data: { label: string; members: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area
          type="monotone"
          dataKey="members"
          stroke="#FFFFFF"
          strokeWidth={2}
          fill="url(#heroSpark)"
          isAnimationActive
          animationDuration={1400}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface HeroPanelProps {
  data: {
    total: number
    active: number
    expiring: number
    today: number
    growth: { label: string; members: number }[]
    renewals: { name: string; plan: string; days: number; color: string }[]
  }
}

function HeroPanel({ data }: HeroPanelProps) {
  const reduce = useReducedMotion()
  const cells = [
    { icon: Users, label: 'Members', value: String(data.total) },
    { icon: CheckCircle2, label: 'Active', value: String(data.active) },
    { icon: CalendarClock, label: 'Expiring', value: String(data.expiring) },
  ]

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong relative w-full overflow-hidden"
      style={{ padding: 18 }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white">
            Live workspace
          </div>
          <div className="text-sm font-bold text-white mt-1">Operations overview</div>
        </div>
        <span className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>
          Sample data
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-lg px-2.5 py-2.5"
            style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border-faint)' }}
          >
            <div className="flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <c.icon size={11} aria-hidden />
              <span className="text-[0.6rem] font-semibold uppercase tracking-wider">{c.label}</span>
            </div>
            <div className="text-lg font-extrabold text-white leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[0.62rem] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
            Member growth
          </span>
          <span className="text-[0.66rem] font-bold" style={{ color: 'var(--accent-primary)' }}>
            <ArrowUpRight size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> 12 mo
          </span>
        </div>
        <Sparkline data={data.growth} />
      </div>

      <div className="pt-3.5" style={{ borderTop: '1px solid var(--border-faint)' }}>
        <div className="text-[0.62rem] uppercase tracking-widest font-bold mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Renewals coming up
        </div>
        <ul className="flex flex-col gap-2">
          {data.renewals.map((r) => (
            <li key={r.name} className="flex items-center gap-2.5">
              <Avatar name={r.name} color={r.color} size={26} radius={8} />
              <div className="min-w-0 flex-1">
                <div className="text-[0.76rem] font-semibold text-white truncate">{r.name}</div>
                <div className="text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
                  {r.plan} plan
                </div>
              </div>
              <span className={`badge ${r.days < 0 ? 'badge-expired' : r.days <= 7 ? 'badge-expiring' : 'badge-neutral'}`} style={{ fontSize: '0.56rem' }}>
                {r.days < 0 ? `Expired ${Math.abs(r.days)}d` : `${r.days}d left`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

/** Small floating metric card used around the hero. */
export function FloatingMetric({
  label,
  value,
  delta,
  delay = 0,
  className = '',
  style,
}: {
  label: string
  value: string
  delta?: string
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass ${className}`}
      style={{ padding: '11px 14px', minWidth: 148, ...style }}
    >
      <div className="text-[0.58rem] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-lg font-extrabold text-white leading-none">{value}</span>
        {delta && (
          <span className="text-[0.66rem] font-bold" style={{ color: 'var(--accent-primary)' }}>
            {delta}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/** Computes every hero number once from the seeded workspace. */
function useHeroData() {
  return useMemo(() => {
    const now = new Date()
    const logs = buildSampleLogs()
    const phases = initialClients.map((c) => membershipPhase(c, now, DEFAULT_RULES))
    const growth = memberGrowthSeries(initialClients, 12, now)
    const attendance = attendanceSeries(logs, 7, now)
    const renewals = initialClients
      .map((c) => ({
        name: c.name,
        plan: c.plan,
        days: daysUntil(c.endDate, now),
        color: c.avatarColor,
      }))
      .sort((a, b) => a.days - b.days)
      .slice(0, 3)

    return {
      total: initialClients.length,
      active: phases.filter((p) => p !== 'expired').length,
      expiring: phases.filter((p) => p === 'expiring').length,
      today: attendance[attendance.length - 1]?.visits ?? 0,
      growth,
      renewals,
      checkInsToday: logs.filter((l) => l.date === now.toISOString().split('T')[0] && l.present).length,
      dailyLogs: initialDailyUpdates.length,
    }
  }, [])
}

export function HeroPanelWithData() {
  const data = useHeroData()
  return <HeroPanel data={data} />
}

/** Section wrapper with the shared max-width + horizontal padding. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 lg:px-12 ${className}`} style={{ maxWidth: 1440 }}>
      {children}
    </div>
  )
}
