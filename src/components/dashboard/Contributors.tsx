import { CONTRIBUTORS } from '../../data/mockData'

export function Contributors() {
  return (
    <div className="panel">
      <div className="ph">
        <div className="t">Top risk contributors</div>
        <div className="s">by risk share</div>
      </div>
      <div className="contrib">
        {CONTRIBUTORS.map((c) => (
          <div key={c.name}>
            <div className="crow">{c.name}<span className="num" style={{ float: 'right', color: 'var(--mut)' }}>{c.pct}%</span></div>
            <div className="cbar"><i style={{ width: `${c.pct}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="note-sm" style={{ marginTop: 14 }}>
        Risk direction <b>▲ 18%</b> vs prev 24h — change began ~3h ago. <b>Significant</b>.
      </div>
    </div>
  )
}
