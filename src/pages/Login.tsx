// PAGE 1 - LOGIN (Premium Dark Fitness Theme)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, Zap, Shield, TrendingUp, Users, Flame, ArrowRight } from 'lucide-react'

const features = [
  { icon: Users, text: 'Client Management', desc: 'Track every member\'s progress' },
  { icon: TrendingUp, text: 'Smart Analytics', desc: 'Data-driven fitness insights' },
  { icon: Shield, text: 'Secure & Reliable', desc: 'Enterprise-grade security' },
  { icon: Zap, text: 'Real-time Updates', desc: 'Live workout & attendance data' },
]

const motivationalQuotes = [
  '"The only bad workout is the one that didn\'t happen."',
  '"Push yourself, because no one else is going to do it for you."',
  '"Strength does not come from the body. It comes from the will."',
]

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('admin@gymcrm.com')
  const [password, setPassword] = useState('••••••••')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  const quote = motivationalQuotes[0]

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Left Panel – Gym Image + Branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        {/* Background Image */}
        <img
          src="/gym-login.png"
          alt="Gym"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.35,
          }}
        />
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.75) 60%, rgba(10,10,10,0.55) 100%)',
        }} />
        {/* Yellow top stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #FACC15, #FDE047, #FEF08A)',
        }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FACC15, #FDE047)',
              boxShadow: '0 0 30px rgba(250, 204, 21,0.5)',
            }}
          >
            <Dumbbell size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
              Gym<span style={{ color: '#FACC15' }}>CRM</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', fontWeight: 700 }}>FITNESS MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 animate-fadeInUp" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          {/* Yellow tag */}
          <div className="yellow-tag mb-6" style={{ display: 'inline-flex' }}>
            <Flame size={12} />
            Premium CRM for Fitness Professionals
          </div>

          <h1 style={{
            fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.05,
            color: 'white', marginBottom: '20px', letterSpacing: '-0.02em',
          }}>
            Transform Your{' '}
            <span className="gradient-text">Gym Business</span>
          </h1>

          {/* Motivational Quote */}
          <div style={{
            borderLeft: '3px solid #FACC15', paddingLeft: '16px',
            marginBottom: '36px',
          }}>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              {quote}
            </p>
          </div>

          {/* Feature List */}
          <div className="flex flex-col gap-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 animate-fadeInUp"
                  style={{ animationDelay: `${0.15 + i * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(250, 204, 21,0.1)', border: '1px solid rgba(250, 204, 21,0.2)' }}
                  >
                    <Icon size={16} color="#FACC15" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{f.text}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{f.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-10 relative z-10 animate-fadeInUp" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
          {[
            { value: '500+', label: 'Gyms Using' },
            { value: '50K+', label: 'Members' },
            { value: '99.9%', label: 'Uptime' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{
                fontSize: '1.8rem', fontWeight: 900, color: 'white',
                letterSpacing: '-0.03em',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Login Form */}
      <div
        className="flex-1 flex items-center justify-center p-8 relative"
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #0F0F0F 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="w-full max-w-md animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FACC15, #FDE047)' }}
            >
              <Dumbbell size={20} color="white" />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>
              Gym<span style={{ color: '#FACC15' }}>CRM</span>
            </div>
          </div>

          {/* Card */}
          <div
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 1px rgba(250, 204, 21,0.1)',
            }}
          >
            {/* Top accent */}
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, #FACC15, #FDE047)',
              borderRadius: '2px',
              marginBottom: '32px',
            }} />

            <div style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '1.8rem', fontWeight: 900,
                color: 'white', marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}>
                Welcome Back 💪
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Sign in to your GymCRM admin panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: 700,
                  color: 'var(--text-secondary)', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Email Address
                </label>
                <input
                  className="input-glass w-full"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@gymcrm.com"
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: 700,
                  color: 'var(--text-secondary)', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-glass w-full"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                    Forgot password?
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center"
                style={{ padding: '14px', fontSize: '0.95rem', marginTop: '4px', borderRadius: '12px', fontWeight: 800 }}
              >
                Sign In to Dashboard <ArrowRight size={17} />
              </button>
            </form>

          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            © 2026 GymCRM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
