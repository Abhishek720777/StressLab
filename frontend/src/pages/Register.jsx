import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import '../styles/Register.css'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/register', form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return 'weak'
    if (p.length < 10) return 'fair'
    return 'strong'
  })()

  return (
    <div className="auth-layout">
      <div className="brand-panel">
        <div className="brand-panel__inner">
          <div className="brand-logo">
            <span className="brand-logo__mark">S</span>
            <span className="brand-logo__name">StressLab</span>
          </div>

          <div className="brand-visual">
            <svg className="load-graph" viewBox="0 0 340 175" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4FF47" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#C4FF47" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="45" x2="340" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="88" x2="340" y2="88" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="132" x2="340" y2="132" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              <path
                className="load-area"
                d="M 36 148 C 75 146, 105 138, 128 122 C 148 108, 162 84, 178 52 L 185 26 L 190 38 C 198 66, 208 116, 218 148 L 230 162 C 265 168, 310 165, 340 163 L 340 175 L 36 175 Z"
                fill="url(#areaGrad2)"
              />

              <path
                className="load-line"
                d="M 36 148 C 75 146, 105 138, 128 122 C 148 108, 162 84, 178 52 L 185 26 L 190 38 C 198 66, 208 116, 218 148 L 230 162 C 265 168, 310 165, 340 163"
                stroke="#C4FF47"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle className="peak-ring" cx="185" cy="26" r="5" fill="none" stroke="#FF4444" strokeWidth="1.5" />
              <circle className="peak-dot" cx="185" cy="26" r="4" fill="#FF4444" />
            </svg>
          </div>

          <div className="brand-copy">
            <h1 className="brand-headline">
              Built for devs.<br /><span>Trusted under pressure.</span>
            </h1>
            <p className="brand-sub">
              Create your workspace. Start stressing your stack in minutes.
            </p>
          </div>

          <div className="brand-stats">
            <div className="brand-stat">
              <span className="brand-stat__value">100k</span>
              <span className="brand-stat__label">max req/test</span>
            </div>
            <div className="brand-stat__divider" />
            <div className="brand-stat">
              <span className="brand-stat__value">1s</span>
              <span className="brand-stat__label">metric interval</span>
            </div>
            <div className="brand-stat__divider" />
            <div className="brand-stat">
              <span className="brand-stat__value">p99</span>
              <span className="brand-stat__label">latency tracking</span>
            </div>
          </div>

          <div className="brand-meta">
            <span className="brand-meta__dot" />
            <span className="brand-meta__text">LOAD TESTING · PERFORMANCE · MONITORING</span>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-panel__inner">
          <div className="form-header">
            <h2 className="form-title">Create account</h2>
            <p className="form-subtitle">Start stress testing your apps today</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="form-error" role="alert">{error}</div>
            )}

            <div className="field">
              <label className="field__label" htmlFor="username">Username</label>
              <input
                className={`field__input${error ? ' field__input--error' : ''}`}
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">Email address</label>
              <input
                className={`field__input${error ? ' field__input--error' : ''}`}
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">Password</label>
              <input
                className={`field__input${error ? ' field__input--error' : ''}`}
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
              {form.password && (
                <div className="password-strength">
                  <div className={`strength-bar strength-bar--${strength}`}>
                    <span /><span /><span />
                  </div>
                  <span className={`strength-label strength-label--${strength}`}>
                    {strength === 'weak' ? 'Too short' : strength === 'fair' ? 'Fair' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <button
              className={`btn-primary${loading ? ' btn-primary--loading' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : 'Create account'}
            </button>
          </form>

          <div className="form-divider">or</div>

          <p className="form-footer">
            Already have an account?{' '}
            <Link to="/login" className="form-link">Sign in</Link>
          </p>

          <p className="form-terms">
            By creating an account you agree to our{' '}
            <span className="form-link">Terms</span> and{' '}
            <span className="form-link">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
