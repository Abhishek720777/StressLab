import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import '../styles/Login.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
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
      const res = await api.post('/api/auth/login', form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

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
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4FF47" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#C4FF47" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="crashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4444" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#FF4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="45" x2="340" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="88" x2="340" y2="88" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="132" x2="340" y2="132" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              <text x="4" y="42" fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="Space Mono, monospace">HIGH</text>
              <text x="4" y="85" fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="Space Mono, monospace">MID</text>
              <text x="4" y="129" fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="Space Mono, monospace">LOW</text>

              <path
                className="load-area"
                d="M 36 148 C 75 146, 105 138, 128 122 C 148 108, 162 84, 178 52 L 185 26 L 190 38 C 198 66, 208 116, 218 148 L 230 162 C 265 168, 310 165, 340 163 L 340 175 L 36 175 Z"
                fill="url(#areaGrad)"
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

              <text x="192" y="23" fill="rgba(255,68,68,0.7)" fontSize="9" fontFamily="Space Mono, monospace" className="peak-label">BREAK</text>

              <text x="0" y="172" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="Space Mono, monospace">0</text>
              <text x="160" y="172" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="Space Mono, monospace">50k</text>
              <text x="310" y="172" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="Space Mono, monospace">100k</text>
            </svg>
            <p className="graph-label">Response time vs concurrent users</p>
          </div>

          <div className="brand-copy">
            <h1 className="brand-headline">
              Know your<br /><span>breaking point.</span>
            </h1>
            <p className="brand-sub">
              Fire 100,000 requests. Watch your endpoints survive — or not. Real-time. No guessing.
            </p>
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
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to your StressLab workspace</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="form-error" role="alert">{error}</div>
            )}

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
              <div className="field__label-row">
                <label className="field__label" htmlFor="password">Password</label>
              </div>
              <input
                className={`field__input${error ? ' field__input--error' : ''}`}
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className={`btn-primary${loading ? ' btn-primary--loading' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : 'Sign in'}
            </button>
          </form>

          <div className="form-divider">or</div>

          <p className="form-footer">
            No account?{' '}
            <Link to="/register" className="form-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
