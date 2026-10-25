import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { CapabilitiesStrip, FeatureShowcase, PlatformPreview } from '@/components/landing/PlatformPreview'
import { IntelligenceSection } from '@/components/landing/IntelligenceSection'
import { MembershipSection } from '@/components/landing/MembershipSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FinalCta } from '@/components/landing/FinalCta'
import { LandingFooter } from '@/components/landing/LandingFooter'

/** Public marketing surface — no data is fetched from the authenticated API. */
export default function Landing() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 100,
          background: '#FFFFFF',
          color: '#000000',
          padding: '10px 16px',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: '0.82rem',
        }}
      >
        Skip to content
      </a>

      <LandingNavbar />

      <main id="main-content">
        <HeroSection />
        <CapabilitiesStrip />
        <PlatformPreview />
        <FeatureShowcase />
        <IntelligenceSection />
        <MembershipSection />
        <HowItWorks />
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  )
}
