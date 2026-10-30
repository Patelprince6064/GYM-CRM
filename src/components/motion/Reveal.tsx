import { motion, useInView, useReducedMotion, type Variants } from 'motion/react'
import { useRef, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Delay in seconds before the reveal starts. */
  delay?: number
  /** How far the element travels, in px. */
  y?: number
  /** Total animation duration in seconds. */
  duration?: number
  className?: string
  /** Reveal once and never replay on re-entry. */
  once?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Viewport-triggered fade-up. Animates transform + opacity only and
 * degrades to an instant, fully visible state when motion is reduced.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount: 0.15 })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Shared container variant set for staggered groups. */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

/**
 * Staggered wrapper — children animate in sequence when this enters view.
 * Use `staggerItem` (or <StaggerItem/>) on each direct child.
 */
export function Stagger({
  children,
  className,
  amount = 0.25,
}: {
  children: ReactNode
  className?: string
  amount?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

/** Direct child of a <Stagger>. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

/** Masks an image into view — clip-path wipe with a slight scale settle. */
export function RevealImage({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.06 }}
      animate={inView ? { clipPath: 'inset(0 0 0% 0)', scale: 1 } : undefined}
      transition={{ duration: 0.9, ease: EASE }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}
