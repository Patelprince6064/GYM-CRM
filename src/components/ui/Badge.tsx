import { AlertTriangle, CheckCircle2, Clock, Info, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type MembershipStatus = 'Active' | 'Expiring' | 'Expired'

const statusClass: Record<string, string> = {
  Active: 'badge badge-active',
  Expiring: 'badge badge-expiring',
  Expired: 'badge badge-expired',
}

const statusIcon: Record<string, LucideIcon> = {
  Active: CheckCircle2,
  Expiring: Clock,
  Expired: XCircle,
}

/**
 * Status badge. Always pairs colour with an icon so state is never
 * communicated by colour alone.
 */
export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const Icon = statusIcon[status] ?? Info
  return (
    <span className={`${statusClass[status] ?? 'badge badge-neutral'} ${className}`}>
      <Icon size={11} aria-hidden />
      {status}
    </span>
  )
}

export type Tone = 'success' | 'warning' | 'danger' | 'lime' | 'neutral' | 'info'

const toneClass: Record<Tone, string> = {
  success: 'badge-active',
  warning: 'badge-expiring',
  danger: 'badge-expired',
  lime: 'badge-lime',
  neutral: 'badge-neutral',
  info: 'badge-neutral',
}

const toneIcon: Record<Tone, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  lime: Info,
  neutral: Info,
  info: Info,
}

export function Badge({
  tone = 'neutral',
  children,
  icon = true,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  icon?: boolean
  className?: string
}) {
  const Icon = toneIcon[tone]
  return (
    <span className={`badge ${toneClass[tone]} ${className}`}>
      {icon && <Icon size={11} aria-hidden />}
      {children}
    </span>
  )
}
