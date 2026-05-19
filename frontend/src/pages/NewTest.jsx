import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import '../styles/NewTest.css'

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

const DEFAULTS = {
  name: '', targetUrl: '', httpMethod: 'GET',
  requestHeaders: '', requestBody: '',
  concurrentUsers: 10, totalRequests: 100, rampUpSeconds: 0
}

export default function NewTest() {
  const [form, setForm] = useState(DEFAULTS)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await api.post('/api/tests', form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save config')
    } finally { setSaving(false) }
  }

  const handleSaveAndRun = async () => {
    setRunning(true); setError('')
    try {
      const cfg = await api.post('/api/tests', form)
      const run = await api.post(`/api/tests/${cfg.data.id}/run`)
      navigate(`/run/${run.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start test')
      setRunning(false)
    }
  }

  const showBody = ['POST', 'PUT', 'PATCH'].includes(form.httpMethod)

  return (
    <Layout>
      <div className="new-test-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">New test</h1>
            <p className="page-sub">Configure your load test parameters</p>
          </div>
        </div>

        {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="nt-grid">
          <div className="nt-card">
            <h2 className="nt-card__title">Target</h2>

            <div className="nt-field">
              <label className="nt-label">Test name</label>
              <input className="nt-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Login endpoint stress test" />
            </div>

            <div className="nt-field">
              <label className="nt-label">Target URL</label>
              <div className="url-row">
                <select className="method-select" value={form.httpMethod} onChange={e => set('httpMethod', e.target.value)}>
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
                <input className="nt-input url-input" value={form.targetUrl} onChange={e => set('targetUrl', e.target.value)} placeholder="https://your-api.com/endpoint" />
              </div>
            </div>

            <div className="nt-field">
              <label className="nt-label">Request headers <span className="nt-hint">(JSON format, optional)</span></label>
              <textarea
                className="nt-textarea nt-mono"
                rows={3}
                value={form.requestHeaders}
                onChange={e => set('requestHeaders', e.target.value)}
                placeholder={'{\n  "Authorization": "Bearer token"\n}'}
              />
            </div>

            {showBody && (
              <div className="nt-field">
                <label className="nt-label">Request body <span className="nt-hint">(JSON)</span></label>
                <textarea
                  className="nt-textarea nt-mono"
                  rows={4}
                  value={form.requestBody}
                  onChange={e => set('requestBody', e.target.value)}
                  placeholder={'{\n  "key": "value"\n}'}
                />
              </div>
            )}
          </div>

          <div className="nt-right">
            <div className="nt-card">
              <h2 className="nt-card__title">Load parameters</h2>

              <div className="nt-field">
                <label className="nt-label">Concurrent users</label>
                <div className="slider-wrap">
                  <input type="range" className="slider" min="1" max="1000" value={form.concurrentUsers} onChange={e => set('concurrentUsers', +e.target.value)} />
                  <input type="number" className="nt-input num-input" min="1" max="1000" value={form.concurrentUsers} onChange={e => set('concurrentUsers', +e.target.value)} />
                </div>
                <p className="nt-hint-text">{form.concurrentUsers} simultaneous connections</p>
              </div>

              <div className="nt-field">
                <label className="nt-label">Total requests</label>
                <div className="slider-wrap">
                  <input type="range" className="slider" min="1" max="100000" step="100" value={form.totalRequests} onChange={e => set('totalRequests', +e.target.value)} />
                  <input type="number" className="nt-input num-input" min="1" max="100000" value={form.totalRequests} onChange={e => set('totalRequests', +e.target.value)} />
                </div>
                <p className="nt-hint-text">{form.totalRequests.toLocaleString()} total HTTP requests</p>
              </div>

              <div className="nt-field">
                <label className="nt-label">Ramp-up seconds <span className="nt-hint">(0 = instant)</span></label>
                <div className="slider-wrap">
                  <input type="range" className="slider" min="0" max="300" value={form.rampUpSeconds} onChange={e => set('rampUpSeconds', +e.target.value)} />
                  <input type="number" className="nt-input num-input" min="0" max="300" value={form.rampUpSeconds} onChange={e => set('rampUpSeconds', +e.target.value)} />
                </div>
                <p className="nt-hint-text">{form.rampUpSeconds === 0 ? 'All users start immediately' : `Users ramp up over ${form.rampUpSeconds}s`}</p>
              </div>
            </div>

            <div className="nt-summary">
              <p className="nt-summary__label">Estimated duration</p>
              <p className="nt-summary__value">
                ~{Math.ceil(form.totalRequests / form.concurrentUsers / 10)}–{Math.ceil(form.totalRequests / form.concurrentUsers / 2)}s
              </p>
            </div>

            <div className="nt-actions">
              <button className="btn-secondary" onClick={handleSave} disabled={saving || running}>
                {saving ? <span className="btn-spinner" /> : 'Save only'}
              </button>
              <button className="btn-primary-lg" onClick={handleSaveAndRun} disabled={saving || running}>
                {running ? <span className="btn-spinner" /> : (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Save &amp; Run</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
