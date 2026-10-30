import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { BRAND } from '@/constants'

const SEEN_KEY = 'gym_crm_landing_intro_seen'

/**
 * First-visit curtain — two panels split apart to reveal the page while the
 * wordmark resolves. Plays once per browser session and never blocks input.
 * Rendered nothing at all when the user prefers reduced motion.
 */
export function EntranceCurtain() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (reduce) return
    let seen = false
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === '1'
    } catch {
      // Storage can be blocked — treat as unseen and just play it.
      seen = false
    }
    if (seen) {
      // First-visit key already consumed (e.g. a second effect pass under
      // StrictMode) — nothing to reveal, but still arm the safety close so a
      // curtain left open by an earlier pass always clears.
      const t = window.setTimeout(() => setOpen(false), 1150)
      return () => window.clearTimeout(t)
    }

    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Ignore — the curtain is cosmetic.
    }
    setOpen(true)
    const t = window.setTimeout(() => setOpen(false), 1150)
    return () => window.clearTimeout(t)
  }, [reduce])

  if (reduce) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top"
            style={{ background: '#000000' }}
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom"
            style={{ background: '#000000' }}
            initial={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          />

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'linear-gradient(140deg, #FFFFFF, #D4D4D8)',
                boxShadow: '0 18px 48px -18px rgba(255,255,255,0.5)',
              }}
            >
              <Dumbbell size={30} color="#000000" strokeWidth={2.4} />
            </motion.div>
            <div
              className="text-lg font-black tracking-[0.28em]"
              style={{ color: '#ffffff' }}
            >
              {BRAND.name}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
