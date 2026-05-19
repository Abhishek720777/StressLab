import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Layout.css'

const NAV = [
  {
    path: '/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  },
  {
    path: '/new-test', label: 'New test',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  },
  {
    path: '/history', label: 'History',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  },
  {
    path: '/docs', label: 'Docs',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  }
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <span className="sidebar__logo-mark">S</span>
          <span className="sidebar__logo-name">StressLab</span>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item${location.pathname === item.path ? ' nav-item--active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar__user">
          <div className="sidebar__avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="sidebar__user-info">
            <span className="sidebar__username">{user?.username}</span>
            <span className="sidebar__email">{user?.email}</span>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
