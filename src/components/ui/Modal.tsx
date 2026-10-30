import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children: ReactNode
  maxWidth?: number
  /** Hides the built-in header (for chat-style panels). */
  bare?: boolean
}

/**
 * Accessible dialog: portals to the body, locks background scroll,
 * closes on Escape and closes on backdrop click.
 */
export function Modal({ open, onClose, title, eyebrow, children, maxWidth = 500, bare = false }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className="modal-content"
            style={{ maxWidth, padding: bare ? 0 : undefined }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {!bare && (
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  {eyebrow && <div className="section-label">{eyebrow}</div>}
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{title}</h2>
                </div>
                <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
                  <X size={16} />
                </button>
              </div>
            )}
            {!bare && <div className="accent-rule mb-5" />}
            {bare && (
              <button className="btn-icon" onClick={onClose} aria-label="Close dialog" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                <X size={16} />
              </button>
            )}
            <div className={bare ? '' : undefined}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
