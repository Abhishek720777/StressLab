import Layout from '../components/Layout.jsx'
import '../styles/Docs.css'

export default function Docs() {
  return (
    <Layout>
      <div className="docs-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Documentation & Help Guide</h1>
            <p className="page-sub">Learn how to analyze system bottlenecks, bypass auth gates, and interpret stress-test telemetry.</p>
          </div>
        </div>

        <div className="docs-grid">
          
          {/* SECTION 1: INTRODUCTION */}
          <div className="docs-section">
            <h2 className="docs-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              What is StressLab?
            </h2>
            <p className="docs-p">
              StressLab is a full-stack, real-time stress testing harness. It allows developers to point a fixed pool of <strong>Virtual Users</strong> at any public or private HTTP endpoint, execute sequential load spikes, and witness their system's performance boundaries, error ceilings, and latency bottlenecks stream live in high-fidelity dashboards.
            </p>
            <p className="docs-p">
              Unlike static benchmarking tools, StressLab operates on a deterministic thread loop model. Rather than overwhelming your client CPU, it uses fixed executors that precisely simulate real users making requests in sequences, preventing memory heap exhaustion on both sides.
            </p>
          </div>

          {/* SECTION 2: HOW TO RUN A TEST */}
          <div className="docs-section">
            <h2 className="docs-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Setting Up Your First Load Test
            </h2>
            <p className="docs-p">
              To profile your web service accurately, go to the <strong>New Test</strong> page and configure your test parameters carefully:
            </p>
            <div className="docs-steps">
              <div className="docs-step">
                <div className="docs-step__num">1</div>
                <div className="docs-step__content">
                  <div className="docs-step__title">Target URL & Method</div>
                  <p className="docs-p">Point it at a backend API endpoint that interacts with your database (e.g. <code className="docs-badge docs-badge--get">GET</code> <code>/api/analytics</code>). <em>Avoid testing static pages (like Vercel index pages) since a CDN will serve them instantly and show you nothing about your backend limits.</em></p>
                </div>
              </div>
              <div className="docs-step">
                <div className="docs-step__num">2</div>
                <div className="docs-step__content">
                  <div className="docs-step__title">Concurrent Users & Total Requests</div>
                  <p className="docs-p"><strong>Concurrent Users</strong> is your parallel thread pool size (virtual users). <strong>Total Requests</strong> is the exact number of requests those users will pull from a thread-safe stack until finished.</p>
                </div>
              </div>
              <div className="docs-step">
                <div className="docs-step__num">3</div>
                <div className="docs-step__content">
                  <div className="docs-step__title">Ramp-Up Seconds (Gradual Start)</div>
                  <p className="docs-p">Set this to stagger virtual user startup. For example, if you set <strong>100 users</strong> with <strong>20s ramp-up</strong>, 5 new users will start every second. This gradually accelerates the load, showing you the exact concurrency level at which database query latency begins to spike or requests begin to fail.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BYPASSING AUTHENTICATION GATES */}
          <div className="docs-section">
            <h2 className="docs-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Bypassing Authentication (JWT & Cookies)
            </h2>
            <p className="docs-p">
              If the Render API endpoint you are stress-testing requires a logged-in session, unauthenticated requests will immediately fail with <code>401 Unauthorized</code> status codes. You can easily bypass this by passing credentials in custom headers:
            </p>

            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginTop: '20px', marginBottom: '8px' }}>
              Scenario A: Standard Bearer Token (JWT in Authorization)
            </h3>
            <p className="docs-p">
              Log into your app, open browser DevTools, copy your JWT token from LocalStorage, and add this header in StressLab:
            </p>
            <div className="docs-code-block">
              Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginTop: '20px', marginBottom: '8px' }}>
              Scenario B: Secure Cookies (<span className="docs-badge docs-badge--cookie">HttpOnly Cookie</span>)
            </h3>
            <p className="docs-p">
              If your backend stores sessions in secure, HttpOnly cookies, your frontend JS can't read them, but you can copy them from your browser's cookie jar to StressLab!
            </p>
            <div className="docs-steps" style={{ margin: '14px 0' }}>
              <div className="docs-step">
                <div className="docs-step__num">A</div>
                <div className="docs-step__content">
                  <p className="docs-p">Log into your target website, press <strong>F12</strong>, navigate to the <strong>Application/Storage</strong> tab, expand the <strong>Cookies</strong> category, select the domain, and copy the cookie's Value.</p>
                </div>
              </div>
              <div className="docs-step">
                <div className="docs-step__num">B</div>
                <div className="docs-step__content">
                  <p className="docs-p">Add a <strong>Cookie</strong> header in your StressLab config:</p>
                  <div className="docs-code-block" style={{ margin: '8px 0' }}>
                    Cookie: token=eyJhbGciOiJIUzI1NiJ9...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: INTERPRETING METRICS */}
          <div className="docs-section">
            <h2 className="docs-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Interpreting Your Results
            </h2>
            <p className="docs-p">
              When a load test finishes, StressLab presents a detailed telemetry suite. Here is how to translate the terminology:
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Description</th>
                  <th>Why it matters</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Average Latency</strong></td>
                  <td>The arithmetic mean response time across all successful requests.</td>
                  <td>Gives you the overall normal speed experience of your server.</td>
                </tr>
                <tr>
                  <td><strong>95th Percentile (p95)</strong></td>
                  <td>The speed boundary beneath which 95% of your requests fall.</td>
                  <td>Shows what the slowest 5% of users experienced. Highly indicative of mild database lock bottlenecks.</td>
                </tr>
                <tr>
                  <td><strong>99th Percentile (p99)</strong></td>
                  <td>The speed boundary beneath which 99% of your requests fall.</td>
                  <td>Shows the worst 1% "edge cases". High p99 scores often point to garbage collection pauses or thread starvation.</td>
                </tr>
                <tr>
                  <td><strong>RPS / Throughput</strong></td>
                  <td>The amount of requests successfully processed per second.</td>
                  <td>Measures the ultimate volume your network card and CPU thread pool can sustain.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 5: CLOUD DEPLOYMENTS */}
          <div className="docs-section">
            <h2 className="docs-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
              Cloud Platform Behaviors: Render vs. AWS
            </h2>
            <p className="docs-p">
              Depending on where your backend is hosted, you will observe distinct behaviors under heavy load:
            </p>
            <p className="docs-p">
              <strong>Render (Free/Hobby Tier):</strong> Free containers go to sleep after 15 minutes of inactivity. When you hit them, they take up to 50 seconds to wake up (spin-up delay). If you start a test immediately, your requests might initially time out. Always wake the server up first by visiting the endpoint in your browser. Render also has strict database connection limits, which quickly trigger HTTP 500 errors once concurrency crosses your pool limits.
            </p>
            <p className="docs-p">
              <strong>AWS (EC2 / ECS / Elastic Beanstalk):</strong>
            </p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', color: 'var(--text-2)', fontSize: '14.5px', lineHeight: '1.7', marginBottom: '16px' }}>
              <li><strong>Auto-Scaling Rules:</strong> Under prolonged heavy load, you might see response times spike initially, then drop back down. This proves your AWS Auto-Scaling Group detected the CPU spike, spun up additional server instances, and the Application Load Balancer successfully distributed the load.</li>
              <li><strong>Load Balancer Timeouts:</strong> If your database queries take longer than your AWS Application Load Balancer's timeout (default 60s), the ALB will abort the connection and return a <code>504 Gateway Timeout</code>.</li>
              <li><strong>Database Ceilings (RDS):</strong> Even if your server instances scale up to 10 nodes, they all communicate with the same RDS database. If the DB is unindexed, you will watch average latencies climb uniformly across all nodes.</li>
            </ul>
          </div>

        </div>
      </div>
    </Layout>
  )
}
