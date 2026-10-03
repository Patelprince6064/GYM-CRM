/** Small formatting helpers shared across pages. */

export function timeNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function todayISODate(): string {
  return new Date().toISOString().split('T')[0]
}
