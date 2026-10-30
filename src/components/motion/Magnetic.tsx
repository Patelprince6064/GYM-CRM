import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface MagneticProps {
  children: ReactNode
  /** How strongly the element is pulled toward the cursor (0–1). */
  strength?: number
  /** Extra scale applied while hovered. */
  scale?: number
  className?: string
}

/**
 * Magnetic wrapper — the child drifts toward the cursor inside a radius
 * and springs back on leave. Pointer-only; disabled for coarse pointers
 * and reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.35,
  scale = 1.03,
  className = '',
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })
  const sScale = useTransform(() => (enabled && !reduce ? scale : 1))

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const active = enabled && !reduce

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, scale: sScale, display: 'inline-block' }}
      onPointerMove={(e) => {
        if (!active || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        x.set((e.clientX - cx) * strength)
        y.set((e.clientY - cy) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
