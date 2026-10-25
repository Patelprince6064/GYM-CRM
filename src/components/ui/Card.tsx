import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Adds hover lift + border glow. Use on genuinely interactive cards only. */
  interactive?: boolean
  /** Renders the thin lime rule along the top edge. */
  accent?: boolean
  padded?: boolean
}

export function Card({ children, interactive, accent, padded = true, className = '', style, ...rest }: CardProps) {
  return (
    <div
      className={`glass ${interactive ? 'card-hover' : ''} ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
      style={accent ? { borderTop: '1px solid rgba(198,255,61,0.35)' } : style}
      {...rest}
    >
      {children}
    </div>
  )
}

/** Standard heading block used at the top of every card. */
export function CardHeader({
  label,
  title,
  description,
  action,
}: {
  label?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
      <div className="min-w-0">
        {label && <div className="section-label">{label}</div>}
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        {description && <p className="text-xs text-faint mt-1">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
