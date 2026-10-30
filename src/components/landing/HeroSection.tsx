import { useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight, ChevronDown, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRAND, LANDING_SECTIONS, ROUTES } from '@/constants'
import { Container, FloatingMetric, HeroPanelWithData } from './HeroPanel'
import { AuroraBackdrop, Magnetic, SplitHeading, AnimatedCounter } from '@/components/motion'
import { initialClients } from '@/data/seed'
import { attendanceSeries } from '@/lib/insights'
import { buildSampleLogs } from '@/lib/sampleAttendance'

const EASE = [0.22, 1, 0.36, 1] as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/** Cinematic, near-full-screen hero. Parallax is desktop-only and capped. */
export function HeroSection() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [finePointer, setFinePointer] = useState(false)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.65])

  // Cursor parallax — disabled for coarse pointers and reduced motion.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 55, damping: 20, mass: 0.5 })
  const springY = useSpring(pointerY, { stiffness: 55, damping: 20, mass: 0.5 })
  const previewX = useTransform(springX, (v) => v * 16)
  const previewY = useTransform(springY, (v) => v * 16)
  const imageX = useTransform(springX, (v) => v * -14)
  const imageY = useTransform(springY, (v) => v * -10)

  // Real figures for the counting stat row, from the bundled sample set.
  const stats = useMemo(() => {
    const now = new Date()
    const logs = buildSampleLogs()
    const week = attendanceSeries(logs, 7, now)
    const visits = week.reduce((s, d) => s + d.visits, 0)
    const checkedIn = new Set(
      logs.filter((l) => l.date === now.toISOString().split('T')[0] && l.present).map((l) => l.clientId),
    ).size
    return { members: initialClients.length, visits, checkedIn }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (min-width: 1024px)')
    const update = () => setFinePointer(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const parallaxOn = finePointer && !reduce

  const onMouseMove = (e: React.MouseEvent) => {
    if (!parallaxOn || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const onMouseLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section
      id={LANDING_SECTIONS.platform}
      ref={ref}
      className="relative overflow-hidden grain"
      style={{ minHeight: '100svh' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      aria-label="Hero"
    >
      {/* Photography layer */}
      <motion.div className="absolute inset-0" style={{ scale: imageScale, x: imageX, y: imageY }}>
        <img
          src="/gym-training.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ objectPosition: '60% 40%' }}
          loading="eager"
          onError={(e) => {
            const el = e.currentTarget
            if (!el.src.endsWith('gym-hero.png')) el.src = '/gym-hero.png'
            else el.style.display = 'none'
          }}
        />
      </motion.div>

      {/* Readability scrims + textures */}
      <motion.div className="hero-scrim" style={{ opacity: scrimOpacity }} />
      <div className="absolute inset-0 grid-texture" aria-hidden />
      <div className="absolute inset-0 radial-lime" aria-hidden />
      <AuroraBackdrop />

      {/* Accent rule — a single restrained line that draws itself in */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          bottom: 132,
          height: 1,
          width: 220,
          transformOrigin: 'left center',
          background: 'linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0))',
        }}
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.9 }}
        transition={{ duration: 1.1, delay: 1.1, ease: EASE }}
      />

      <motion.div
        className="relative z-10 flex items-center"
        style={{ y: reduce ? 0 : contentY, minHeight: '100svh', paddingTop: 110, paddingBottom: 96 }}
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center w-full">
            {/* ---- Copy column ---- */}
            <div>
              <motion.div variants={stagger} initial={reduce ? false : 'hidden'} animate="show">
                <motion.div variants={item}>
                  <span
                    className="chip"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)' }}
                  >
                    <span
                      className="animate-pulse-glow"
                      style={{ width: 6, height: 6, borderRadius: 99, background: '#FFFFFF', display: 'inline-block' }}
                      aria-hidden
                    />
                    <span style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.66rem' }}>
                      {BRAND.trustLine}
                    </span>
                  </span>
                </motion.div>
              </motion.div>

              {/* Kinetic headline — words rise from behind a mask, the
                  second line gets a specular sheen sweep. */}
              <SplitHeading
                as="h1"
                className="display-xl text-white mt-7"
                delay={0.35}
                stagger={0.08}
                lines={[{ text: 'YOUR GYM.' }, { text: 'YOUR EMPIRE.', gradient: true, sheen: true }]}
              />

              <motion.p
                className="lede mt-7 text-base sm:text-lg"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
              >
                {BRAND.description}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3 mt-9"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.82, ease: EASE }}
              >
                <Magnetic>
                  <Link to={ROUTES.login} className="btn-primary btn-lg">
                    Explore the Platform
                    <ArrowRight size={17} aria-hidden />
                  </Link>
                </Magnetic>
                <button
                  type="button"
                  className="btn-secondary btn-lg"
                  onClick={() =>
                    document
                      .getElementById(LANDING_SECTIONS.features)
                      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
                  }
                >
                  <PlayCircle size={17} aria-hidden />
                  See How It Works
                </button>
              </motion.div>

              {/* Counting stat row — real figures from the sample set */}
              <motion.div
                className="grid grid-cols-3 gap-4 sm:gap-6 mt-10 pt-7 border-t border-white/10"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                {[
                  { label: 'Members', value: stats.members, suffix: '', sub: 'Profiles, plans & progress' },
                  { label: 'Visits / week', value: stats.visits, suffix: '', sub: 'Real check-in records' },
                  { label: 'Checked in', value: stats.checkedIn, suffix: '', sub: 'On the floor right now' },
                ].map((s) => (
                  <div key={s.label} className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/90 mt-2">
                      {s.label}
                    </div>
                    <div className="text-[0.7rem] mt-1 text-zinc-400">{s.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ---- Preview column ---- */}
            <div className="relative">
              <motion.div
                style={parallaxOn ? { x: previewX, y: previewY } : undefined}
                className="relative z-10"
              >
                <HeroPanelWithData />
              </motion.div>

              <FloatingMetric
                label="Member growth"
                value="+18%"
                delta="vs prior year"
                delay={1.05}
                className="hidden sm:block absolute"
                style={{ top: -26, left: -14 }}
              />
              <FloatingMetric
                label="Retention"
                value="86%"
                delta="12-month rolling"
                delay={1.2}
                className="hidden md:block absolute"
                style={{ bottom: 46, right: -22 }}
              />
              <FloatingMetric
                label="Attendance"
                value="5.2×"
                delta="per member / week"
                delay={1.35}
                className="hidden lg:block absolute"
                style={{ bottom: -34, left: 34 }}
              />
            </div>
          </div>
        </Container>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        type="button"
        className="absolute left-1/2 bottom-6 z-10 flex flex-col items-center gap-2 -translate-x-1/2"
        style={{ color: 'var(--text-muted)' }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        onClick={() =>
          document
            .getElementById(LANDING_SECTIONS.features)
            ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        }
        aria-label="Scroll to features"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.24em] font-bold hidden sm:block">Scroll</span>
        <ChevronDown size={18} className="animate-scroll-hint" aria-hidden />
      </motion.button>
    </section>
  )
}
