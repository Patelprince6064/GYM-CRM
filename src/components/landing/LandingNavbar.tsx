import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { BRAND, LANDING_SECTIONS, ROUTES } from '@/constants'
import { Logo } from '@/components/brand/Logo'

const LINKS = [
  { id: LANDING_SECTIONS.platform, label: 'Platform' },
  { id: LANDING_SECTIONS.features, label: 'Features' },
  { id: LANDING_SECTIONS.intelligence, label: 'Intelligence' },
  { id: LANDING_SECTIONS.membership, label: 'Membership' },
  { id: LANDING_SECTIONS.contact, label: 'Contact' },
] as const

/** Transparent over the hero, solid glass once the page scrolls. */
export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>(LINKS[0].id)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section is in view so the nav indicator can follow it.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'nav-scrolled' : 'bg-transparent border-b border-transparent'
        }`}
        style={{ borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent' }}
      >
        <nav
          className="mx-auto flex items-center justify-between gap-6 px-5 sm:px-8 lg:px-12"
          style={{ maxWidth: 1440, height: 76 }}
          aria-label="Primary"
        >
          <Link to={ROUTES.landing} className="flex-shrink-0" aria-label={`${BRAND.name} home`}>
            <Logo size={38} subtitle={false} />
          </Link>

          {/* Desktop links + animated indicator */}
          <ul className="hidden lg:flex items-center gap-1">
            {LINKS.map((link) => (
              <li key={link.id} className="relative">
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  className="relative px-3.5 py-2 text-[0.83rem] font-semibold transition-colors duration-200"
                  style={{ color: active === link.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  aria-current={active === link.id ? 'true' : undefined}
                >
                  {link.label}
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      style={{
                        position: 'absolute',
                        left: 8,
                        right: 8,
                        bottom: 2,
                        height: 2,
                        borderRadius: 2,
                        background: 'var(--accent-primary)',
                      }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={ROUTES.login}
              className="text-[0.83rem] font-semibold transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Sign In
            </Link>
            <Link to={ROUTES.login} className="btn-primary btn-sm">
              Get Started
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>

          <button
            className="btn-icon lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(4,5,4,0.72)', backdropFilter: 'blur(6px)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute top-0 right-0 bottom-0 flex flex-col"
              style={{ width: 'min(320px, 86vw)', background: '#09090b', borderLeft: '1px solid var(--border-color)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between px-5" style={{ height: 76 }}>
                <Logo size={34} subtitle={false} />
                <button className="btn-icon" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              <div className="hairline mx-5" />

              <ul className="flex flex-col gap-1 px-5 py-6 flex-1">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      onClick={() => go(link.id)}
                      className="w-full text-left px-3 py-3 rounded-lg text-base font-semibold transition-colors"
                      style={{
                        color: active === link.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                        background: active === link.id ? 'rgba(198,255,61,0.08)' : 'transparent',
                      }}
                    >
                      {link.label}
                    </button>
                  </motion.li>
                ))}
              </ul>

              <div className="px-5 pb-8 flex flex-col gap-3">
                <Link to={ROUTES.login} className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Get Started
                  <ArrowRight size={16} aria-hidden />
                </Link>
                <Link to={ROUTES.login} className="btn-secondary w-full" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
