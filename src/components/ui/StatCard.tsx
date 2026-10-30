import { motion, useReducedMotion } from 'motion/react'
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/motion'

interface StatCardProps {
  label: string
  value: number | string
  /** Optional unit rendered after the number (%, kg, days…). */
  unit?: string
  icon: LucideIcon
  /** Accent colour — defaults to the brand lime. */
  color?: string
  /** Free-form supporting line, e.g. "3 more than last week". */
  caption?: string
  /** Direction of the trend indicator. Omit to show no trend chip. */
  trend?: 'up' | 'down' | 'flat'
  /** When there is no genuine historical comparison, omit this entirely. */
  trendLabel?: string
  /** 0–100 fill for the thin bar under the value. */
  fill?: number
  loading?: boolean
  delay?: number
}

/**
 * Dashboard KPI card. Only renders a trend chip when the caller passes
 * real comparison data — we never invent directional arrows.
 */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color = 'var(--accent-primary)',
  caption,
  trend,
  trendLabel,
  fill,
  loading = false,
  delay = 0,
}: StatCardProps) {
  const reduce = useReducedMotion()
  const numeric = typeof value === 'number'

  const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  const TrendIcon = trendIcon

  const card = (
    <div className="stat-card h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 26%, transparent)`,
          }}
        >
          <Icon size={18} color={color} aria-hidden />
        </div>
        {trend && trendLabel && (
          <span
            className="badge badge-neutral"
            style={{ color, borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
            title={trendLabel}
          >
            <TrendIcon size={11} aria-hidden />
            {trendLabel}
          </span>
        )}
      </div>

      <div className="text-3xl font-extrabold text-white tracking-tight leading-none">
        {numeric ? (
          <AnimatedCounter value={value} suffix={unit ? ` ${unit}` : ''} />
        ) : (
          <span>{value}</span>
        )}
      </div>

      <div className="text-[0.82rem] font-semibold text-dim mt-2">{label}</div>
      {caption && <div className="text-xs mt-1 text-dim font-medium">{caption}</div>}

      {typeof fill === 'number' && (
        <div className="mt-4 progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(0, Math.min(100, fill))}%`,
              background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 55%, transparent))`,
            }}
          />
        </div>
      )}

      {loading && <div className="skeleton mt-4" style={{ height: 6 }} />}
    </div>
  )

  if (reduce) return card

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {card}
    </motion.div>
  )
}
