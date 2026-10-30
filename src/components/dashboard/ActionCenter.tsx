import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  BellRing,
  CircleCheckBig,
  ListTodo,
  RotateCcw,
  Sparkles,
  UserRoundX,
} from 'lucide-react'
import { useData } from '@/context/DataContext'
import { Badge, Button, Card, CardHeader, EmptyState, IconButton } from '@/components/ui'
import { ROUTES } from '@/constants'
import { buildActionCenter, DEFAULT_RULES } from '@/lib/insights'
import type { ActionKind, ActionItem } from '@/lib/insights'

const EASE = [0.22, 1, 0.36, 1] as const

const KIND_ICON: Record<ActionKind, typeof Sparkles> = {
  renewal: BellRing,
  inactive: UserRoundX,
  profile: Sparkles,
  milestone: CircleCheckBig,
  attendance: ListTodo,
}

const PRIORITY: Record<1 | 2 | 3, { label: string; tone: 'danger' | 'warning' | 'neutral' }> = {
  1: { label: 'Do first', tone: 'danger' },
  2: { label: 'This week', tone: 'warning' },
  3: { label: 'When free', tone: 'neutral' },
}

/**
 * Smart Action Center — a prioritised, de-duplicated task list derived from
 * the same rules as the rest of the product. Items can be dismissed (the
 * dismissal persists via `/api/signals/dismissed`) and restored.
 */
export function ActionCenter() {
  const { clients, attendanceLogs, dismissedSignals, dismissSignal, restoreSignal, isHydrating } = useData()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [showDismissed, setShowDismissed] = useState(false)

  const items = useMemo(
    () => buildActionCenter(clients, attendanceLogs, DEFAULT_RULES, new Date(), dismissedSignals),
    [clients, attendanceLogs, dismissedSignals],
  )

  const dismissed = useMemo(
    () => buildActionCenter(clients, attendanceLogs, DEFAULT_RULES, new Date()).filter((i) => dismissedSignals.includes(i.id)),
    [clients, attendanceLogs, dismissedSignals],
  )

  const open = items.slice(0, 7)

  return (
    <Card className="h-full">
      <CardHeader
        label="Smart action center"
        title="What to do next"
        description="Ranked by severity, then alphabetically. Dismissing removes it from this list only."
        action={
          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
            {items.length} open
          </span>
        }
      />

      {open.length === 0 ? (
        <EmptyState
          icon={CircleCheckBig}
          title={isHydrating ? 'Loading tasks…' : 'Nothing needs attention'}
          description={
            isHydrating
              ? 'Reading the workspace…'
              : 'Every membership is current, every member has checked in recently, and no profiles have gaps.'
          }
          action={
            dismissed.length > 0 ? (
              <Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={() => setShowDismissed((v) => !v)}>
                Review {dismissed.length} dismissed
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {open.map((item, i) => {
              const Icon = KIND_ICON[item.kind]
              const p = PRIORITY[item.priority]
              return (
                <motion.li
                  key={item.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.32, delay: Math.min(i, 6) * 0.04, ease: EASE }}
                  className="rounded-xl p-3.5 group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.18)',
                      }}
                    >
                      <Icon size={15} color="#FFFFFF" aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.82rem] font-bold text-white">{item.title}</span>
                        <Badge tone={p.tone}>{p.label}</Badge>
                      </div>
                      <p className="text-[0.72rem] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {item.clientId != null && (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<ArrowRight size={12} />}
                            onClick={() => navigate(`${ROUTES.clients}?q=${encodeURIComponent(item.clientName ?? '')}`)}
                          >
                            Open member
                          </Button>
                        )}
                        <IconButton label={`Dismiss “${item.title}”`} onClick={() => dismissSignal(item.id)} style={{ width: 30, height: 30 }}>
                          <span className="text-[0.68rem] font-bold" style={{ color: 'var(--text-muted)' }}>
                            Dismiss
                          </span>
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      {dismissed.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <button
            className="flex items-center gap-2 text-[0.74rem] font-bold transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setShowDismissed((v) => !v)}
            aria-expanded={showDismissed}
          >
            <RotateCcw size={13} color="#FFFFFF" aria-hidden />
            {showDismissed ? 'Hide' : 'Show'} {dismissed.length} dismissed item{dismissed.length === 1 ? '' : 's'}
          </button>

          {showDismissed && (
            <ul className="flex flex-col gap-2 mt-3">
              {dismissed.map((item: ActionItem) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg p-2.5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-faint)' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.76rem] font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                      {item.title}
                    </div>
                    <div className="text-[0.66rem] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Hidden from the open list
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => restoreSignal(item.id)}>
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  )
}
