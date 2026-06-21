import type { Severity } from '../../data/mockData'
import type { FlagKey, GroupBy } from '../../hooks/useTriage'
import { Search } from '../../lib/icons'

interface Props {
  sevOn: Set<Severity>
  flagOn: Set<FlagKey>
  groupBy: GroupBy
  query: string
  showSearch?: boolean
  onToggleSev: (s: Severity) => void
  onToggleFlag: (f: FlagKey) => void
  onChangeGroup: (g: GroupBy) => void
  onQuery: (q: string) => void
}

const SEVS: { key: Severity; label: string; dot: string }[] = [
  { key: 'critical', label: 'Critical', dot: 'dc' },
  { key: 'high', label: 'High', dot: 'dh' },
  { key: 'medium', label: 'Medium', dot: 'dm' },
]
const GROUPS: { key: GroupBy; label: string }[] = [
  { key: 'none', label: 'Flat' },
  { key: 'env', label: 'Environment' },
  { key: 'status', label: 'Status' },
]

export function Toolbar({ sevOn, flagOn, groupBy, query, showSearch, onToggleSev, onToggleFlag, onChangeGroup, onQuery }: Props) {
  return (
    <div className="bar">
      <span className="lbl">Severity</span>
      {SEVS.map((s) => (
        <button key={s.key} className={`f${sevOn.has(s.key) ? ' on' : ''}`} onClick={() => onToggleSev(s.key)} aria-pressed={sevOn.has(s.key)}>
          <span className={`dot ${s.dot}`} />{s.label}
        </button>
      ))}
      <span className="lbl" style={{ marginLeft: 8 }}>Flag</span>
      <button className={`f${flagOn.has('attention') ? ' on' : ''}`} onClick={() => onToggleFlag('attention')} aria-pressed={flagOn.has('attention')}>Needs attention</button>
      <button className={`f${flagOn.has('acted') ? ' on' : ''}`} onClick={() => onToggleFlag('acted')} aria-pressed={flagOn.has('acted')}>Acted</button>
      {showSearch && (
        <div className="tsearch" style={{ marginLeft: 8, width: 200 }}>
          <Search /><input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Filter issues…" aria-label="Filter issues" />
        </div>
      )}
      <span className="spacer" />
      <span className="lbl">Group</span>
      <div className="toggle">
        {GROUPS.map((g) => (
          <button key={g.key} className={groupBy === g.key ? 'on' : ''} onClick={() => onChangeGroup(g.key)}>{g.label}</button>
        ))}
      </div>
    </div>
  )
}
