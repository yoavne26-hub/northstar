import './cve-page.css'
import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import {
  CVE_VOLUME,
  HIGH_CRIT_SHARE,
  BACKLOG,
  MONEY_POINTS,
  TOP_CVES,
  CVE_STATS,
  RES24_COLOR,
} from '../data/cve'
import type { YearCount, YearShare, BacklogYear, MoneyPoint } from '../data/cve'

// --- 6) Top CVEs table, sortable — incl. RES-24 (runtime-contextual 24h score)
type CveSort = 'res24' | 'cvss' | 'epss'
function TopCvesTable(): JSX.Element {
  const [sort, setSort] = useState<CveSort>('res24')
  const rows = [...TOP_CVES].sort((a, b) =>
    sort === 'res24' ? b.res24 - a.res24 : sort === 'cvss' ? b.cvss - a.cvss : b.epss - a.epss)
  const opts: [CveSort, string][] = [['res24', 'RES-24'], ['cvss', 'CVSS'], ['epss', 'EPSS']]
  return (
    <>
      <div className="cve-sortbar">
        <span className="cve-sortlbl">Sort by</span>
        {opts.map(([k, l]) => (
          <button key={k} className={`cve-sortbtn${sort === k ? ' on' : ''}`} onClick={() => setSort(k)}>{l}</button>
        ))}
      </div>
      <table className="cve-table">
        <thead>
          <tr>
            <th>CVE</th><th>Product</th><th className="cve-r">CVSS</th><th className="cve-r">EPSS</th>
            <th>KEV</th><th>Runtime</th><th className="cve-r">RES-24</th><th>Verdict</th><th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cve}>
              <td><span className="cve-id">{row.cve}</span></td>
              <td><span className="cve-prod">{row.product}</span></td>
              <td className="cve-r num">{row.cvss.toFixed(1)}</td>
              <td className="cve-r num">{row.epss.toFixed(2)}</td>
              <td><span className={`cve-badge ${row.kev ? 'kev' : 'off'}`}>{row.kev ? 'KEV' : '—'}</span></td>
              <td><span className={`cve-badge ${row.runtime ? 'runtime' : 'off'}`}>{row.runtime ? 'Running' : 'Absent'}</span></td>
              <td className="cve-r"><span className="cve-res24 num" style={{ color: RES24_COLOR[row.verdict] }}>{row.res24}</span></td>
              <td><span className="cve-verdict" style={{ color: RES24_COLOR[row.verdict], borderColor: `${RES24_COLOR[row.verdict]}55`, background: `${RES24_COLOR[row.verdict]}14` }}>{row.verdict}</span></td>
              <td className="cve-note">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

// --- 2) The Flood — CVE volume by year + ghost forecast bar -------------------
function FloodChart({ data, forecast }: { data: YearCount[]; forecast: number }): JSX.Element {
  const W = 640
  const H = 240
  const padL = 44
  const padR = 14
  const padT = 16
  const padB = 34
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const slots = data.length + 1 // + forecast slot
  const max = Math.max(forecast, ...data.map((d) => d.count))
  const slot = innerW / slots
  const bw = slot * 0.56

  const ticks = 4
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => padT + (i / ticks) * innerH)

  const barX = (i: number): number => padL + i * slot + (slot - bw) / 2
  const barH = (v: number): number => (v / max) * innerH

  return (
    <svg className="cve-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="CVE publication volume by year with 2026 forecast">
      {gridY.map((gy, i) => (
        <line key={i} className="cve-grid-line" x1={padL} y1={gy} x2={padL + innerW} y2={gy} />
      ))}
      {[0, 0.5, 1].map((f, i) => (
        <text key={i} className="cve-axis-label" x={padL - 8} y={padT + innerH - f * innerH + 3} textAnchor="end">
          {Math.round((max * f) / 1000)}k
        </text>
      ))}
      {data.map((d, i) => {
        const h = barH(d.count)
        const x = barX(i)
        const y = padT + innerH - h
        return (
          <g key={d.year}>
            <rect className="cve-bar" x={x} y={y} width={bw} height={h} rx={3} />
            <text className="cve-axis-label" x={x + bw / 2} y={H - 12} textAnchor="middle">
              {d.year}
            </text>
          </g>
        )
      })}
      {(() => {
        const i = data.length
        const h = barH(forecast)
        const x = barX(i)
        const y = padT + innerH - h
        return (
          <g>
            <rect className="cve-bar-forecast" x={x} y={y} width={bw} height={h} rx={3} />
            <text className="cve-val-cap" x={x + bw / 2} y={y - 6} textAnchor="middle">
              {Math.round(forecast / 1000)}k
            </text>
            <text className="cve-axis-label" x={x + bw / 2} y={H - 12} textAnchor="middle">
              2026 (forecast)
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

// --- 3) It's accelerating — rising High+Critical share line -------------------
function ShareLineChart({ data }: { data: YearShare[] }): JSX.Element {
  const W = 640
  const H = 220
  const padL = 40
  const padR = 50
  const padT = 16
  const padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const minYear = data[0].year
  const maxYear = data[data.length - 1].year
  const yearSpan = Math.max(1, maxYear - minYear)

  const x = (year: number): number => padL + ((year - minYear) / yearSpan) * innerW
  const y = (pct: number): number => padT + innerH - (pct / 100) * innerH // 0–100% axis

  const linePts = data.map((d) => `${x(d.year)},${y(d.pct)}`).join(' ')
  const areaPts = `${x(minYear)},${padT + innerH} ${linePts} ${x(maxYear)},${padT + innerH}`

  const last = data[data.length - 1]
  const gridPct = [0, 25, 50, 75, 100]

  return (
    <svg className="cve-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="High and Critical share of CVEs over time">
      {gridPct.map((p) => (
        <g key={p}>
          <line className="cve-grid-line" x1={padL} y1={y(p)} x2={padL + innerW} y2={y(p)} />
          <text className="cve-axis-label" x={padL - 8} y={y(p) + 3} textAnchor="end">
            {p}%
          </text>
        </g>
      ))}
      <polygon className="cve-area" points={areaPts} />
      <polyline className="cve-line" points={linePts} />
      {data.map((d) => (
        <g key={d.year}>
          <circle className="cve-dot" cx={x(d.year)} cy={y(d.pct)} r={3.6} />
          <text className="cve-axis-label" x={x(d.year)} y={H - 10} textAnchor="middle">
            {d.year}
          </text>
        </g>
      ))}
      {/* annotate latest value */}
      <circle className="cve-annot-dot" cx={x(last.year)} cy={y(last.pct)} r={4.2} />
      <text className="cve-annot" x={x(last.year) + 8} y={y(last.pct) - 6} textAnchor="start">
        {last.pct}%
      </text>
    </svg>
  )
}

// --- 4) The money chart — CVSS × EPSS scatter, colored by KEV -----------------
function MoneyScatter({ points, exploitedPct }: { points: MoneyPoint[]; exploitedPct: number }): JSX.Element {
  const W = 640
  const H = 320
  const padL = 50
  const padR = 16
  const padT = 16
  const padB = 44
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const x = (cvss: number): number => padL + (cvss / 10) * innerW // 0–10
  const y = (epss: number): number => padT + innerH - epss * innerH // 0–1

  const xTicks = [0, 2, 4, 6, 8, 10]
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  // draw non-KEV first so crimson KEV points sit on top
  const low = points.filter((p) => !p.kev)
  const kev = points.filter((p) => p.kev)

  return (
    <>
      <svg className="cve-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="CVSS severity versus EPSS exploit probability scatter, colored by KEV">
        {yTicks.map((t) => (
          <g key={t}>
            <line className="cve-grid-line" x1={padL} y1={y(t)} x2={padL + innerW} y2={y(t)} />
            <text className="cve-axis-label" x={padL - 8} y={y(t) + 3} textAnchor="end">
              {t.toFixed(2)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} className="cve-axis-label" x={x(t)} y={padT + innerH + 16} textAnchor="middle">
            {t}
          </text>
        ))}
        {/* axes */}
        <line className="cve-axis-line" x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} />
        <line className="cve-axis-line" x1={padL} y1={padT} x2={padL} y2={padT + innerH} />

        {/* faint vertical "Critical" line at CVSS = 9 */}
        <line className="cve-crit-line" x1={x(9)} y1={padT} x2={x(9)} y2={padT + innerH} />
        <text className="cve-crit-label" x={x(9) + 4} y={padT + 12} textAnchor="start">
          Critical (CVSS 9+)
        </text>

        {low.map((p) => (
          <circle key={p.id} className="cve-pt-low" cx={x(p.cvss)} cy={y(p.epss)} r={3} />
        ))}
        {kev.map((p) => (
          <circle key={p.id} className="cve-pt-kev" cx={x(p.cvss)} cy={y(p.epss)} r={5.5} />
        ))}

        {/* axis titles */}
        <text className="cve-axis-title" x={padL + innerW / 2} y={H - 6} textAnchor="middle">
          CVSS severity (0–10)
        </text>
        <text
          className="cve-axis-title"
          x={14}
          y={padT + innerH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${padT + innerH / 2})`}
        >
          EPSS exploit probability (0–1)
        </text>
      </svg>
      <div className="cve-legend">
        <span className="cve-legend-row">
          <span className="cve-legend-sw" style={{ background: 'var(--crit)' }} />
          On CISA KEV — actually exploited
        </span>
        <span className="cve-legend-row">
          <span className="cve-legend-sw" style={{ background: 'var(--slate)', opacity: 0.5 }} />
          Not exploited
        </span>
      </div>
      <p className="cve-caption">
        Most high-CVSS CVEs cluster along the bottom: high severity, near-zero exploit probability. Only{' '}
        <span className="cve-em">~{exploitedPct}%</span> of &ldquo;Critical&rdquo; CVEs are ever actually exploited.
        Severity is not the same thing as exploitability.
      </p>
    </>
  )
}

// --- 5) Scoring is breaking — stacked scored vs unscored bars -----------------
function BacklogChart({ data }: { data: BacklogYear[] }): JSX.Element {
  const W = 640
  const H = 240
  const padL = 44
  const padR = 14
  const padT = 16
  const padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const max = Math.max(...data.map((d) => d.scored + d.unscored))
  const slot = innerW / data.length
  const bw = slot * 0.5

  const ticks = 4
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => padT + (i / ticks) * innerH)
  const h = (v: number): number => (v / max) * innerH

  return (
    <>
      <svg className="cve-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="NVD scoring backlog: scored versus unscored CVEs per year">
        {gridY.map((gy, i) => (
          <line key={i} className="cve-grid-line" x1={padL} y1={gy} x2={padL + innerW} y2={gy} />
        ))}
        {[0, 0.5, 1].map((f, i) => (
          <text key={i} className="cve-axis-label" x={padL - 8} y={padT + innerH - f * innerH + 3} textAnchor="end">
            {Math.round((max * f) / 1000)}k
          </text>
        ))}
        {data.map((d, i) => {
          const x = padL + i * slot + (slot - bw) / 2
          const hScored = h(d.scored)
          const hUnscored = h(d.unscored)
          const yScored = padT + innerH - hScored
          const yUnscored = yScored - hUnscored
          return (
            <g key={d.year}>
              <rect className="cve-bar-scored" x={x} y={yScored} width={bw} height={hScored} />
              <rect className="cve-bar-unscored" x={x} y={yUnscored} width={bw} height={hUnscored} rx={2} />
              <text className="cve-axis-label" x={x + bw / 2} y={H - 10} textAnchor="middle">
                {d.year}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="cve-legend">
        <span className="cve-legend-row">
          <span className="cve-legend-sw" style={{ background: 'var(--teal)' }} />
          Scored / enriched
        </span>
        <span className="cve-legend-row">
          <span className="cve-legend-sw" style={{ background: 'var(--amber)' }} />
          Unscored backlog
        </span>
      </div>
    </>
  )
}

export function CveTrendsPage(): JSX.Element {
  const latestShare = HIGH_CRIT_SHARE[HIGH_CRIT_SHARE.length - 1].pct

  const tiles: { label: string; value: number; tone: string; sub: string }[] = [
    { label: 'Total CVEs', value: CVE_STATS.total, tone: 'n', sub: 'published all-time' },
    { label: 'Published this year', value: CVE_STATS.thisYear, tone: 'r', sub: `${latestShare}% High/Critical` },
    { label: '~ Per day', value: CVE_STATS.perDay, tone: 'a', sub: 'new CVEs, every day' },
    { label: 'Forecast next year', value: CVE_STATS.forecastNextYear, tone: 'r', sub: '2026 projection' },
  ]

  return (
    <AppShell title="CVE Trends" crumb="Northstar · The prioritization crisis">
      <div className="content">
        <p className="cve-intro">
          There are <strong>far more CVEs than any team can patch</strong>. CVSS severity over-flags, only a sliver of
          &ldquo;critical&rdquo; CVEs are ever actually exploited, and NVD scoring is falling behind. The fix is not more
          patching — it is <strong>runtime-aware prioritization</strong>.
        </p>

        {/* 1. Stat tiles */}
        <div className="kstrip">
          {tiles.map((t) => (
            <div className="kc" key={t.label}>
              <div className="kl">{t.label}</div>
              <div className={`kv ${t.tone}`}>
                <span className="num">{t.value.toLocaleString()}</span>
              </div>
              <div className="ks">{t.sub}</div>
            </div>
          ))}
        </div>

        <div className="cve-stack">
          {/* 2. The Flood */}
          <div className="panel">
            <div className="ph">
              <div className="t">The Flood</div>
              <div className="s">CVE publication volume, 2016–2025</div>
            </div>
            <p className="cve-frame">Disclosed CVEs keep climbing — and 2026 is projected higher still. You cannot patch your way out of this.</p>
            <FloodChart data={CVE_VOLUME} forecast={CVE_STATS.forecastNextYear} />
          </div>

          {/* 3. It's accelerating */}
          <div className="panel">
            <div className="ph">
              <div className="t">It&rsquo;s accelerating</div>
              <div className="s">High + Critical share of all CVEs</div>
            </div>
            <p className="cve-frame">
              The share rated High or Critical keeps rising — now <span className="cve-em">{latestShare}%</span>. If
              everything is &ldquo;critical,&rdquo; nothing is.
            </p>
            <ShareLineChart data={HIGH_CRIT_SHARE} />
          </div>

          {/* 4. The money chart */}
          <div className="panel">
            <div className="ph">
              <div className="t">Severity &ne; exploitability</div>
              <div className="s">CVSS &times; EPSS &mdash; the money chart</div>
            </div>
            <p className="cve-frame">
              Each dot is a CVE. <span className="cve-em">Crimson</span> dots are on the CISA KEV list — proven exploited
              in the wild. High severity rarely means high exploit probability.
            </p>
            <MoneyScatter points={MONEY_POINTS} exploitedPct={CVE_STATS.criticalExploited} />
          </div>

          {/* 5. Scoring is breaking */}
          <div className="panel">
            <div className="ph">
              <div className="t">Scoring is breaking</div>
              <div className="s">NVD enrichment backlog per year</div>
            </div>
            <p className="cve-frame">
              Since 2024 the unscored backlog has <span className="cve-em">exploded</span>. The data you would prioritize
              on is arriving late, or not at all.
            </p>
            <BacklogChart data={BACKLOG} />
          </div>

          {/* 6. So you need runtime → Northstar */}
          <div className="panel">
            <div className="ph">
              <div className="t">So you need runtime &rarr; Northstar</div>
              <div className="s">The few that actually matter</div>
            </div>
            <p className="cve-frame">
              <strong>RES-24</strong> fuses public signals (CVSS·EPSS·KEV) with <em>runtime context</em> — is the code
              running, internet-exposed, privileged, on an attack path? — into a single 24-hour verdict:
              <span className="cve-vk prioritize">PRIORITIZE</span> <span className="cve-vk monitor">MONITOR</span> <span className="cve-vk defer">DEFER</span>.
              Sort by RES-24 and watch scary CVEs that aren&rsquo;t <em>running</em> here drop to DEFER.
            </p>
            <TopCvesTable />
            <p className="cve-punch">
              CVSS tells you how bad a flaw <em>could</em> be. EPSS and KEV tell you how likely it is to be exploited.
              But only <strong>runtime context</strong> tells you whether the vulnerable code is actually loaded and
              reachable in <em>your</em> environment. <span className="cve-brand">Northstar</span> fuses all three into a
              single <strong>tunable risk score</strong> — so your team patches the handful that matter, not the tens of
              thousands that don&rsquo;t.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
