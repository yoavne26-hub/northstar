import type { MouseEvent } from 'react'
import type { Issue, Status } from '../../data/mockData'
import { SEV_CLASS } from '../../data/mockData'
import { scopeIcon, Check } from '../../lib/icons'
import { verdictFromScore } from '../../lib/risk'
import { RiskInfoPopover } from './RiskInfoPopover'

interface Props {
  issue: Issue
  selected: boolean
  actedLabel?: Status
  onToggle: (id: number) => void
  onInvestigate: (id: number) => void
  onEscalate: (id: number) => void
  onIgnore: (id: number) => void
}

export function IssueRow({ issue: it, selected, actedLabel, onToggle, onInvestigate, onEscalate, onIgnore }: Props) {
  const sc = SEV_CLASS[it.severity]
  const verdict = verdictFromScore(it.score)
  const cls = `iss ${sc}${selected ? ' sel' : ''}${actedLabel ? ' acted' : ''}`
  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div className={cls} onClick={() => onToggle(it.id)}>
      <div className="itop">
        <span className="chk" onClick={(e) => { stop(e); onToggle(it.id) }}><Check /></span>
        <span className="rk">{it.rank}</span>
        <span className={`sev ${sc}`}>{it.severity.toUpperCase()}</span>
        <span className="ttl">{it.title}</span>
        {actedLabel
          ? <span className="w done">✓ {actedLabel}</span>
          : it.flag === 'attention' && <span className="w d" style={{ fontWeight: 800 }}>● Needs attention</span>}
        <span className="score">Risk <span className="v num">{it.score}</span><RiskInfoPopover issue={it} /></span>
      </div>
      <div className="why">
        <span className="w mitre">{it.mitre}</span>
        {it.why.map((w) => <span key={w.label} className={`w${w.danger ? ' d' : ''}`}>{w.label}</span>)}
        <span className="w">{it.deviation}</span>
      </div>
      <div className="meta">
        {it.scope.map((s, i) => {
          const Icon = scopeIcon[s.kind]
          return <span className="m" key={i}><Icon />{s.label}</span>
        })}
        <span className="m time num">{it.time}</span>
        <span className={`verdict v-${verdict.toLowerCase()}`} title="RES-24 verdict (from risk score)">{verdict}</span>
        <span className="status">{actedLabel ?? it.status}</span>
        <span className="acts">
          <button className="btn pri" onClick={(e) => { stop(e); onInvestigate(it.id) }}>Investigate</button>
          <button className="btn" onClick={(e) => { stop(e); onEscalate(it.id) }}>Escalate</button>
          <button className="btn ig" onClick={(e) => { stop(e); onIgnore(it.id) }}>Ignore</button>
        </span>
      </div>
    </div>
  )
}
