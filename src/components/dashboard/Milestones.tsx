import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Award, CalendarCheck, Footprints, Trophy } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { CardHeader, EmptyState } from '@/components/ui'
import { milestones, DEFAULT_RULES } from '@/lib/insights'

const EASE = [0.22, 1, 0.36, 1] as const

const ICON = {
  streak: Trophy,
  visits: Footprints,
  weight: Award,
} as const

/**
 * Member milestones — streaks and visit counts actually evidenced by the
 * check-in records. Nothing here is awarded by default.
 */
export function Milestones() {
  const { clients, attendanceLogs, isHydrating } = useData()
  const reduce = useReducedMotion()

  const list = useMemo(
    () => milestones(clients, attendanceLogs, new Date()),
    [clients, attendanceLogs],
  )

  // One entry per member, strongest first.
  const top = useMemo(() => {
    const seen = new Set<number>()
    const order: typeof list = []
    for (const m of list) {
      if (seen.has(m.clientId)) continue
      seen.add(m.clientId)
      order.push(m)
    }
    return order.slice(0, 5)
  }, [list])

  return (
    <div className="glass p-5 sm:p-6 h-full">
      <CardHeader
        label="Member milestones"
        title="Recognition this month"
        description={`${DEFAULT_RULES.inactiveDays}-day inactivity window · visits counted over the last 30 days`}
      />

      {top.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={isHydrating ? 'Loading milestones…' : 'No milestones yet'}
          description={
            isHydrating
              ? 'Reading check-in history…'
              : 'A milestone appears once a member records a 3+ day streak or 10+ visits in the last 30 days.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {top.map((m, i) => {
            const Icon = ICON[m.kind] ?? Trophy
            return (
              <motion.li
                key={m.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Icon size={16} color="#FFFFFF" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.82rem] font-bold text-white truncate">{m.title}</div>
                  <div className="text-[0.68rem] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {m.clientName} · {m.detail}
                  </div>
                </div>
                <span className="text-[0.78rem] font-extrabold flex-shrink-0" style={{ color: '#FFFFFF' }}>
                  {m.value}
                </span>
              </motion.li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
