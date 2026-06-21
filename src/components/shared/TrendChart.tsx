import { TREND } from '../../data/mockData'

export function TrendChart() {
  return (
    <div className="panel chart">
      <div className="ph">
        <div className="t">Detected vs Resolved — macro trend</div>
        <div className="s">5 weeks · WoW baseline</div>
      </div>
      <div className="legend">
        <span><i style={{ background: '#0E6E5A' }} />Detected</span>
        <span><i style={{ background: '#1BA88A' }} />Resolved</span>
        <span><i style={{ background: '#C2C9DA' }} />WoW baseline</span>
      </div>
      <svg viewBox="0 0 620 230" role="img" aria-label="Detected vs resolved issues over five weeks with week-over-week baseline">
        <line className="gl" x1="40" y1="40" x2="600" y2="40" />
        <line className="gl" x1="40" y1="95" x2="600" y2="95" />
        <line className="gl" x1="40" y1="150" x2="600" y2="150" />
        <line className="gl" x1="40" y1="195" x2="600" y2="195" />
        <rect x={TREND.thresholdX} y="30" width={TREND.thresholdW} height="165" fill="#F6C66B" opacity=".18" rx="6" />
        <text x="327" y="24" textAnchor="middle" className="axis" style={{ fill: '#C2811F', fontWeight: 800 }}>⚠ +20% threshold</text>
        <polyline className="base" points={TREND.baseline} />
        <polyline className="ln" style={{ stroke: '#1BA88A', animationDelay: '.2s' }} points={TREND.resolved} />
        <polyline className="ln" style={{ stroke: '#0E6E5A' }} points={TREND.detected} />
        {TREND.weeks.map((w, i) => (
          <text key={w} x={60 + i * 130} y="216" textAnchor="middle" className="axis">{w}</text>
        ))}
      </svg>
      <div className="note-sm">
        ⚠ Backlog grew <b>+14</b> this window — detected outpaced resolved in Wk 3, driven by <b>eks-prod-use1 / ns-payments</b>.
      </div>
    </div>
  )
}
