import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileBarChart, LayoutDashboard, Search, Users, X } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants'
import { Avatar } from '@/components/ui'
import { expiryLabel, membershipPhase, DEFAULT_RULES } from '@/lib/insights'

interface Result {
  id: string
  label: string
  hint?: string
  group: 'Members' | 'Pages'
  path: string
  avatar?: { name: string; color: string }
}

const ADMIN_PAGES = [
  { id: 'p-overview', label: 'Overview', hint: 'Dashboard', path: ROUTES.dashboard },
  { id: 'p-members', label: 'Members', hint: 'Member directory', path: ROUTES.clients },
  { id: 'p-memberships', label: 'Memberships', hint: 'Renewals & expiry', path: ROUTES.memberships },
  { id: 'p-reports', label: 'Reports', hint: 'CSV export', path: ROUTES.reports },
  { id: 'p-daily', label: 'Daily logs', hint: 'Water, sleep, workouts', path: ROUTES.dailyUpdates },
  { id: 'p-activity', label: 'Activity & attendance', hint: 'Check-ins', path: ROUTES.memberActivity },
  { id: 'p-workouts', label: 'Workout schedules', hint: 'Weekly plan', path: ROUTES.workouts },
  { id: 'p-weight', label: 'Weight tracking', hint: 'Progress charts', path: ROUTES.weight },
  { id: 'p-portal', label: 'Member portal', hint: 'Preview the member view', path: ROUTES.member },
]

const MEMBER_PAGES = [
  { id: 'p-portal', label: 'Member portal', hint: 'Today\'s activity', path: ROUTES.member },
  { id: 'p-mdash', label: 'Member dashboard', hint: 'Progress & plans', path: ROUTES.memberDashboard },
  { id: 'p-mact', label: 'Activity & attendance', hint: 'Your logs', path: ROUTES.memberActivity },
  { id: 'p-daily', label: 'Daily logs', hint: 'Water, sleep, workouts', path: ROUTES.dailyUpdates },
  { id: 'p-workouts', label: 'Workout schedules', hint: 'Weekly plan', path: ROUTES.workouts },
  { id: 'p-weight', label: 'Weight tracking', hint: 'Your progress', path: ROUTES.weight },
]

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

/**
 * ⌘K / Ctrl-K palette. Searches member records (scoped by role) and jumps
 * between the routes that actually exist in this build.
 */
export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate()
  const { clients } = useData()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const isAdmin = user?.role === 'admin'
  const pages = isAdmin ? ADMIN_PAGES : MEMBER_PAGES

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    const pageResults: Result[] = pages
      .filter((p) => !q || p.label.toLowerCase().includes(q) || (p.hint ?? '').toLowerCase().includes(q))
      .map((p) => ({ ...p, group: 'Pages' as const }))

    if (!q) return pageResults.slice(0, 6)

    const memberResults: Result[] = clients
      .filter((c) => {
        if (!isAdmin && c.email.toLowerCase() !== (user?.email ?? '').toLowerCase()) return false
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.plan?.toLowerCase().includes(q)
        )
      })
      .slice(0, 6)
      .map((c) => ({
        id: `m-${c.id}`,
        label: c.name,
        hint: `${c.plan} · ${membershipPhase(c, new Date(), DEFAULT_RULES)} · ${expiryLabel(c)}`,
        group: 'Members',
        path: `${ROUTES.clients}?q=${encodeURIComponent(c.name)}`,
        avatar: { name: c.name, color: c.avatarColor },
      }))

    return [...memberResults, ...pageResults].slice(0, 8)
  }, [query, clients, pages, isAdmin, user?.email])

  // Focus after the enter animation so on-screen keyboards appear.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[cursor] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor, open])

  /** Clears the query on the way out so the palette always reopens fresh. */
  const resetAndClose = () => {
    setQuery('')
    setCursor(0)
    onClose()
  }

  const go = (path: string) => {
    resetAndClose()
    navigate(path)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = results[cursor]
      if (target) go(target.path)
    } else if (e.key === 'Escape') {
      resetAndClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full overflow-hidden"
            style={{ maxWidth: 560, background: '#111113', border: '1px solid var(--border-color)', borderRadius: 18, boxShadow: 'var(--shadow-lift)', alignSelf: 'flex-start', marginTop: 'min(14vh, 120px)' }}
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <Search size={17} color="#FFFFFF" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCursor(0)
                }}
                placeholder={isAdmin ? 'Search members or jump to a page…' : 'Search your records or jump to a page…'}
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[color:var(--text-muted)]"
                style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', width: '100%', padding: 0, fontSize: '0.9rem' }}
                aria-label="Search"
                autoComplete="off"
              />
              <button className="btn-icon" onClick={resetAndClose} aria-label="Close search" style={{ width: 30, height: 30 }}>
                <X size={15} />
              </button>
            </div>

            <ul ref={listRef} className="max-h-[46vh] overflow-y-auto p-2" role="listbox" aria-label="Search results">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No matches for “{query}”.
                </li>
              )}
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                    style={{
                      background: i === cursor ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: `1px solid ${i === cursor ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                    }}
                  >
                    {r.avatar ? (
                      <Avatar {...r.avatar} size={30} radius={9} />
                    ) : (
                      <span
                        className="flex items-center justify-center"
                        style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-faint)' }}
                      >
                        {r.path === ROUTES.dashboard ? (
                          <LayoutDashboard size={14} color="#FFFFFF" aria-hidden />
                        ) : r.path === ROUTES.reports ? (
                          <FileBarChart size={14} color="#FFFFFF" aria-hidden />
                        ) : r.group === 'Members' ? (
                          <Users size={14} color="#FFFFFF" aria-hidden />
                        ) : (
                          <ArrowRight size={14} color="#FFFFFF" aria-hidden />
                        )}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.83rem] font-semibold text-white truncate">{r.label}</span>
                      {r.hint && (
                        <span className="block text-[0.68rem] truncate" style={{ color: 'var(--text-muted)' }}>
                          {r.hint}
                        </span>
                      )}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.55rem' }}>
                      {r.group}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 px-4 py-2.5 text-[0.64rem]" style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
              <span className="ml-auto">Ctrl / ⌘ + K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
