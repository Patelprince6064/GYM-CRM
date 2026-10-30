import { motion, useScroll, useSpring } from 'motion/react'

/**
 * Thin scroll-linked progress rail pinned to the top of the viewport.
 * Sits above the navbar so it reads as chrome, not content.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.4 })

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.15), #ffffff 55%, rgba(255,255,255,0.85))',
      }}
    />
  )
}
