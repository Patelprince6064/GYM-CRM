import { AVATAR_COLORS } from '@/constants'

/** Build "RS" style initials from a full name. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0] ?? '?').slice(0, 2).toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/**
 * Pick a stable avatar colour token. Tokens are resolved to real
 * gradients by `components/ui/Avatar`, so they never depend on
 * Tailwind seeing a dynamically-built class name.
 */
export function randomAvatarColor(): string {
  const idx = Math.floor(Math.random() * AVATAR_COLORS.length)
  return AVATAR_COLORS[idx] ?? 'av-0'
}
