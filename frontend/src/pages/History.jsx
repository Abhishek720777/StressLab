import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import '../styles/History.css'

const STATUS_COLOR = { COMPLETED: 'green', RUNNING: 'blue', PENDING: 'amber', FAILED: 'red' }
const FILTERS = ['ALL', 'COMPLETED', 'RUNNING', 'FAILED', 'PENDING']

export default function History() {
  const navigate = useNavigate()
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/api/runs')
      .then(r => setRuns(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = runs.filter(r => {
    const matchFilter = filter === 'ALL' || r.status === filter
    const matchSearch = !search || r.configName?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const successRuns = runs.filter(r => r.status === 'COMPLETED').length
  const failedRuns = runs.filter(r => r.status === 'FAILED').length

  return (
    <Layout>
      <div className="history-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">History</h1>
            <p className="page-sub">{runs.length} total runs · {successRuns} completed · {failedRuns} failed</p>
          </div>
        </div>

        <div className="history-toolbar">
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' filter-tab--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? `All (${runs.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Search by test name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <p className="empty-state__title">No runs found</p>
            <p className="empty-state__sub">{runs.length === 0 ? 'Run your first test to see results here.' : 'Try adjusting your filters.'}</p>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test name</th>
                  <th>Status</th>
                  <th>Requests</th>
                  <th>Success %</th>
                  <th>Avg RT</th>
                  <th>p95</th>
                  <th>p99</th>
                  <th>Req/s</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const sr = r.totalRequests > 0
                    ? (r.successfulRequests / r.totalRequests * 100).toFixed(1)
                    : null
                  return (
                    <tr key={r.id} className="history-row" onClick={() => r.status === 'COMPLETED' ? navigate(`/results/${r.id}`) : r.status === 'RUNNING' ? navigate(`/run/${r.id}`) : null}>
                      <td className="td-id">#{r.id}</td>
                      <td className="td-name">{r.configName}</td>
                      <td><span className={`status-badge status-badge--${STATUS_COLOR[r.status]}`}>{r.status}</span></td>
                      <td className="td-mono">{r.totalRequests?.toLocaleString() ?? '—'}</td>
                      <td className="td-mono">
                        {sr != null ? (
                          <span className={+sr >= 95 ? 'val-green' : +sr >= 80 ? 'val-amber' : 'val-red'}>{sr}%</span>
                        ) : '—'}
                      </td>
                      <td className="td-mono">{r.avgResponseTime ? `${r.avgResponseTime}ms` : '—'}</td>
                      <td className="td-mono">{r.p95ResponseTime ? `${r.p95ResponseTime}ms` : '—'}</td>
                      <td className="td-mono">{r.p99ResponseTime ? `${r.p99ResponseTime}ms` : '—'}</td>
                      <td className="td-mono">{r.requestsPerSecond ?? '—'}</td>
                      <td className="td-date">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="td-action">
                        {r.status === 'COMPLETED' && (
                          <button className="btn-ghost-sm" onClick={e => { e.stopPropagation(); navigate(`/results/${r.id}`) }}>Results</button>
                        )}
                        {r.status === 'RUNNING' && (
                          <button className="btn-ghost-sm btn-ghost-sm--live" onClick={e => { e.stopPropagation(); navigate(`/run/${r.id}`) }}>Live</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
