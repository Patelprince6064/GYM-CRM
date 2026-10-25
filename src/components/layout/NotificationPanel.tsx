import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellOff, Check, CheckCheck, Info, TriangleAlert } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { EmptyState } from '@/components/ui'
import type { NotificationItem } from '@/types'

const TONE: Record<NotificationItem['type'], { color: string; icon: typeof Info }> = {
  info: { color: '#FFFFFF', icon: Info },
  success: { color: '#E4E4E7', icon: Check },
  warning: { color: '#D4D4D8', icon: TriangleAlert },
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

/** Bell dropdown — persistent notifications live here (not toasts). */
export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, markNotificationRead, clearNotifications } = useData()
  const { user } = useAuth()

  const unread = notifications.filter((n) => !n.read).length

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
          <motion.div
            className="notifications-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="region"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <div className="flex items-center gap-2">
                <Bell size={15} color="#FFFFFF" aria-hidden />
                <span className="text-sm font-bold text-white">Notifications</span>
                {unread > 0 && <span className="badge badge-lime">{unread} new</span>}
              </div>
              <button
                className="btn-ghost btn-sm"
                onClick={clearNotifications}
                disabled={unread === 0}
                style={{ fontSize: '0.72rem' }}
              >
                <CheckCheck size={13} aria-hidden />
                Mark all read
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyState
                  icon={BellOff}
                  title="Nothing new"
                  description="System events, membership reminders and member activity will appear here."
                />
              ) : (
                <ul>
                  {notifications.slice(0, 40).map((n) => {
                    const tone = TONE[n.type] ?? TONE.info
                    const Icon = tone.icon
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => !n.read && markNotificationRead(n.id)}
                          className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors"
                          style={{
                            borderBottom: '1px solid var(--border-faint)',
                            background: n.read ? 'transparent' : 'rgba(198,255,61,0.045)',
                            cursor: n.read ? 'default' : 'pointer',
                          }}
                        >
                          <span
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 9,
                              background: `color-mix(in srgb, ${tone.color} 12%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${tone.color} 26%, transparent)`,
                            }}
                          >
                            <Icon size={13} color={tone.color} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className="block text-[0.78rem] leading-snug"
                              style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.read ? 500 : 650 }}
                            >
                              {n.message}
                            </span>
                            <span className="block text-[0.66rem] mt-1" style={{ color: 'var(--text-muted)' }}>
                              {n.time}
                              {!n.read && ' · unread'}
                            </span>
                          </span>
                          {!n.read && (
                            <span
                              style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent-primary)', flexShrink: 0, marginTop: 6 }}
                              aria-label="Unread"
                            />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="px-4 py-3 text-[0.66rem]" style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
              Signed in as {user?.email}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
