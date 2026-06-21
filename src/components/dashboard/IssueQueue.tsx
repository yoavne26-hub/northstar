import { useState } from 'react'
import type { Issue, Status } from '../../data/mockData'
import type { GroupBy, TriageGroup } from '../../hooks/useTriage'
import { IssueRow } from './IssueRow'
import { Chevron } from '../../lib/icons'

interface Props {
  groups: TriageGroup[]
  groupBy: GroupBy
  selected: Set<number>
  acted: Record<number, Status>
  onToggle: (id: number) => void
  onInvestigate: (id: number) => void
  onEscalate: (id: number) => void
  onIgnore: (id: number) => void
}

export function IssueQueue({ groups, groupBy, selected, acted, onToggle, onInvestigate, onEscalate, onIgnore }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggleGroup = (k: string) => setCollapsed((prev) => {
    const next = new Set(prev); next.has(k) ? next.delete(k) : next.add(k); return next
  })

  const renderRows = (issues: Issue[]) => issues.map((it) => (
    <IssueRow
      key={it.id} issue={it} selected={selected.has(it.id)} actedLabel={acted[it.id]}
      onToggle={onToggle} onInvestigate={onInvestigate} onEscalate={onEscalate} onIgnore={onIgnore}
    />
  ))

  if (groupBy === 'none') {
    return (
      <div>
        {renderRows(groups[0]?.issues ?? [])}
        <div className="more">▾ <b>42 low-risk events</b> suppressed · <b>17 duplicates</b> deduped this window</div>
      </div>
    )
  }

  return (
    <div>
      {groups.map((g) => {
        const isCol = collapsed.has(g.key)
        return (
          <div key={g.key}>
            <div className={`ghead${isCol ? ' cl' : ''}`} onClick={() => toggleGroup(g.key)}>
              <Chevron className="ic chev" />
              <span style={{ color: 'var(--navy)' }}>{g.key}</span>
              <span className="cnt num">{g.issues.length}</span>
              <span className="gline" />
            </div>
            {!isCol && <div>{renderRows(g.issues)}</div>}
          </div>
        )
      })}
    </div>
  )
}
