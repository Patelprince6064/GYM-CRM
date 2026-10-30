import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ElementType } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

export interface SplitLine {
  text: string
  /** Render this line with the gradient + sheen treatment. */
  gradient?: boolean
  /** Sweep a moving specular highlight across this (gradient) line. */
  sheen?: boolean
}

interface SplitHeadingProps {
  /** One entry per visual line break. */
  lines: SplitLine[]
  /** Polymorphic tag — `h1`, `h2`, `h3`, `p`, `span`… */
  as?: ElementType
  className?: string
  /** Delay before the first word starts, in seconds. */
  delay?: number
  /** Gap between consecutive words, in seconds. */
  stagger?: number
  /** Re-trigger every time it re-enters the viewport instead of once. */
  once?: boolean
}

/**
 * Kinetic typography — each word rises from behind an overflow mask.
 * Gradient lines get a slow specular sheen so the headline reads as lit
 * metal rather than flat text. Fully degrades to static text when the
 * user prefers reduced motion.
 */
export function SplitHeading({
  lines,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  stagger = 0.06,
  once = true,
}: SplitHeadingProps) {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  const word: Variants = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 0.75, ease: EASE } },
  }

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={line.gradient ? 'gradient-text block' : 'block'}>
            {line.text}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount: 0.2 }}
      >
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.text.split(' ').map((w, wi) => (
              <span
                key={`${li}-${wi}`}
                className="inline-block overflow-hidden align-bottom"
                // Extra bottom padding keeps descenders from being clipped by
                // the mask; the negative margin pulls it back out of layout.
                style={{ paddingBottom: '0.14em', marginBottom: '-0.14em' }}
              >
                <motion.span
                  variants={word}
                  className={`inline-block ${line.gradient ? 'gradient-text' : ''} ${
                    line.sheen ? 'sheen' : ''
                  }`}
                >
                  {w}
                  {/* Preserve the separating space without the mask swallowing it */}
                  <span className="inline-block">&nbsp;</span>
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
