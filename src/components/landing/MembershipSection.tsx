import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CalendarRange, CreditCard, RefreshCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { initialClients } from '@/data/seed'
import { daysUntil, formatFullDate, membershipPhase, planDistribution, DEFAULT_RULES } from '@/lib/insights'
import { Avatar, Badge } from '@/components/ui'

const EASE = [0.22, 1, 0.36, 1] as const

const PLAN_META: Record<string, { term: string; color: string }> = {
  Basic: { term: '30-day term', color: '#71717A' },
  Premium: { term: '180-day term', color: '#D4D4D8' },
  Elite: { term: '365-day term', color: '#FFFFFF' },
}

const FLOW = [
  {
    icon: CalendarRange,
    title: 'Start',
    body: 'Record the plan, start date and end date once. Everything else — status, days remaining, renewal window — is derived from those two dates, so it can never go stale.',
  },
  {
    icon: ShieldCheck,
    title: 'Track',
    body: 'Attendance, weigh-ins and daily logs attach to the member, giving you a continuity picture instead of a spreadsheet of disconnected columns.',
  },
  {
    icon: RefreshCcw,
    title: 'Renew',
    body: 'The renewals view separates what is coming from what has already lapsed, so follow-ups start from the right premise. Reminders reuse the messaging that already exists.',
  },
]

/**
 * Membership lifecycle. Deliberately explicit that this build does *not*
 * include payment processing — renewals are recorded by staff.
 */
export function MembershipSection() {
  const reduce = useReducedMotion()

  const data = useMemo(() => {
    const now = new Date()
    const plans = planDistribution(initialClients)
    const upcoming = [...initialClients]
      .map((c) => ({ ...c, left: daysUntil(c.endDate, now) }))
      .sort((a, b) => a.left - b.left)
    const phase = (c: (typeof initialClients)[number]) => membershipPhase(c, now, DEFAULT_RULES)
    return {
      plans,
      upcoming,
      active: upcoming.filter((c) => phase(c) === 'active').length,
      expiring: upcoming.filter((c) => phase(c) === 'expiring').length,
      expired: upcoming.filter((c) => phase(c) === 'expired').length,
    }
  }, [])

  const total = initialClients.length

  return (
    <section
      id="membership"
      className="relative py-24 sm:py-32"
      style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-faint)' }}
    >
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12" style={{ maxWidth: 1440 }}>
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <div className="section-label">Membership</div>
            <h2 className="display-lg text-white">
              Membership, <span className="gradient-text">handled.</span>
            </h2>
            <p className="lede mt-6">
              Three plans, one lifecycle. Dates drive status, status drives the work your team does next —
              and nothing is silently recomputed behind your back.
            </p>

            <div className="flex flex-col gap-4 mt-9">
              {FLOW.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                  className="flex gap-4"
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.22)',
                    }}
                  >
                    <step.icon size={17} color="#FFFFFF" aria-hidden />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{step.title}</div>
                    <p className="text-[0.82rem] mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div
              className="rounded-xl p-4 mt-8 flex items-start gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <CreditCard size={16} color="#FFFFFF" className="flex-shrink-0 mt-0.5" aria-hidden />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#FFFFFF' }}>No payment processing is included.</strong> Membership
                value is a field your team records on the member; renewals are marked as done by a person, not
                by a checkout.
              </p>
            </div>
          </div>

          {/* Right: plan mix + renewals */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col gap-4"
          >
            <div className="glass p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 mb-5">
                <div>
                  <div className="section-label">Plan distribution</div>
                  <div className="text-base font-bold text-white">Sample workspace</div>
                </div>
                <span className="text-[0.7rem] font-bold" style={{ color: 'var(--text-muted)' }}>
                  {total} members
                </span>
              </div>

              <ul className="flex flex-col gap-4">
                {data.plans.map((p, i) => (
                  <li key={p.name}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-white">
                        {p.name}
                        <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>
                          {PLAN_META[p.name]?.term}
                        </span>
                      </span>
                      <span className="font-bold" style={{ color: PLAN_META[p.name]?.color ?? '#FFFFFF' }}>
                        {p.value} · {Math.round((p.value / total) * 100)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        style={{ background: PLAN_META[p.name]?.color ?? '#FFFFFF' }}
                        initial={reduce ? { width: `${(p.value / total) * 100}%` } : { width: 0 }}
                        whileInView={{ width: `${(p.value / total) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: EASE }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5" style={{ borderTop: '1px solid var(--border-faint)' }}>
                {[
                  { label: 'Active', value: data.active, color: '#FFFFFF' },
                  { label: 'Expiring ≤14d', value: data.expiring, color: '#D4D4D8' },
                  { label: 'Expired', value: data.expired, color: '#71717A' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-extrabold" style={{ color: s.color }}>
                      {s.value}
                    </div>
                    <div className="text-[0.58rem] uppercase tracking-wider font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <div className="section-label">Upcoming renewals</div>
                  <div className="text-sm font-bold text-white">Next to fall off the books</div>
                </div>
                <Link to={ROUTES.login} className="btn-secondary btn-sm">
                  Open renewals
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>

              <ul className="flex flex-col gap-2.5">
                {data.upcoming.slice(0, 5).map((m) => {
                  const tone = m.left < 0 ? 'danger' : m.left <= DEFAULT_RULES.expiryWarnDays ? 'warning' : 'neutral'
                  return (
                    <li key={m.id} className="flex items-center gap-3">
                      <Avatar name={m.name} color={m.avatarColor} size={32} radius={9} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.82rem] font-semibold text-white truncate">{m.name}</div>
                        <div className="text-[0.66rem]" style={{ color: 'var(--text-muted)' }}>
                          {m.plan} · ends {formatFullDate(m.endDate)}
                        </div>
                      </div>
                      <Badge tone={tone}>
                        {m.left < 0 ? `Expired ${Math.abs(m.left)}d` : m.left === 0 ? 'Today' : `${m.left}d`}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
