import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  /** Decimals to display. */
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  /** Format with thousands separators. */
  grouped?: boolean
}

const formatter = (value: number, decimals: number, grouped: boolean) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  })

/**
 * Counts up the first time it scrolls into view. Uses an imperative
 * `animate()` on a node so it never re-renders the parent per frame.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.2,
  className,
  grouped = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setAnimated(v),
    })
    return () => controls.stop()
  }, [inView, value, duration, reduce])

  const display = reduce ? value : animated

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {formatter(display, decimals, grouped)}
      {suffix}
    </span>
  )
}
