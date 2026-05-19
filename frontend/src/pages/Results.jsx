import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import '../styles/Results.css'

const ChartTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <p className="chart-tip__label">{label}s</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.value}{unit}</p>)}
    </div>
  )
}

export default function Results() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/runs/${runId}/results`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [runId])

  if (loading) return <Layout><div className="results-page"><div className="loading-center"><span className="spinner" /></div></div></Layout>
  if (!data) return <Layout><div className="results-page"><p>Run not found.</p></div></Layout>

  const { run, config, metrics } = data
  const successRate = run.totalRequests > 0 ? (run.successfulRequests / run.totalRequests * 100).toFixed(1) : 0
  const failRate = (100 - successRate).toFixed(1)

  const pieData = [
    { name: 'Success', value: run.successfulRequests ?? 0 },
    { name: 'Failed', value: run.failedRequests ?? 0 }
  ]

  const latencyData = [
    { name: 'Avg', value: run.avgResponseTime ?? 0 },
    { name: 'Min', value: run.minResponseTime ?? 0 },
    { name: 'Max', value: run.maxResponseTime ?? 0 },
    { name: 'p95', value: run.p95ResponseTime ?? 0 },
    { name: 'p99', value: run.p99ResponseTime ?? 0 }
  ]

  const timelineData = metrics.map((m, i) => ({
    t: i + 1,
    rt: m.avgResponseTime ?? 0,
    rps: m.requestsInWindow ?? 0,
    sr: m.successCount && m.requestsInWindow
      ? +(m.successCount / m.requestsInWindow * 100).toFixed(1) : 100
  }))

  const duration = run.startedAt && run.completedAt
    ? ((new Date(run.completedAt) - new Date(run.startedAt)) / 1000).toFixed(1) : '—'

  return (
    <Layout>
      <div className="results-page">
        <div className="page-header">
          <div>
            <div className="runner-breadcrumb">
              <button className="runner-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
              <span>/</span>
              <button className="runner-back" onClick={() => navigate('/history')}>History</button>
              <span>/</span>
              <span>Run #{runId}</span>
            </div>
            <h1 className="page-title">{run.configName}</h1>
            <p className="page-sub">
              {new Date(run.createdAt).toLocaleString()} · {duration}s duration
            </p>
          </div>
          <span className={`status-badge status-badge--${run.status === 'COMPLETED' ? 'green' : 'red'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
            {run.status}
          </span>
        </div>

        <div className="results-kpis">
          {[
            { label: 'Total requests', value: run.totalRequests?.toLocaleString() ?? '—', sub: 'fired' },
            { label: 'Success rate', value: `${successRate}%`, sub: `${run.successfulRequests?.toLocaleString()} succeeded`, color: +successRate >= 95 ? 'green' : +successRate >= 80 ? 'amber' : 'red' },
            { label: 'Avg response', value: `${run.avgResponseTime ?? '—'}ms`, sub: `min ${run.minResponseTime}ms / max ${run.maxResponseTime}ms` },
            { label: 'p95 latency', value: `${run.p95ResponseTime ?? '—'}ms`, sub: '95th percentile' },
            { label: 'p99 latency', value: `${run.p99ResponseTime ?? '—'}ms`, sub: '99th percentile' },
            { label: 'Throughput', value: `${run.requestsPerSecond ?? '—'}`, sub: 'req / sec' }
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <span className="kpi-card__label">{k.label}</span>
              <span className={`kpi-card__value${k.color ? ` kpi-card__value--${k.color}` : ''}`}>{k.value}</span>
              <span className="kpi-card__sub">{k.sub}</span>
            </div>
          ))}
        </div>

        <div className="results-charts-main">
          {timelineData.length > 0 && (
            <div className="chart-card chart-card--wide">
              <p className="chart-card__title">Response time over time</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timelineData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rtGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B6EF3" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#1B6EF3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2DFDA" vertical={false}/>
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}s`}/>
                  <YAxis tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}ms`}/>
                  <Tooltip content={<ChartTooltip unit="ms" />}/>
                  <Area type="monotone" dataKey="rt" stroke="#1B6EF3" strokeWidth={2} fill="url(#rtGrad2)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="results-charts-grid">
          <div className="chart-card">
            <p className="chart-card__title">Latency breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={latencyData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFDA" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A8A6A0' }} tickLine={false} axisLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}ms`}/>
                <Tooltip formatter={(v) => [`${v}ms`]}/>
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {latencyData.map((_, i) => (
                    <Cell key={i} fill={i >= 3 ? '#DC2626' : '#1B6EF3'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <p className="chart-card__title">Success vs failures</p>
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#059669"/>
                    <Cell fill="#DC2626"/>
                  </Pie>
                  <Tooltip formatter={(v) => [v.toLocaleString()]}/>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#706E68' }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center-label">
                <span className="pie-pct">{successRate}%</span>
                <span className="pie-pct-sub">success</span>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <p className="chart-card__title">Test configuration</p>
            <div className="config-summary">
              {[
                { label: 'Target URL', value: config.targetUrl, mono: true },
                { label: 'Method', value: config.httpMethod },
                { label: 'Concurrent users', value: config.concurrentUsers },
                { label: 'Total requests', value: config.totalRequests?.toLocaleString() },
                { label: 'Ramp-up', value: `${config.rampUpSeconds}s` },
              ].map(r => (
                <div key={r.label} className="config-row">
                  <span className="config-row__label">{r.label}</span>
                  <span className={`config-row__value${r.mono ? ' config-row__value--mono' : ''}`} title={r.value}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
