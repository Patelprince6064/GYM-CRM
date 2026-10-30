import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDownRight, ArrowUpRight, CalendarCheck2, Minus, Users } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { Avatar, Card, CardHeader, EmptyState } from '@/components/ui'
import { DEFAULT_RULES, gymPulse, formatShortDate } from '@/lib/insights'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Gym Pulse — what is happening in the building right now.
 * The week-over-week figure is a genuine comparison of two 7-day windows
 * over recorded check-ins, not a hardcoded trend.
 */
export function GymPulse() {
  const { clients, attendanceLogs, isHydrating } = useData()
  const reduce = useReducedMotion()

  const pulse = useMemo(
    () => gymPulse(clients, attendanceLogs, DEFAULT_RULES, new Date()),
    [clients, attendanceLogs],
  )

  const delta =
    pulse.visitsLastWeek > 0
      ? Math.round(((pulse.visitsThisWeek - pulse.visitsLastWeek) / pulse.visitsLastWeek) * 100)
      : pulse.visitsThisWeek > 0
        ? 100
        : 0
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const TrendIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus
  const trendColor = direction === 'up' ? '#FFFFFF' : direction === 'down' ? '#A1A1AA' : 'var(--text-muted)'

  return (
    <Card className="h-full">
      <CardHeader
        label="Gym pulse"
        title="Today on the floor"
        description={`${formatShortDate(pulse.today)} · ${pulse.visitsThisWeek} visits in the last 7 days`}
        action={
          <span
            className="badge"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
            }}
          >
            <CalendarCheck2 size={11} aria-hidden />
            {pulse.checkedInToday} checked in
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="rounded-lg px-3 py-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border-faint)' }}>
          <div className="text-xl font-extrabold text-white leading-none">{pulse.visitsThisWeek}</div>
          <div className="text-[0.58rem] uppercase tracking-wider font-bold mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Visits · 7d
          </div>
        </div>
        <div className="rounded-lg px-3 py-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border-faint)' }}>
          <div className="text-xl font-extrabold text-white leading-none">{pulse.visitsLastWeek}</div>
          <div className="text-[0.58rem] uppercase tracking-wider font-bold mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Prior 7d
          </div>
        </div>
        <div
          className="rounded-lg px-3 py-3 flex flex-col justify-between"
          style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border-faint)' }}
        >
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon size={16} aria-hidden />
            <span className="text-xl font-extrabold leading-none">
              {delta > 0 ? '+' : ''}
              {delta}%
            </span>
          </div>
          <div className="text-[0.58rem] uppercase tracking-wider font-bold mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Week on week
          </div>
        </div>
      </div>

      <div className="text-[0.62rem] uppercase tracking-[0.14em] font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
        Checked in today
      </div>

      {pulse.todayRoster.length === 0 ? (
        <EmptyState
          icon={Users}
          title={isHydrating ? 'Loading check-ins…' : 'No one has checked in yet'}
          description={
            isHydrating
              ? 'Reading today\'s attendance records.'
              : 'Record a check-in from a member\'s profile and today\'s roster fills in here.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {pulse.todayRoster.slice(0, 8).map((member, i) => (
            <motion.li
              key={member.clientId}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: EASE }}
              className="flex items-center gap-3"
            >
              <Avatar
                name={member.name}
                color={clients.find((c) => c.id === member.clientId)?.avatarColor}
                size={30}
                radius={9}
              />
              <span className="text-[0.82rem] font-semibold text-white flex-1 truncate">{member.name}</span>
              <span className="text-[0.7rem] font-bold" style={{ color: '#FFFFFF' }}>
                {member.time}
              </span>
            </motion.li>
          ))}
          {pulse.todayRoster.length > 8 && (
            <li className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
              +{pulse.todayRoster.length - 8} more
            </li>
          )}
        </ul>
      )}

      <div className="mt-5 pt-4 text-[0.7rem]" style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
        {pulse.activeMembers} active memberships · {pulse.expiringSoon} expiring · {pulse.expired} expired ·{' '}
        {pulse.inactive} inactive
      </div>
    </Card>
  )
}
