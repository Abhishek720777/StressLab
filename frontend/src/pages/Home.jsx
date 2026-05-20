import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Home.css'

const TICKER_ITEMS = ['LOAD TESTING', 'REAL-TIME METRICS', 'CONCURRENT REQUESTS', 'p99 LATENCY', 'WEBSOCKET STREAMING', 'BREAKING POINT DETECTION', '100K REQUESTS', 'PERFORMANCE MONITORING', 'SPRING BOOT ENGINE', 'LIVE CHARTS']

const FEATURES = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        title: 'Real-time streaming',
        desc: 'WebSocket-powered charts update every second. Watch latency, throughput, and success rate shift live as requests pour in.'
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        title: 'Any HTTP endpoint',
        desc: 'GET, POST, PUT, DELETE, PATCH — point StressLab at any URL. Custom headers and JSON bodies supported.'
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
        ),
        title: 'Deep analytics',
        desc: 'min, avg, max, p95, and p99 latency. Success rate, failures, throughput. Every second of the test is recorded and stored.'
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: 'Concurrent load',
        desc: 'Up to 1,000 simultaneous connections via Java\'s thread pool. Ramp-up control to simulate organic traffic growth.'
    }
]

const STEPS = [
    {
        n: '01',
        title: 'Configure',
        desc: 'Set your target URL, HTTP method, concurrent users, total requests, and optional ramp-up time. Add custom headers and request body if needed.'
    },
    {
        n: '02',
        title: 'Fire',
        desc: 'Click run. The engine spins up a thread pool and fires your configured requests. Status flips to RUNNING instantly.'
    },
    {
        n: '03',
        title: 'Watch it break',
        desc: 'Live charts stream over WebSocket. See exactly where response time spikes, success rate drops, and your stack gives out.'
    }
]

const STATS = [
    { value: '100K', label: 'requests per test' },
    { value: '1s', label: 'metric sampling rate' },
    { value: 'p99', label: 'latency percentile' },
    { value: '∞', label: 'run history stored' }
]

export default function Home() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [navScrolled, setNavScrolled] = useState(false)

    const heroTextRef = useRef(null)
    const heroWindowRef = useRef(null)
    const heroBgRef = useRef(null)
    const rafRef = useRef(null)

    const ctaHref = token ? '/dashboard' : '/register'

    const updateParallax = useCallback((scrollY) => {
        if (heroTextRef.current) {
            heroTextRef.current.style.transform = `translateY(${scrollY * 0.12}px)`
        }
        if (heroWindowRef.current) {
            heroWindowRef.current.style.transform = `translateY(${scrollY * 0.22}px)`
        }
        if (heroBgRef.current) {
            heroBgRef.current.style.transform = `translateY(${scrollY * 0.05}px)`
        }
    }, [])

    useEffect(() => {
        let ticking = false

        const onScroll = () => {
            setNavScrolled(window.scrollY > 50)
            if (!ticking) {
                rafRef.current = requestAnimationFrame(() => {
                    updateParallax(window.scrollY)
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [updateParallax])

    // ─── Scroll-triggered reveals ────────────────────────────────────
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }),
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        )
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <div className="home-page">

            {/* ── NAV ─────────────────────────────────────────────────── */}
            <nav className={`hp-nav${navScrolled ? ' hp-nav--scrolled' : ''}`}>
                <div className="hp-nav__inner">
                    <Link to="/" className="hp-nav__logo">
                        <span className="hp-nav__logo-mark">S</span>
                        <span className="hp-nav__logo-name">StressLab</span>
                    </Link>
                    <div className="hp-nav__links">
                        <a href="#features" className="hp-nav__link">Features</a>
                        <a href="#how-it-works" className="hp-nav__link">How it works</a>
                        <a href="#stats" className="hp-nav__link">Stats</a>
                    </div>
                    <div className="hp-nav__ctas">
                        <Link to="/login" className="hp-nav__signin">Sign in</Link>
                        <Link to={ctaHref} className="hp-nav__getstarted">Get started</Link>
                    </div>
                </div>
            </nav>


            <section className="hero">
                <div className="hero-bg-grid" ref={heroBgRef} aria-hidden />

                <div className="hero-glow hero-glow--left" aria-hidden />
                <div className="hero-glow hero-glow--right" aria-hidden />

                <div className="hero-inner">
                    <div className="hero-left" ref={heroTextRef}>

                        <h1 className="hero-title">
                            Know your<br />
                            <span className="hero-title__accent">breaking<br />point</span>
                        </h1>

                        <p className="hero-sub">
                            Fire up to 100,000 concurrent requests at any HTTP endpoint.
                            Watch response time, success rate, and latency collapse in real time —
                            before your users find the limits for you.
                        </p>

                        <div className="hero-ctas">
                            <Link to={ctaHref} className="hero-cta-primary">
                                Start for free
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </Link>
                        </div>

                        <div className="hero-proof">
                            <div className="hero-proof__avatars">
                                {['A', 'B', 'C', 'D'].map((l, i) => (
                                    <span key={i} className="hero-proof__av" style={{ '--i': i }}>{l}</span>
                                ))}
                            </div>
                            <span className="hero-proof__text">Used by developers to find limits before users do</span>
                        </div>
                    </div>

                    <div className="hero-right" ref={heroWindowRef}>
                        <div className="hero-window">
                            <div className="hero-window__bar">
                                <div className="traffic-lights">
                                    <span className="tl tl--red" /><span className="tl tl--yellow" /><span className="tl tl--green" />
                                </div>
                                <span className="hero-window__title">Run #42 — /api/products · RUNNING</span>
                                <div className="hero-window__live">
                                    <span className="live-pulse" />
                                    LIVE
                                </div>
                            </div>

                            <div className="hero-window__body">
                                <div className="mock-stats-row">
                                    {[
                                        { val: '18,420', label: 'requests', color: '' },
                                        { val: '99.6%', label: 'success', color: 'green' },
                                        { val: '142ms', label: 'avg RT', color: '' },
                                        { val: '1,247', label: 'req/sec', color: 'blue' }
                                    ].map(s => (
                                        <div key={s.label} className="mock-stat">
                                            <span className={`mock-stat__val${s.color ? ` mock-stat__val--${s.color}` : ''}`}>{s.val}</span>
                                            <span className="mock-stat__label">{s.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mock-progress-wrap">
                                    <span className="mock-progress__label">Progress</span>
                                    <div className="mock-progress-bar">
                                        <div className="mock-progress-bar__fill" style={{ width: '37%' }} />
                                    </div>
                                    <span className="mock-progress__pct">37%</span>
                                </div>

                                <div className="mock-chart-wrap">
                                    <div className="mock-chart-ylabel">ms</div>
                                    <svg className="mock-chart" viewBox="0 0 360 120" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="mockGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#1B6EF3" stopOpacity="0.18" />
                                                <stop offset="100%" stopColor="#1B6EF3" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <line x1="0" y1="30" x2="360" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                        <line x1="0" y1="60" x2="360" y2="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                                        <line x1="0" y1="90" x2="360" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                                        <path
                                            className="mock-area"
                                            d="M 0 78 C 30 77,60 74,90 69 C 115 65,138 57,162 46 C 182 36,212 24,242 17 L 265 13 C 272 17,286 34,302 50 C 316 64,332 72,360 74 L 360 120 L 0 120 Z"
                                            fill="url(#mockGrad)"
                                        />
                                        <path
                                            className="mock-line"
                                            d="M 0 78 C 30 77,60 74,90 69 C 115 65,138 57,162 46 C 182 36,212 24,242 17 L 265 13 C 272 17,286 34,302 50 C 316 64,332 72,360 74"
                                            stroke="#1B6EF3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
                                        />
                                        <circle className="mock-peak" cx="265" cy="13" r="4" fill="#DC2626" />
                                        <circle className="mock-peak-ring" cx="265" cy="13" r="4" fill="none" stroke="#DC2626" strokeWidth="1.5" />
                                        <text x="270" y="11" fill="rgba(220,38,38,0.75)" fontSize="9" fontFamily="Space Mono, monospace">PEAK</text>
                                    </svg>
                                    <div className="mock-chart-xlabel">
                                        <span>0s</span><span>20s</span><span>40s</span><span>60s</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hero-float-card hero-float-card--1">
                            <span className="hfc__icon">⚡</span>
                            <div>
                                <span className="hfc__val">p99 — 318ms</span>
                                <span className="hfc__sub">99th percentile</span>
                            </div>
                        </div>
                        <div className="hero-float-card hero-float-card--2">
                            <span className="hfc__icon">🔴</span>
                            <div>
                                <span className="hfc__val">Breaking at 847 users</span>
                                <span className="hfc__sub">success rate dropped below 90%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-scroll-hint">
                    <span>scroll</span>
                    <svg width="12" height="16" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="1" y="1" width="10" height="14" rx="5" />
                        <line x1="6" y1="4" x2="6" y2="7" className="scroll-dot" />
                    </svg>
                </div>
            </section>

            {/* ── TICKER ──────────────────────────────────────────────── */}
            <div className="ticker" aria-hidden>
                <div className="ticker__track">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i} className="ticker__item">
                            {item} <span className="ticker__sep">·</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── FEATURES ────────────────────────────────────────────── */}
            <section className="hp-features" id="features">
                <div className="hp-section-inner">
                    <div className="hp-section-label reveal">FEATURES</div>
                    <h2 className="hp-section-title reveal">Everything you need<br />to break things.</h2>
                    <p className="hp-section-sub reveal">
                        StressLab is built for the exact moment before you ship. Find the limits now.
                    </p>

                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="feature-card reveal" style={{ '--delay': `${i * 0.1}s` }}>
                                <div className="feature-card__icon">{f.icon}</div>
                                <h3 className="feature-card__title">{f.title}</h3>
                                <p className="feature-card__desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ────────────────────────────────────────── */}
            <section className="hp-how" id="how-it-works">
                <div className="hp-section-inner">
                    <div className="hp-section-label reveal">HOW IT WORKS</div>
                    <h2 className="hp-section-title reveal">Simple. Precise.<br />Brutal.</h2>

                    <div className="steps-row">
                        {STEPS.map((s, i) => (
                            <div key={i} className="step reveal" style={{ '--delay': `${i * 0.12}s` }}>
                                <span className="step__n">{s.n}</span>
                                <div className="step__connector" aria-hidden />
                                <h3 className="step__title">{s.title}</h3>
                                <p className="step__desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ───────────────────────────────────────────────── */}
            <section className="hp-stats" id="stats">
                <div className="hp-stats-bg-grid" aria-hidden />
                <div className="hp-section-inner hp-section-inner--dark">
                    <div className="hp-section-label reveal hp-section-label--lime">THE NUMBERS</div>
                    <h2 className="hp-section-title hp-section-title--white reveal">
                        Built to push limits.
                    </h2>
                    <div className="stats-grid">
                        {STATS.map((s, i) => (
                            <div key={i} className="stat-item reveal" style={{ '--delay': `${i * 0.1}s` }}>
                                <span className="stat-item__val">{s.value}</span>
                                <span className="stat-item__label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ───────────────────────────────────────────── */}
            <section className="hp-cta">
                <div className="hp-section-inner hp-section-inner--centered">
                    <div className="hp-cta-eyebrow reveal">Ready?</div>
                    <h2 className="hp-cta-title reveal">Find your limit<br />before your users do.</h2>
                    <p className="hp-cta-sub reveal">
                        Set up in two minutes. No credit card. No config files.
                        Just a URL and a number.
                    </p>
                    <div className="reveal" style={{ '--delay': '0.2s' }}>
                        <Link to={ctaHref} className="hp-cta-btn">
                            Start stress testing
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="hp-footer">
                <div className="hp-footer__inner">
                    <div className="hp-footer__logo">
                        <span className="hp-nav__logo-mark">S</span>
                        <span className="hp-nav__logo-name">StressLab</span>
                    </div>
                    <p className="hp-footer__copy">
                        Built with Java, Spring Boot, React. &copy; {new Date().getFullYear()}
                    </p>
                    <div className="hp-footer__links">
                        <a href="https://github.com/Abhishek720777" target="_blank" rel="noopener noreferrer" className="hp-footer__link">GitHub</a>
                        <a href="https://www.linkedin.com/in/abhishek-poojary777" target="_blank" rel="noopener noreferrer" className="hp-footer__link">LinkedIn</a>
                        <a href="mailto:abhishekpoojary720@gmail.com" className="hp-footer__link">Contact</a>
                    </div>
                </div>
            </footer>

        </div>
    )
}