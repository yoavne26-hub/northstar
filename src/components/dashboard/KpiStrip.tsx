import { KPIS, type Kpi } from '../../data/mockData'
import { Pulse, Alert, Bars, Clock } from '../../lib/icons'

const ICON = { pulse: Pulse, alert: Alert, bars: Bars, clock: Clock }
const TONE = { good: 't', critical: 'r', warning: 'a', neutral: 'n' } as const

function renderSub(k: Kpi) {
  if (!k.subTone) return k.sub
  const [head, ...rest] = k.sub.split(' ')
  return (<><span className={k.subTone === 'good' ? 'g' : 'r'}>{head}</span> {rest.join(' ')}</>)
}

export function KpiStrip({ criticalCount }: { criticalCount?: number }) {
  return (
    <div className="kstrip">
      {KPIS.map((k) => {
        const Icon = ICON[k.icon]
        const value = k.label === 'Open Critical' && criticalCount != null ? String(criticalCount) : k.value
        return (
          <div className="kc" key={k.label}>
            <div className="kl"><Icon />{k.label}</div>
            <div className={`kv ${TONE[k.tone]} num`}>{value}</div>
            <div className="ks">{renderSub(k)}</div>
          </div>
        )
      })}
    </div>
  )
}
