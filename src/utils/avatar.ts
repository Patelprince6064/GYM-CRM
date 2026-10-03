import { AVATAR_COLORS } from '@/constants'

/** Build "RS" style initials from a full name. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

/** Pick a random gradient for a new avatar. */
export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}
