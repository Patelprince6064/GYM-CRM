import { useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  /** Seconds for one full loop. */
  duration?: number
  className?: string
  /** Gap between items. */
  gap?: number
}

/**
 * Infinite horizontal ticker. The content is duplicated once and the track
 * slides by exactly half its width, so the loop is seamless. Pauses on hover
 * and freezes into a single static row under reduced motion.
 */
export function Marquee({ children, duration = 38, className = '', gap = 48 }: MarqueeProps) {
  const reduce = useReducedMotion()
  const [scope, animate] = useAnimate()
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null)

  useEffect(() => {
    if (reduce || !scope.current) return
    controlsRef.current = animate(
      scope.current,
      { x: ['0%', '-50%'] },
      { duration, ease: 'linear', repeat: Infinity },
    )
    return () => controlsRef.current?.stop()
  }, [duration, reduce, scope, animate])

  const row = (dup?: boolean) => (
    <div
      className="flex items-center flex-shrink-0"
      style={{ gap, paddingRight: gap }}
      aria-hidden={dup ? true : undefined}
    >
      {children}
    </div>
  )

  if (reduce) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <div className="flex items-center" style={{ gap }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onPointerEnter={() => controlsRef.current?.pause()}
      onPointerLeave={() => controlsRef.current?.play()}
    >
      <div ref={scope} className="flex w-max" style={{ gap }}>
        {row()}
        {row(true)}
      </div>
    </div>
  )
}
