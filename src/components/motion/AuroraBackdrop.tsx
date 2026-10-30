import { motion, useReducedMotion } from 'motion/react'

interface Blob {
  color: string
  size: number
  top: string
  left: string
  x: number[]
  y: number[]
  duration: number
}

const BLOBS: Blob[] = [
  {
    color: 'rgba(255,255,255,0.10)',
    size: 620,
    top: '-12%',
    left: '8%',
    x: [0, 60, -30, 0],
    y: [0, -40, 30, 0],
    duration: 26,
  },
  {
    color: 'rgba(212,212,216,0.08)',
    size: 520,
    top: '32%',
    left: '58%',
    x: [0, -70, 40, 0],
    y: [0, 50, -30, 0],
    duration: 32,
  },
  {
    color: 'rgba(255,255,255,0.06)',
    size: 440,
    top: '58%',
    left: '22%',
    x: [0, 40, -50, 0],
    y: [0, -30, 40, 0],
    duration: 24,
  },
]

/**
 * Slow-drifting radial blobs that give the near-black canvas atmospheric
 * depth. Every blob animates only `transform`, so the whole layer stays on
 * the compositor. Static (still visible) under reduced motion.
 */
export function AuroraBackdrop({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at center, ${b.color}, transparent 68%)`,
            filter: 'blur(28px)',
            willChange: 'transform',
          }}
          initial={reduce ? false : { x: b.x[0], y: b.y[0] }}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
