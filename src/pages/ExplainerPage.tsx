import { Link } from 'react-router-dom'
import { ISSUES } from '../data/mockData'
import { TriageContent } from '../components/dashboard/TriageDashboard'
import { TrendChart } from '../components/shared/TrendChart'
import { Shield, Trend, Search, Bolt, Arrow, Doc, User, Bars } from '../lib/icons'

const SEV_NAME: Record<string, [string, string]> = {
  critical: ['CRITICAL', 'c'], high: ['Warning', 'w'], medium: ['Info', 'i'],
}

function RiskTable() {
  return (
    <table className="rtbl">
      <thead><tr><th>Score</th><th>Event</th><th>Severity</th><th>Deviation</th><th>Action</th></tr></thead>
      <tbody>
        {ISSUES.slice(0, 4).map((it) => {
          const hi = it.score >= 70
          const [name, cls] = SEV_NAME[it.severity]
          return (
            <tr key={it.id} className={hi ? 'hi' : ''}>
              <td><span className={`sc${hi ? ' red' : ''}`}>{it.score}</span></td>
              <td className="ev2">{it.title}</td>
              <td><span className={`sevb ${cls}`}>{name}</span></td>
              <td className="dev">{it.deviation}</td>
              <td className="tact"><a>Escalate</a><span className="sepd">·</span><a className="ig">Ignore</a></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const PROMPT = `Light-theme cloud-security triage dashboard for an on-call analyst. Deep navy headings, teal accent, amber thresholds, crimson criticals, rounded bold typography, generous whitespace. Three layers: (1) KPI cards — System Health %, Open Critical, Detected-vs-Resolved backlog, MTTR; (2) a macro trend chart of detected vs resolved with a faded week-over-week baseline and amber-tinted regions wherever the trend crosses a 20% change threshold; (3) a risk-scored anomaly queue ranking incidents 0–100 (severity × behavioral deviation × asset criticality × exposure), grouping duplicate alerts, with MITRE tags, crimson CRITICAL badges, and inline Escalate / Ignore. Support filtering, grouping, multi-select bulk actions, and "needs attention" vs "acted" flags. Every component answers one user question; summary first, raw evidence on drill-down.`

export function ExplainerPage() {
  return (
    <div className="deck">
      <div className="deck-top">
        <div className="brand"><span className="bm"><Shield /></span>Northstar</div>
        <Link to="/dashboard" className="launch">Open the live product <Arrow /></Link>
      </div>

      {/* INTRO */}
      <section className="step" style={{ marginBottom: 54 }}>
        <span className="badge navy">Product Mission</span>
        <h2 style={{ fontSize: 44, maxWidth: 840 }}>Built around the questions three users actually ask</h2>
        <p className="lead">The challenge was never too little data — it's knowing <b>what matters right now</b>. Every screen below is designed to answer a specific user's question and move them from <span className="t">Understand → Decide → Act</span>.</p>
        <div className="personas">
          <div className="persona primary">
            <span className="tagp">Primary</span>
            <div className="pi"><Shield /></div>
            <div className="pp">On-call</div><div className="pr">Security / Ops Analyst</div>
            <div className="pq">“What should I investigate first — and is this real or normal?”</div>
          </div>
          <div className="persona">
            <div className="pi"><User /></div>
            <div className="pp">Owns a service</div><div className="pr">Service Owner / Engineer</div>
            <div className="pq">“Is my service the cause? Did my deploy do this — and did my fix work?”</div>
          </div>
          <div className="persona">
            <div className="pi"><Bars /></div>
            <div className="pp">Supervises</div><div className="pr">Security / Ops Team Lead</div>
            <div className="pq">“Are we improving or deteriorating? Where do I put resources?”</div>
          </div>
        </div>
      </section>

      {/* STEP 1 */}
      <section className="step">
        <span className="badge"><Trend /> Step 1 — Understand</span>
        <h2>Spotting Deviations in the Macro Trend</h2>
        <div className="uq"><span className="qm">“</span><span className="q">Are conditions improving or deteriorating, and is the unresolved backlog growing?</span><span className="who">Analyst · Team Lead</span></div>
        <p className="lead">Raw numbers without context create noise. A <b>week-over-week baseline</b> with an automated <span className="t">20% change threshold</span> flags unexpected shifts — so teams see the <b>signal before the crisis</b>.</p>
        <div className="row">
          <TrendChart />
          <div className="anno">
            <div className="note"><h3>Baseline</h3><p>A faded reference line shows the expected range — so the <b>analyst</b> sees a deviation instantly, without interpreting a single raw number.</p></div>
            <div className="note mint"><h3>Amber Threshold</h3><p>Crossing 20% over baseline tints the region amber and answers the <b>team lead's</b> question — “is this change <i>significant</i>?”</p></div>
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section className="step">
        <span className="badge"><Search /> Step 2 — Decide</span>
        <h2>Isolating the Incident at the Micro Level</h2>
        <div className="uq"><span className="qm">“</span><span className="q">Which of these issues do I handle first — and why does it matter more than the others?</span><span className="who">On-call Analyst</span></div>
        <p className="lead">Don't force users to dig through endless logs. An automated <b>Risk Score (0–100)</b> combines action severity with <span className="t">behavioral deviation</span>. Identical repeating alerts are grouped to eliminate noise.</p>
        <div className="row">
          <div className="exp-panel"><RiskTable /></div>
          <div className="anno">
            <div className="note mint"><h3>Risk Score Formula</h3><p>Answers the analyst's “<b>why this one first?</b>” — severity × behavioral deviation × asset criticality × exposure. Rows ≥ 70 get a crimson CRITICAL badge.</p></div>
            <div className="note mint"><h3>Alert Grouping</h3><p>So the analyst isn't desensitized: identical alerts collapse into one row — 42 low-risk events suppressed, 17 duplicates deduped.</p></div>
          </div>
        </div>
      </section>

      {/* STEP 3 */}
      <section className="step">
        <span className="badge"><Bolt /> Step 3 — Act</span>
        <h2>The Dashboard That Drives Immediate Action</h2>
        <div className="uq"><span className="qm">“</span><span className="q">What do I do next — and can I act, escalate, and verify without losing context?</span><span className="who">Analyst · Engineer</span></div>
        <p className="lead">Synthesize trend and anomaly into a <b>single workspace</b> — the trend explains <i>when</i>, the queue explains <i>what</i>. Decide and act within <span className="t">10 seconds</span>.</p>
        <div className="row">
          <div className="exp-panel">
            <div className="layers">
              <div className="lyr"><span className="lyrtag">Layer 1</span><div className="lyrbox"><div className="kpis">
                <div className="kpi"><div className="l">System Health</div><div className="v t num">94%</div></div>
                <div className="kpi"><div className="l">Open Critical</div><div className="v r num">3</div></div>
                <div className="kpi"><div className="l">MTTR</div><div className="v n num">2h 41m</div></div>
              </div></div></div>
              <div className="lyr"><span className="lyrtag">Layer 2</span><div className="lyrbox">
                <div className="lt">Macro Trend · detected vs resolved + baseline + threshold</div>
                <svg viewBox="0 0 560 90" style={{ width: '100%' }}>
                  <polyline className="base" points="20,60 150,50 290,38 420,36 540,40" />
                  <polyline fill="none" stroke="#1BA88A" strokeWidth="2.5" points="20,70 150,58 290,46 420,36 540,42" />
                  <polyline fill="none" stroke="#0E6E5A" strokeWidth="2.5" points="20,66 150,54 290,18 420,40 540,46" />
                  <rect x="250" y="6" width="90" height="80" fill="#F6C66B" opacity=".2" rx="4" />
                </svg>
              </div></div>
              <div className="lyr"><span className="lyrtag">Layer 3</span><div className="lyrbox"><div className="lt">Prioritized Anomaly Queue — risk-scored, grouped, inline Escalate / Ignore</div></div></div>
            </div>
          </div>
          <div className="anno">
            <div className="arrow-item"><span className="ar"><Arrow /></span><div><h3>Top: KPI Cards</h3><p>The 10-second answer — health, open critical, backlog, MTTR.</p></div></div>
            <div className="arrow-item"><span className="ar"><Arrow /></span><div><h3>Middle: Macro Chart</h3><p>Dual line with WoW baseline and amber threshold highlights.</p></div></div>
            <div className="arrow-item"><span className="ar"><Arrow /></span><div><h3>Bottom: Anomaly Queue</h3><p>Risk-scored rows with inline Escalate (score ≥70) and Ignore.</p></div></div>
            <div className="prompt"><div className="ptt"><Doc /> GenAI Design Prompt</div><code>{PROMPT}</code></div>
          </div>
        </div>
      </section>

      {/* EMBED */}
      <div className="kicker"><span className="badge">▼ Live interactive dashboard</span></div>
      <div className="embed"><TriageContent /></div>
    </div>
  )
}
