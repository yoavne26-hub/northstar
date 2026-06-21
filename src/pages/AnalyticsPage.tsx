import './analytics.css'
import { AppShell } from '../components/layout/AppShell'
import {
  ADMIN_KPIS,
  RISK_OVER_TIME,
  MTTR_TREND,
  DETECTIONS_BY_TACTIC,
  DETECTIONS_BY_ENV,
  SEVERITY_DIST,
  TEAM_PERFORMANCE,
} from '../data/analytics'
import type { SeriesPoint } from '../data/analytics'

const TONE_CLASS: Record<string, string> = {
  good: 't',
  critical: 'r',
  warning: 'a',
  neutral: 'n',
}

const ENV_COLORS = ['var(--teal)', 'var(--teal-ink)', 'var(--amber)', 'var(--slate)']

// --- Area / line chart (Fleet risk over 7 days) ------------------------------
function RiskAreaChart({ data }: { data: SeriesPoint[] }) {
  const W = 560
  const H = 200
  const padL = 34
  const padR = 12
  const padT = 14
  const padB = 26
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const span = Math.max(1, max - min)

  const x = (i: number): number =>
    padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v: number): number => padT + innerH - ((v - min) / span) * innerH

  const linePts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')
  const areaPts = `${padL},${padT + innerH} ${linePts} ${padL + innerW},${padT + innerH}`

  const ticks = 4
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => padT + (i / ticks) * innerH)

  return (
    <svg className="an-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fleet risk over the last 7 days">
      {gridY.map((gy, i) => (
        <line key={i} className="an-grid-line" x1={padL} y1={gy} x2={padL + innerW} y2={gy} />
      ))}
      <polygon className="an-area" points={areaPts} />
      <polyline className="an-line" points={linePts} />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle className="an-dot" cx={x(i)} cy={y(d.value)} r={3.5} />
          <text className="an-axis-label" x={x(i)} y={H - 8} textAnchor="middle">
            {d.label}
          </text>
        </g>
      ))}
      <text className="an-axis-label" x={padL - 6} y={y(max) + 3} textAnchor="end">
        {max}
      </text>
      <text className="an-axis-label" x={padL - 6} y={y(min) + 3} textAnchor="end">
        {min}
      </text>
    </svg>
  )
}

// --- MTTR vertical bar chart (5 weeks) ---------------------------------------
function MttrBarChart({ data }: { data: SeriesPoint[] }) {
  const W = 360
  const H = 200
  const padT = 18
  const padB = 26
  const padX = 16
  const innerW = W - padX * 2
  const innerH = H - padT - padB

  const max = Math.max(...data.map((d) => d.value))
  const slot = innerW / data.length
  const bw = slot * 0.52

  return (
    <svg className="an-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mean time to resolve over 5 weeks">
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line
          key={i}
          className="an-grid-line"
          x1={padX}
          y1={padT + innerH - f * innerH}
          x2={W - padX}
          y2={padT + innerH - f * innerH}
        />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH
        const bx = padX + i * slot + (slot - bw) / 2
        const by = padT + innerH - h
        return (
          <g key={d.label}>
            <rect className="an-bar-mttr" x={bx} y={by} width={bw} height={h} rx={4} />
            <text className="an-bar-cap" x={bx + bw / 2} y={by - 5} textAnchor="middle">
              {d.value}
            </text>
            <text className="an-axis-label" x={bx + bw / 2} y={H - 8} textAnchor="middle">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// --- Donut (severity distribution) -------------------------------------------
function SeverityDonut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const size = 160
  const r = 62
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  const sw = 22

  let offset = 0
  const segments = data.map((d) => {
    const frac = d.value / total
    const seg = {
      color: d.color,
      dash: frac * C,
      gap: C - frac * C,
      rotate: (offset / total) * 360 - 90,
    }
    offset += d.value
    return seg
  })

  return (
    <div className="an-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Severity distribution">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDF0F7" strokeWidth={sw} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={sw}
            strokeDasharray={`${s.dash} ${s.gap}`}
            transform={`rotate(${s.rotate} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        <text className="an-donut-center" x={cx} y={cy - 1} textAnchor="middle" fontSize={26}>
          {total}
        </text>
        <text className="an-donut-centersub" x={cx} y={cy + 16} textAnchor="middle" fontSize={11}>
          findings
        </text>
      </svg>
      <div className="an-legend">
        {data.map((d) => (
          <div className="an-legend-row" key={d.label}>
            <span className="an-legend-sw" style={{ background: d.color }} />
            <span className="an-legend-name">{d.label}</span>
            <span className="an-legend-val">
              {d.value} · {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const mttrFirst = MTTR_TREND[0].value
  const mttrLast = MTTR_TREND[MTTR_TREND.length - 1].value
  const mttrImproving = mttrLast < mttrFirst
  const mttrDelta = Math.round((Math.abs(mttrLast - mttrFirst) / mttrFirst) * 100)

  const tacticMax = Math.max(...DETECTIONS_BY_TACTIC.map((d) => d.value))
  const envMax = Math.max(...DETECTIONS_BY_ENV.map((d) => d.value))

  return (
    <AppShell title="Fleet Analytics" crumb="Northstar · Org-wide security posture">
      <div className="content">
        {/* 1. KPI row */}
        <div className="kstrip">
          {ADMIN_KPIS.map((k) => (
            <div className="kc" key={k.label}>
              <div className="kl">{k.label}</div>
              <div className={`kv ${TONE_CLASS[k.tone]}`}>{k.value}</div>
              <div className="ks">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* 2 + 3. Risk over time + MTTR */}
        <div className="an-grid">
          <div className="panel">
            <div className="ph">
              <div className="t">Fleet risk — last 7 days</div>
              <div className="s">Composite score</div>
            </div>
            <RiskAreaChart data={RISK_OVER_TIME} />
          </div>
          <div className="panel">
            <div className="ph">
              <div className="t">Mean time to resolve — 5 weeks</div>
              <div className="s" style={{ color: mttrImproving ? 'var(--teal-ink)' : 'var(--crit)' }}>
                {mttrImproving ? '▼' : '▲'} {mttrDelta}% {mttrImproving ? 'improving' : 'declining'}
              </div>
            </div>
            <MttrBarChart data={MTTR_TREND} />
            <div className="ks" style={{ marginTop: 6, color: 'var(--mut)', fontWeight: 700, fontSize: 12 }}>
              minutes per incident · now <span className="num">{mttrLast}m</span>
            </div>
          </div>
        </div>

        {/* 4 + 5 + 6. Tactic / Env / Severity */}
        <div className="an-grid3">
          <div className="panel">
            <div className="ph">
              <div className="t">Detections by MITRE tactic</div>
              <div className="s">last 30 days</div>
            </div>
            <div className="an-hbar">
              {DETECTIONS_BY_TACTIC.map((d) => (
                <div className="an-hbar-row" key={d.label}>
                  <span className="an-hbar-label">{d.label}</span>
                  <span className="an-hbar-track">
                    <span className="an-hbar-fill" style={{ width: `${(d.value / tacticMax) * 100}%` }} />
                  </span>
                  <span className="an-hbar-val">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="ph">
              <div className="t">Detections by environment</div>
              <div className="s">share of volume</div>
            </div>
            <div className="an-env">
              {DETECTIONS_BY_ENV.map((d, i) => (
                <div className="an-env-row" key={d.label}>
                  <div className="an-env-top">
                    <span className="an-env-name">{d.label}</span>
                    <span className="an-env-pct">{d.value}%</span>
                  </div>
                  <div className="an-env-track">
                    <div
                      className="an-env-fill"
                      style={{
                        width: `${(d.value / envMax) * 100}%`,
                        background: ENV_COLORS[i % ENV_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="ph">
              <div className="t">Severity distribution</div>
              <div className="s">open findings</div>
            </div>
            <SeverityDonut data={SEVERITY_DIST} />
          </div>
        </div>

        {/* 7. Team performance */}
        <div className="panel">
          <div className="ph">
            <div className="t">Team performance</div>
            <div className="s">{TEAM_PERFORMANCE.length} teams</div>
          </div>
          <table className="an-table">
            <thead>
              <tr>
                <th>Team</th>
                <th className="an-r">Open</th>
                <th className="an-r">MTTR</th>
                <th>Resolution %</th>
                <th className="an-r">Risk</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_PERFORMANCE.map((row) => (
                <tr key={row.team}>
                  <td>
                    <span className="an-team-name">{row.team}</span>
                  </td>
                  <td className="an-r num">{row.open}</td>
                  <td className="an-r num">{row.mttr}</td>
                  <td>
                    <div className="an-prog">
                      <span className="an-prog-track">
                        <span className="an-prog-fill" style={{ width: `${row.resolution}%` }} />
                      </span>
                      <span className="an-prog-num">{row.resolution}%</span>
                    </div>
                  </td>
                  <td className="an-r">
                    <span className={`an-badge ${row.risk.toLowerCase()}`}>{row.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
