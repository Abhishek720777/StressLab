import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Dashboard.css'

const METHOD_COLOR = { GET: 'blue', POST: 'green', PUT: 'amber', DELETE: 'red', PATCH: 'purple' }
const STATUS_COLOR = { COMPLETED: 'green', RUNNING: 'blue', PENDING: 'amber', FAILED: 'red' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [configs, setConfigs] = useState([])
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState(null)

  useEffect(() => {
    Promise.all([api.get('/api/tests'), api.get('/api/runs')])
      .then(([c, r]) => { setConfigs(c.data); setRuns(r.data.slice(0, 8)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRun = async (configId) => {
    setRunningId(configId)
    try {
      const res = await api.post(`/api/tests/${configId}/run`)
      navigate(`/run/${res.data.id}`)
    } catch {
      setRunningId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this test config?')) return
    await api.delete(`/api/tests/${id}`)
    setConfigs(prev => prev.filter(c => c.id !== id))
  }

  const totalRuns = runs.length
  const successRuns = runs.filter(r => r.status === 'COMPLETED').length
  const avgRT = runs.filter(r => r.avgResponseTime).reduce((a, b, _, arr) =>
    a + b.avgResponseTime / arr.length, 0)

  return (
    <Layout>
      <div className="dash-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Welcome back, <strong>{user?.username}</strong></p>
          </div>
          <button className="btn-primary-sm" onClick={() => navigate('/new-test')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New test
          </button>
        </div>

        <div className="stat-row">
          {[
            { label: 'Test configs', value: configs.length },
            { label: 'Total runs', value: totalRuns },
            { label: 'Completed', value: successRuns },
            { label: 'Avg response time', value: avgRT ? `${avgRT.toFixed(0)}ms` : '—' }
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-card__label">{s.label}</span>
              <span className="stat-card__value">{s.value}</span>
            </div>
          ))}
        </div>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Test configurations</h2>
            <button className="btn-ghost" onClick={() => navigate('/new-test')}>+ New</button>
          </div>

          {loading ? (
            <div className="empty-state"><span className="spinner" /></div>
          ) : configs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🧪</div>
              <p className="empty-state__title">No tests yet</p>
              <p className="empty-state__sub">Create your first test config to get started.</p>
              <button className="btn-primary-sm" onClick={() => navigate('/new-test')}>Create test</button>
            </div>
          ) : (
            <div className="config-grid">
              {configs.map(c => (
                <div key={c.id} className="config-card">
                  <div className="config-card__head">
                    <span className={`method-badge method-badge--${METHOD_COLOR[c.httpMethod]}`}>{c.httpMethod}</span>
                    <button className="icon-btn" onClick={() => handleDelete(c.id)} title="Delete">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                  <p className="config-card__name">{c.name}</p>
                  <p className="config-card__url" title={c.targetUrl}>{c.targetUrl}</p>
                  <div className="config-card__meta">
                    <span>{c.concurrentUsers} users</span>
                    <span>·</span>
                    <span>{c.totalRequests.toLocaleString()} reqs</span>
                    <span>·</span>
                    <span>{c.rampUpSeconds}s ramp</span>
                  </div>
                  <button className="btn-run" onClick={() => handleRun(c.id)} disabled={runningId === c.id}>
                    {runningId === c.id
                      ? <><span className="btn-spinner btn-spinner--dark" /> Starting…</>
                      : <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run test</>
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {runs.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Recent runs</h2>
              <button className="btn-ghost" onClick={() => navigate('/history')}>View all</button>
            </div>
            <div className="runs-table-wrap">
              <table className="runs-table">
                <thead>
                  <tr><th>Test</th><th>Status</th><th>Requests</th><th>Avg RT</th><th>Success %</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r.id}>
                      <td className="td-name">{r.configName}</td>
                      <td><span className={`status-badge status-badge--${STATUS_COLOR[r.status]}`}>{r.status}</span></td>
                      <td className="td-mono">{r.totalRequests?.toLocaleString() ?? '—'}</td>
                      <td className="td-mono">{r.avgResponseTime ? `${r.avgResponseTime}ms` : '—'}</td>
                      <td className="td-mono">{r.successfulRequests != null && r.totalRequests ? `${(r.successfulRequests / r.totalRequests * 100).toFixed(1)}%` : '—'}</td>
                      <td className="td-date">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        {r.status === 'COMPLETED' && <button className="btn-ghost-sm" onClick={() => navigate(`/results/${r.id}`)}>Results</button>}
                        {r.status === 'RUNNING' && <button className="btn-ghost-sm" onClick={() => navigate(`/run/${r.id}`)}>Live</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
