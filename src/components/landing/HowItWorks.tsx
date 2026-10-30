import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, BarChart3, Users, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Magnetic, SplitHeading } from '@/components/motion'

const EASE = [0.22, 1, 0.36, 1] as const

const STEPS = [
  {
    index: '01',
    icon: Users,
    title: 'Connect your gym.',
    body: 'Import or enter your members once — plans, dates, goals and contact details in a single record.',
  },
  {
    index: '02',
    icon: Workflow,
    title: 'Manage your members.',
    body: 'Check-ins, workout schedules, daily logs and renewals all write to the same member you created.',
  },
  {
    index: '03',
    icon: BarChart3,
    title: 'Understand your growth.',
    body: 'Growth, attendance and engagement charts read directly from those records — with visible empty states when they don\'t.',
  },
]

/** Restrained three-step timeline with a scroll-linked rule. */
export function HowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-faint)' }}
    >
      <div className="absolute inset-0 radial-lime" aria-hidden />

      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12 relative" style={{ maxWidth: 1440 }}>
        <div className="max-w-2xl mb-14">
          <div className="section-label">How it works</div>
          <SplitHeading
            as="h2"
            className="display-lg text-white"
            delay={0.1}
            lines={[
              { text: 'Three steps to a' },
              { text: 'tighter operation', gradient: true, sheen: true },
            ]}
          />
        </div>

        <div className="relative">
          {/* Connecting rule */}
          <div
            className="hidden lg:block absolute left-0 right-0"
            style={{ top: 34, height: 1, background: 'var(--border-color)' }}
            aria-hidden
          >
            <motion.div
              style={{ height: 1, transformOrigin: 'left center', background: 'linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0.15))' }}
              initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.3, ease: EASE }}
            />
          </div>

          <ol className="grid lg:grid-cols-3 gap-8 lg:gap-10 relative">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.index}
                initial={reduce ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.6, delay: i * 0.14, ease: EASE }}
                className="relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 20,
                      background: 'linear-gradient(150deg, rgba(255,255,255,0.12), rgba(20,20,22,0.95))',
                      border: '1px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 20px 44px -26px rgba(255,255,255,0.4)',
                    }}
                  >
                    <step.icon size={24} color="#FFFFFF" aria-hidden />
                  </div>
                  <span className="step-index" style={{ fontSize: '0.82rem' }}>
                    {step.index}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white tracking-tight">{step.title}</h3>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <Link to={ROUTES.login} className="btn-primary">
              Get Started
              <ArrowRight size={16} aria-hidden />
            </Link>
          </Magnetic>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Sign in opens the workspace your team already uses.
          </span>
        </motion.div>
      </div>
    </section>
  )
}
