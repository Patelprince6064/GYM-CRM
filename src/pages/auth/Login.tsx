// PAGE 1 - LOGIN (Premium Dark Fitness Theme)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
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
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loginRole, setLoginRole] = useState<'admin' | 'user'>('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login, signup, changePassword, authMode } = useAuth()
  const { clients } = useData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isForgotPassword) {
      await handleForgotPassword(e)
      return
    }
    setError('')
    setSuccess('')

    if (!email.trim()) { setError('Please enter your email'); return }
    if (!password.trim()) { setError('Please enter your password'); return }

    setIsSubmitting(true)
    const requiredRole = loginRole === 'admin' ? 'admin' : 'user'
    const result = await login(email.trim(), password.trim(), requiredRole)
    setIsSubmitting(false)

    if (result.ok) {
      navigate(loginRole === 'admin' ? '/dashboard' : '/member')
      return
    }

    // First-time activation: an administrator created this member record but
    // no account exists yet. Registering is the only way in — it never
    // grants the admin role, and it fails loudly if the email is unknown.
    if (loginRole === 'user') {
      const member = clients.find((c) => c.email.toLowerCase() === email.trim().toLowerCase())
      if (member) {
        setIsSubmitting(true)
        const registered = await signup(member.name, email.trim(), password.trim())
        setIsSubmitting(false)
        if (registered.ok) {
          navigate('/member')
          return
        }
        if (registered.error && registered.error !== 'An account with that email already exists') {
          setError(registered.error)
          return
        }
      }
    }
    setError(result.error ?? 'Sign in failed')
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !currentPassword || !password) {
      setError('Enter your email, current password and new password.')
      return
    }
    setIsSubmitting(true)
    const result = await changePassword(email, currentPassword, password)
    setIsSubmitting(false)
    if (result.ok) {
      setSuccess('Password updated. You can now sign in.')
      setIsForgotPassword(false)
      setPassword('')
      setCurrentPassword('')
    } else {
      setError(result.error ?? 'Unable to update the password')
    }
  }

  const handleRoleChange = (role: 'admin' | 'user') => {
    setLoginRole(role)
    setError('')
    setEmail('')
    setPassword('')
  }

  const quote = motivationalQuotes[0]

  return (
    <div
      className="login-container"
      style={{ background: '#000000', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Left Panel – Gym Image + Branding */}
      <div className="login-left-panel">
        {/* Background Image */}
        <img
          src="/gym-login.png"
          alt="Gym"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.25, filter: 'grayscale(100%)',
          }}
        />
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.55) 100%)',
        }} />
        {/* White top stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0.2))',
        }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 24px rgba(255, 255, 255, 0.25)',
            }}
          >
            <Dumbbell size={24} color="#000000" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
              Gym<span style={{ color: '#FFFFFF' }}>CRM</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', fontWeight: 700 }}>FITNESS MANAGEMENT PLATFORM</div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10">
          {/* White tag */}
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
            borderLeft: '2px solid #FFFFFF', paddingLeft: '16px',
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
                  className="flex items-center gap-4"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  >
                    <Icon size={16} color="#FFFFFF" />
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

        {/* Honest capability strip — no invented customer counts */}
        <div className="flex flex-wrap gap-3 relative z-10">
          {[
            { value: '2 roles', label: 'Admin & member access' },
            { value: '4 rules', label: 'Explainable insight engine' },
            { value: '0 fees', label: 'No payment processing' },
          ].map((s, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                minWidth: 130,
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Login/Signup Form */}
      <div className="login-right-panel">
        <div className="w-full login-form-wrapper">
          {/* Mobile Logo */}
          <div className="login-mobile-logo">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#FFFFFF' }}
            >
              <Dumbbell size={20} color="#000000" />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>
              Gym<span style={{ color: '#FFFFFF' }}>CRM</span>
            </div>
          </div>

          {/* Card */}
          <div
            style={{
              background: '#111113',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
            }}
            className="login-card"
          >
            {/* Top accent */}
            <div style={{
              height: '2px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              marginBottom: '32px',
            }} />

            <div style={{ marginBottom: '28px' }}>
              <div className="flex gap-2 p-1 mb-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  style={{
                    flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', transition: 'all 0.3s',
                    background: loginRole === 'admin' ? 'var(--accent-primary)' : 'transparent',
                    color: loginRole === 'admin' ? 'black' : 'var(--text-muted)'
                  }}
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('user')}
                  style={{
                    flex: 1, padding: '8px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', transition: 'all 0.3s',
                    background: loginRole === 'user' ? 'var(--accent-primary)' : 'transparent',
                    color: loginRole === 'user' ? 'black' : 'var(--text-muted)'
                  }}
                >
                  User Login
                </button>
              </div>

              <h2 style={{
                fontSize: '1.8rem', fontWeight: 900,
                color: 'white', marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}>
                {isForgotPassword ? 'Reset Password 🔐' : 'Welcome Back 💪'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {isForgotPassword
                  ? 'Enter your email, current password and a new password'
                  : `Sign in to your GymCRM ${loginRole} panel`}
              </p>
            </div>

            {authMode === 'local' && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '10px',
                padding: '9px 13px',
                marginBottom: '16px',
                fontSize: '0.76rem',
                color: '#D4D4D8',
                fontWeight: 600,
              }}>
                Backend unreachable — this session was verified against credentials stored in this
                browser only. Server-side checks resume once the API is back.
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#FFFFFF',
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#FFFFFF',
                fontWeight: 600,
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  placeholder="@gmail.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: 700,
                  color: 'var(--text-secondary)', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {isForgotPassword ? 'New Password' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-glass w-full"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isForgotPassword ? 'Choose a new password' : 'Enter your password'}
                    style={{ paddingRight: '44px' }}
                    autoComplete={isForgotPassword ? 'new-password' : 'current-password'}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {!isForgotPassword && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => { setIsForgotPassword(true); setError(''); setSuccess('') }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsForgotPassword(true)
                          setError('')
                          setSuccess('')
                        }
                      }}
                      style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot password?
                    </span>
                  </div>
                )}
              </div>

              {/* Changing a password always requires the current one. */}
              {isForgotPassword && (
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.78rem', fontWeight: 700,
                    color: 'var(--text-secondary)', marginBottom: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    Current Password
                  </label>
                  <input
                    className="input-glass w-full"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center"
                style={{ padding: '14px', fontSize: '0.95rem', marginTop: '4px', borderRadius: '12px', fontWeight: 800 }}
              >
                {isSubmitting ? (
                  <span>Working…</span>
                ) : isForgotPassword ? (
                  <>Update Password <ArrowRight size={17} /></>
                ) : (
                  <>Sign In to Dashboard <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            {/* Toggle Forgot Password */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {isForgotPassword && (
                <button
                  onClick={() => setIsForgotPassword(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)',
                  }}
                >
                  Back to Sign In
                </button>
              )}
            </div>


          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            © 2026 GymCRM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
