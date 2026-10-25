import type { ReactNode } from 'react'

interface PageHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

/** Consistent page title block used across admin + member routes. */
export function PageHeading({ eyebrow, title, description, actions }: PageHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7 flex-wrap animate-fadeInUp">
      <div className="min-w-0">
        {eyebrow && <div className="section-label">{eyebrow}</div>}
        <h1 className="display-md text-white">{title}</h1>
        {description && <p className="text-dim text-sm mt-2">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  )
}
