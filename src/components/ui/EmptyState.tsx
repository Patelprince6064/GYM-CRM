import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

/** Honest empty state — never fakes data when a dataset is empty. */
export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 52,
          height: 52,
          borderRadius: 15,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-color)',
        }}
      >
        <Icon size={22} className="text-faint" aria-hidden />
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-faint max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Neutral "feature needs backend support" state. */
export function UnavailableState({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed var(--border-color)' }}
    >
      <div className="text-xs font-bold uppercase tracking-widest text-faint mb-2">Not available yet</div>
      <div className="text-sm font-bold text-white mb-1">{title}</div>
      <p className="text-xs text-faint leading-relaxed">{description}</p>
    </div>
  )
}
