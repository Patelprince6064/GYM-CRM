import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  /** Maximum tilt in degrees. */
  max?: number
  /** Perspective distance in px. */
  perspective?: number
  /** Show a cursor-tracked glare highlight over the surface. */
  glare?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * 3D tilt card — the surface pitches and yaws toward the cursor and a
 * specular glare tracks the pointer. Transform-only so it stays on the
 * compositor. Pointer-only; static for coarse pointers and reduced motion.
 */
export function TiltCard({
  children,
  max = 8,
  perspective = 900,
  glare = true,
  className = '',
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const gOpacity = useMotionValue(0)

  const srx = useSpring(rx, { stiffness: 150, damping: 18, mass: 0.5 })
  const sry = useSpring(ry, { stiffness: 150, damping: 18, mass: 0.5 })

  const glareBg = useTransform(
    [gx, gy],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.16), transparent 55%)`,
  )

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (min-width: 768px)')
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
      style={{
        transformPerspective: perspective,
        rotateX: srx,
        rotateY: sry,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      onPointerMove={(e) => {
        if (!active || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        ry.set((px - 0.5) * max * 2)
        rx.set((0.5 - py) * max * 2)
        gx.set(px * 100)
        gy.set(py * 100)
        gOpacity.set(0.5)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
        gOpacity.set(0)
      }}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ opacity: gOpacity, background: glareBg }}
        />
      )}
    </motion.div>
  )
}
