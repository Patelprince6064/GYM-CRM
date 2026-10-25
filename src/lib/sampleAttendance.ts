import type { AttendanceLog, Client } from '@/types'
import { initialClients } from '@/data/seed'

/**
 * Deterministic check-in history generator.
 *
 * Two jobs:
 *  1. Power the public landing page, which never calls the live API
 *     (member records should not leak onto an unauthenticated endpoint).
 *  2. Serve as the offline fallback inside `DataContext` when the backend
 *     is unreachable, so attendance views still render instead of emptying.
 *
 * A fixed LCG keeps the output reproducible across refreshes, devices and
 * restarts — unlike the old implementation, which re-randomised on mount
 * and made "today's attendance" change every time you navigated.
 */
export function buildSampleLogs(days = 60, members: Client[] = initialClients): AttendanceLog[] {
  const logs: AttendanceLog[] = []
  let id = 1
  let seed = 20260425
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const checkIns = ['06:15 AM', '07:00 AM', '08:30 AM', '06:45 PM', '08:00 PM']
  const checkOuts = ['07:15 AM', '08:00 AM', '09:30 AM', '07:45 PM', '09:00 PM']
  const cadence = [0.78, 0.72, 0.58, 0.5, 0.84, 0.3, 0.8, 0.66]

  members.forEach((client, index) => {
    for (let d = 1; d <= days; d += 1) {
      const date = new Date()
      date.setDate(date.getDate() - d)
      const dow = date.getDay()
      const weekend = dow === 0 || dow === 6
      const chance = weekend ? cadence[index % cadence.length] * 0.55 : cadence[index % cadence.length]
      const pick = Math.floor(rnd() * checkIns.length)
      const present = rnd() < chance
      logs.push({
        id: id++,
        clientId: client.id,
        date: date.toISOString().split('T')[0],
        checkInTime: present ? checkIns[pick] : '',
        checkOutTime: present ? checkOuts[pick] : undefined,
        present,
      })
    }
  })

  return logs
}
