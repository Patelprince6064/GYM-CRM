import type { ReactNode } from 'react'
import { CardHeader } from './Card'
import { EmptyState } from './EmptyState'
import { ChartSkeleton } from './Skeleton'
import { AlertTriangle } from 'lucide-react'

interface ChartCardProps {
  label?: string
  title: string
  description?: string
  action?: ReactNode
  /** True while the underlying request is in flight. */
  loading?: boolean
  /** Set when the request failed — shows an honest failure state. */
  error?: string | null
  /** True when the query succeeded but returned no rows. */
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  height?: number
  children: ReactNode
  className?: string
}

/**
 * Panel wrapper for every chart: header + loading skeleton + error +
 * empty state, so charts never render a misleading "0" flatline.
 */
export function ChartCard({
  label,
  title,
  description,
  action,
  loading,
  error,
  empty,
  emptyTitle = 'No data yet',
  emptyDescription = 'Once records start coming in, this chart will populate automatically.',
  height = 220,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <div className={`glass p-5 sm:p-6 ${className}`}>
      <CardHeader label={label} title={title} description={description} action={action} />

      {error ? (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.18)' }}
          role="alert"
        >
          <AlertTriangle size={16} color="#FFFFFF" className="flex-shrink-0 mt-0.5" aria-hidden />
          <div>
            <div className="text-xs font-bold text-white mb-0.5">Couldn't load this chart</div>
            <div className="text-xs text-faint">{error}</div>
          </div>
        </div>
      ) : loading ? (
        <ChartSkeleton height={height} />
      ) : empty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  )
}
