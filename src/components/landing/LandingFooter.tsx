import { Link } from 'react-router-dom'
import { ArrowUpRight, Dumbbell } from 'lucide-react'
import { BRAND, LANDING_SECTIONS, ROUTES } from '@/constants'
import { Logo } from '@/components/brand/Logo'

const NAV = [
  { label: 'Platform', href: `#${LANDING_SECTIONS.platform}` },
  { label: 'Features', href: `#${LANDING_SECTIONS.features}` },
  { label: 'Intelligence', href: `#${LANDING_SECTIONS.intelligence}` },
  { label: 'Membership', href: `#${LANDING_SECTIONS.membership}` },
  { label: 'Contact', href: `#${LANDING_SECTIONS.contact}` },
]

const PRODUCT = [
  'Member records',
  'Membership & renewals',
  'Attendance logs',
  'Workout schedules',
  'Daily activity logs',
  'Weight & BMI tracking',
  'Analytics & reports',
  'Member portal',
]

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#000000', borderTop: '1px solid var(--border-faint)' }}>
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12 py-14" style={{ maxWidth: 1440 }}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Logo size={40} subtitle />
            <p className="text-sm mt-5 max-w-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {BRAND.tagline} A dark-first operations platform for fitness businesses — members, attendance,
              renewals and progress in one console.
            </p>
            <div className="flex items-center gap-2 mt-6 text-[0.66rem] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text-muted)' }}>
              <Dumbbell size={13} color="#FFFFFF" aria-hidden />
              {BRAND.system} · {BRAND.established}
            </div>
          </div>

          {/* Nav */}
          <nav aria-label="Footer">
            <div className="text-[0.62rem] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>
              Navigate
            </div>
            <ul className="flex flex-col gap-2.5">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to={ROUTES.login} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
                  Sign In
                </Link>
              </li>
            </ul>
          </nav>

          {/* Implemented features */}
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>
              What's implemented
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {PRODUCT.map((f) => (
                <li key={f} className="text-[0.8rem] flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span
                    className="flex-shrink-0 mt-1.5"
                    style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--accent-primary)' }}
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {year} {BRAND.name}. All figures on this page come from the bundled sample workspace.
          </p>
          <div className="flex items-center gap-5 text-xs">
            <span style={{ color: 'var(--text-muted)' }}>No payment processing</span>
            <a
              href={`#${LANDING_SECTIONS.platform}`}
              className="inline-flex items-center gap-1 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Back to top
              <ArrowUpRight size={13} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
