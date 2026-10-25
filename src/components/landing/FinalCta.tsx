import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BookOpen, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRAND, LANDING_SECTIONS, ROUTES } from '@/constants'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Cinematic closing section. Doubles as the `#contact` anchor — contact
 * details are only rendered when the operator has configured them, so the
 * page never publishes a placeholder address.
 */
export function FinalCta() {
  const reduce = useReducedMotion()
  const contactEmail = BRAND.contactEmail

  return (
    <section
      id={LANDING_SECTIONS.contact}
      className="relative py-28 sm:py-36 overflow-hidden grain"
      style={{ background: 'var(--bg-base, #070807)' }}
    >
      <div className="absolute inset-0 grid-texture" aria-hidden />
      <div className="absolute inset-0 radial-lime" aria-hidden />
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 900,
          height: 460,
          top: '-160px',
          background: 'radial-gradient(ellipse at center, rgba(198,255,61,0.1), transparent 65%)',
        }}
        aria-hidden
      />

      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12 relative" style={{ maxWidth: 1440 }}>
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-end">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <div className="section-label">Get started</div>
            <h2 className="display-xl text-white">
              BUILD A
              <br />
              <span className="gradient-text">STRONGER BUSINESS.</span>
            </h2>
            <p className="lede mt-7 text-base sm:text-lg">
              Bring members, attendance, renewals and progress into one console your team will actually open
              every morning — and keep the decisions grounded in records you can check.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-9">
              <Link to={ROUTES.login} className="btn-primary btn-lg">
                Get Started
                <ArrowRight size={17} aria-hidden />
              </Link>
              <button
                type="button"
                className="btn-secondary btn-lg"
                onClick={() =>
                  document
                    .getElementById(LANDING_SECTIONS.platform)
                    ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
                }
              >
                Back to the top
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="glass p-6"
          >
            <div className="text-[0.62rem] uppercase tracking-[0.18em] font-bold mb-5" style={{ color: 'var(--accent-primary)' }}>
              Contact
            </div>

            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 text-sm text-white hover:text-zinc-300 transition-colors"
              >
                <span
                  className="flex items-center justify-center"
                  style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
                >
                  <Mail size={15} color="#FFFFFF" aria-hidden />
                </span>
                {contactEmail}
              </a>
            ) : (
              <div className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
                >
                  <Mail size={15} color="#FFFFFF" aria-hidden />
                </span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Contact details are configured by whoever operates this deployment — set{' '}
                  <code className="text-white">BRAND.contactEmail</code> in{' '}
                  <code className="text-white">src/constants</code> to publish one here.
                </p>
              </div>
            )}

            <div className="hairline my-5" />

            <ul className="flex flex-col gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-center gap-3">
                <BookOpen size={14} color="#9BBE72" className="flex-shrink-0" aria-hidden />
                Setup, environment variables and deployment are documented in the project README.
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={14} color="#9BBE72" className="flex-shrink-0" aria-hidden />
                Self-hosted: Render for the API, Vercel for the client — both configured in this repo.
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
