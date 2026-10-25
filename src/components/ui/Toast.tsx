/* eslint-disable react-refresh/only-export-components */
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type Tone = 'success' | 'error' | 'info'
interface Toast {
  id: number
  message: string
  tone: Tone
}

interface ToastContextValue {
  toast: (message: string, tone?: Tone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons: Record<Tone, typeof Info> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

const colors: Record<Tone, string> = {
  success: '#FFFFFF',
  error: '#D4D4D8',
  info: '#E4E4E7',
}

/** Ephemeral UI feedback. Persistent alerts go through DataContext notifications. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, tone: Tone = 'info') => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev.slice(-3), { id, message, tone }])
      window.setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="flex flex-col gap-2"
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, width: 'min(340px, calc(100vw - 40px))' }}
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = icons[t.tone]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3"
                style={{
                  background: '#111113',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderLeft: `2px solid ${colors[t.tone]}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  boxShadow: '0 24px 60px -24px rgba(0,0,0,0.9)',
                }}
                role="status"
              >
                <Icon size={16} color={colors[t.tone]} className="flex-shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs leading-relaxed text-white flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
