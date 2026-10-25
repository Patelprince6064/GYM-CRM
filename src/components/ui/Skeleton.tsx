import type { CSSProperties } from 'react'

interface SkeletonProps {
  /** Pixel width or any CSS width string. */
  width?: number | string
  height?: number | string
  className?: string
  style?: CSSProperties
}

/** Rectangular shimmer block. */
export function Skeleton({ width, height, className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height, ...style }} aria-hidden />
}

/** Chart placeholder while data loads. */
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2" style={{ height }} aria-hidden>
      {[0.45, 0.7, 0.55, 0.85, 0.62, 0.9, 0.5, 0.75].map((h, i) => (
        <Skeleton key={i} style={{ flex: 1, height: `${h * 100}%` }} />
      ))}
    </div>
  )
}

/** Card-shaped loading placeholder. */
export function CardSkeleton() {
  return (
    <div className="glass p-6" aria-hidden>
      <Skeleton width={110} height={11} />
      <Skeleton width="55%" height={26} className="mt-4" />
      <Skeleton width="40%" height={13} className="mt-3" />
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  )
}

/** Route-level fallback shown while a lazy page chunk loads. */
export function PageSkeleton() {
  return (
    <div className="page-container" aria-busy="true" aria-live="polite">
      <Skeleton width={140} height={12} />
      <Skeleton width="52%" height={40} className="mt-4" />
      <Skeleton width="70%" height={16} className="mt-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="glass p-6">
          <Skeleton width={180} height={13} />
          <ChartSkeleton height={220} />
        </div>
        <div className="glass p-6">
          <Skeleton width={160} height={13} />
          <div className="flex flex-col gap-3 mt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={44} />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  )
}
