import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import '../styles/TestRunner.css'

const STATUS_LABEL = { PENDING: 'Pending', RUNNING: 'Running', COMPLETED: 'Completed', FAILED: 'Failed' }

const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <p className="chart-tip__label">{label}s</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.value}{unit}</p>
      ))}
    </div>
  )
}

export default function TestRunner() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const [runInfo, setRunInfo] = useState(null)
  const [chartData, setChartData] = useState([])
  const [stats, setStats] = useState({ requestsSent: 0, successCount: 0, failCount: 0, successRate: 100, avgResponseTime: 0, requestsInWindow: 0, activeUsers: 0, status: 'PENDING' })
  const [elapsed, setElapsed] = useState(0)
  const [stopping, setStopping] = useState(false)
  const clientRef = useRef(null)
  const timerRef = useRef(null)

  const handleStop = async () => {
    if (!confirm('Are you sure you want to stop this load test? Any remaining requests will be canceled.')) return
    setStopping(true)
    try {
      await api.post(`/api/runs/${runId}/stop`)
      setStats(prev => ({ ...prev, status: 'FAILED' }))
    } catch (err) {
      alert('Failed to stop the test: ' + (err.response?.data?.message || err.message))
    } finally {
      setStopping(false)
    }
  }

  useEffect(() => {
    api.get(`/api/runs/${runId}`).then(r => setRunInfo(r.data)).catch(() => {})

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//${window.location.host}/ws`

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 0,
      onConnect: () => {
        client.subscribe(`/topic/run/${runId}`, (msg) => {
          const d = JSON.parse(msg.body)
          setStats({ requestsSent: d.requestsSent, successCount: d.successCount, failCount: d.failCount, successRate: d.successRate, avgResponseTime: d.avgResponseTime, requestsInWindow: d.requestsInWindow, activeUsers: d.activeUsers, status: d.status })
          setChartData(prev => [...prev, { t: d.second, rt: d.avgResponseTime ?? 0, rps: d.requestsInWindow ?? 0, sr: d.successRate ?? 100 }].slice(-60))
          if (d.status === 'COMPLETED' || d.status === 'FAILED') {
            clearInterval(timerRef.current)
            client.deactivate()
          }
        })
      }
    })
    client.activate()
    clientRef.current = client

    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000)

    return () => { client.deactivate(); clearInterval(timerRef.current) }
  }, [runId])

  const isComplete = stats.status === 'COMPLETED' || stats.status === 'FAILED'
  const isRunning = stats.status === 'RUNNING'

  return (
    <Layout>
      <div className="runner-page">
        <div className="runner-header">
          <div>
            <div className="runner-breadcrumb">
              <button className="runner-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
              <span>/</span>
              <span>Live run #{runId}</span>
            </div>
            <h1 className="page-title">{runInfo?.configName ?? 'Loading…'}</h1>
          </div>
          <div className="runner-header-right">
            {!isComplete && (
              <button className="btn-stop" onClick={handleStop} disabled={stopping}>
                {stopping ? (
                  <span className="btn-spinner btn-spinner--dark" style={{ marginRight: 0 }} />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                )}
                Stop Test
              </button>
            )}
            <div className={`run-status-badge run-status-badge--${stats.status.toLowerCase()}`}>
              {isRunning && <span className="pulse-dot" />}
              {STATUS_LABEL[stats.status]}
            </div>
            <span className="elapsed-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {elapsed}s
            </span>
          </div>
        </div>

        <div className="runner-stats">
          {[
            { label: 'Requests sent', value: stats.requestsSent.toLocaleString(), color: 'neutral' },
            { label: 'Success rate', value: `${stats.successRate}%`, color: stats.successRate >= 95 ? 'green' : stats.successRate >= 80 ? 'amber' : 'red' },
            { label: 'Avg response time', value: `${stats.avgResponseTime}ms`, color: stats.avgResponseTime < 500 ? 'green' : stats.avgResponseTime < 2000 ? 'amber' : 'red' },
            { label: 'Req / sec', value: stats.requestsInWindow.toLocaleString(), color: 'blue' },
            { label: 'Active users', value: stats.activeUsers.toLocaleString(), color: 'neutral' },
            { label: 'Failures', value: stats.failCount.toLocaleString(), color: stats.failCount > 0 ? 'red' : 'neutral' }
          ].map(s => (
            <div key={s.label} className="runner-stat">
              <span className="runner-stat__label">{s.label}</span>
              <span className={`runner-stat__value runner-stat__value--${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <p className="chart-card__title">Response time (ms)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B6EF3" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1B6EF3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFDA" vertical={false}/>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}s`}/>
                <YAxis tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}ms`}/>
                <Tooltip content={<ChartTooltip unit="ms" />} />
                <Area type="monotone" dataKey="rt" stroke="#1B6EF3" strokeWidth={2} fill="url(#rtGrad)" dot={false} isAnimationActive={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <p className="chart-card__title">Requests / second</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFDA" vertical={false}/>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}s`}/>
                <YAxis tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false}/>
                <Tooltip content={<ChartTooltip unit=" req" />} />
                <Bar dataKey="rps" fill="#7C3AED" radius={[2, 2, 0, 0]} isAnimationActive={false} maxBarSize={20}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <p className="chart-card__title">Success rate (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="srGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFDA" vertical={false}/>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}s`}/>
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#A8A6A0' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/>
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Area type="monotone" dataKey="sr" stroke="#059669" strokeWidth={2} fill="url(#srGrad)" dot={false} isAnimationActive={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {isComplete && (
          <div className={`complete-banner complete-banner--${stats.status.toLowerCase()}`}>
            <span className="complete-banner__icon">{stats.status === 'COMPLETED' ? '✅' : '❌'}</span>
            <div>
              <p className="complete-banner__title">{stats.status === 'COMPLETED' ? 'Test complete' : 'Test failed'}</p>
              <p className="complete-banner__sub">{stats.requestsSent.toLocaleString()} requests · {stats.successRate}% success · avg {stats.avgResponseTime}ms</p>
            </div>
            {stats.status === 'COMPLETED' && (
              <button className="btn-primary-sm" onClick={() => navigate(`/results/${runId}`)}>
                View full results →
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
