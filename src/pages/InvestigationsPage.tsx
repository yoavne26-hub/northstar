import { useMemo, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { ISSUES, SEV_CLASS } from '../data/mockData'
import type { Issue, Severity, Status } from '../data/mockData'
import './investigations.css'

type SortKey = 'score' | 'title' | 'severity' | 'environment' | 'mitre' | 'status' | 'time'
type SortDir = 'asc' | 'desc'

interface Column {
  key: SortKey
  label: string
  numeric?: boolean
}

const COLUMNS: Column[] = [
  { key: 'score', label: 'Risk', numeric: true },
  { key: 'title', label: 'Title' },
  { key: 'severity', label: 'Severity' },
  { key: 'environment', label: 'Environment' },
  { key: 'mitre', label: 'MITRE' },
  { key: 'status', label: 'Status' },
  { key: 'time', label: 'Detected' },
]

const SEV_RANK: Record<Severity, number> = { critical: 3, high: 2, medium: 1 }
const ALL_SEV: Severity[] = ['critical', 'high', 'medium']
const SEV_LABEL: Record<Severity, string> = { critical: 'Critical', high: 'High', medium: 'Medium' }

// Smaller index = more recent (rows are authored newest-first).
const RECENCY = new Map<number, number>(ISSUES.map((it, i) => [it.id, i]))

function scopeGlyph(kind: 'globe' | 'user' | 'cube'): string {
  if (kind === 'globe') return '🌐'
  if (kind === 'user') return '👤'
  return '⬢'
}

function compare(a: Issue, b: Issue, key: SortKey): number {
  switch (key) {
    case 'score':
      return a.score - b.score
    case 'severity':
      return SEV_RANK[a.severity] - SEV_RANK[b.severity]
    case 'time':
      // higher recency-index = older, so invert to make "asc" = oldest first
      return (RECENCY.get(b.id) ?? 0) - (RECENCY.get(a.id) ?? 0)
    case 'title':
      return a.title.localeCompare(b.title)
    case 'environment':
      return a.environment.localeCompare(b.environment)
    case 'mitre':
      return a.mitre.localeCompare(b.mitre)
    case 'status':
      return a.status.localeCompare(b.status)
  }
}

export function InvestigationsPage() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Record<Severity, boolean>>({ critical: true, high: true, medium: true })
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expanded, setExpanded] = useState<number | null>(null)

  const toggleSev = (s: Severity) => setActive((prev) => ({ ...prev, [s]: !prev[s] }))

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'title' || key === 'environment' || key === 'mitre' || key === 'status' ? 'asc' : 'desc')
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = ISSUES.filter((it) => {
      if (!active[it.severity]) return false
      if (!q) return true
      return (
        it.title.toLowerCase().includes(q) ||
        it.environment.toLowerCase().includes(q) ||
        it.mitre.toLowerCase().includes(q)
      )
    })
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => dir * compare(a, b, sortKey))
  }, [query, active, sortKey, sortDir])

  const allSevOn = ALL_SEV.every((s) => active[s])

  return (
    <AppShell title="Investigations" crumb="Northstar · All cases">
      <div className="content">
        <div className="inv-toolbar">
          <div className="inv-search">
            <span className="inv-search-icon" aria-hidden="true">⌕</span>
            <input
              className="inv-search-input"
              type="search"
              placeholder="Search title, environment, or MITRE technique…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search investigations"
            />
          </div>
          <div className="inv-chips" role="group" aria-label="Filter by severity">
            {ALL_SEV.map((s) => (
              <button
                key={s}
                type="button"
                className={'inv-chip inv-chip-' + SEV_CLASS[s] + (active[s] ? ' is-on' : '')}
                aria-pressed={active[s]}
                onClick={() => toggleSev(s)}
              >
                <span className={'sev ' + SEV_CLASS[s]}>{SEV_LABEL[s]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="inv-count" aria-live="polite">
          Showing <span className="num">{rows.length}</span> of <span className="num">{ISSUES.length}</span> cases
          {allSevOn && !query ? '' : ' (filtered)'}
        </div>

        <div className="inv-tablewrap panel">
          <table className="inv-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const isSorted = col.key === sortKey
                  const ariaSort = isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={ariaSort}
                      className={(col.numeric ? 'inv-th-num ' : '') + (isSorted ? 'is-sorted' : '')}
                    >
                      <button type="button" className="inv-th-btn" onClick={() => onSort(col.key)}>
                        <span>{col.label}</span>
                        <span className="inv-sort-ind" aria-hidden="true">
                          {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((it) => {
                const open = expanded === it.id
                return (
                  <RowGroup
                    key={it.id}
                    issue={it}
                    open={open}
                    onToggle={() => setExpanded(open ? null : it.id)}
                  />
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="inv-empty" colSpan={COLUMNS.length}>
                    No cases match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}

function RowGroup({ issue, open, onToggle }: { issue: Issue; open: boolean; onToggle: () => void }) {
  const high = issue.score >= 70
  return (
    <>
      <tr
        className={'inv-row' + (open ? ' is-open' : '')}
        onClick={onToggle}
        aria-expanded={open}
      >
        <td className="inv-th-num">
          <span className={'inv-score' + (high ? ' is-high' : '')}>{issue.score}</span>
        </td>
        <td className="inv-title">
          <span className="inv-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
          <span className="inv-title-text">{issue.title}</span>
          {issue.flag === 'attention' && <span className="inv-flag" title="Needs attention">●</span>}
        </td>
        <td>
          <span className={'sev ' + SEV_CLASS[issue.severity]}>{issue.severity.toUpperCase()}</span>
        </td>
        <td className="inv-env">{issue.environment}</td>
        <td className="inv-mitre"><span className="num">{issue.mitre}</span></td>
        <td><StatusPill status={issue.status} /></td>
        <td className="inv-time">{issue.time}</td>
      </tr>
      {open && (
        <tr className="inv-detailrow">
          <td colSpan={COLUMNS.length}>
            <Detail issue={issue} />
          </td>
        </tr>
      )}
    </>
  )
}

function StatusPill({ status }: { status: Status }) {
  const slug = status.toLowerCase().replace(/\s+/g, '-')
  return <span className={'status inv-status-' + slug}>{status}</span>
}

function Detail({ issue }: { issue: Issue }) {
  return (
    <div className="inv-detail">
      <p className="inv-reason">{issue.reason}</p>

      {issue.why.length > 0 && (
        <div className="inv-detail-block">
          <h4 className="inv-detail-h">Why it scored</h4>
          <div className="inv-whys">
            {issue.why.map((w, i) => (
              <span key={i} className={'w' + (w.danger ? ' d' : '')}>{w.label}</span>
            ))}
          </div>
        </div>
      )}

      <div className="inv-detail-grid">
        {issue.scope.length > 0 && (
          <div className="inv-detail-block">
            <h4 className="inv-detail-h">Scope</h4>
            <ul className="inv-scope">
              {issue.scope.map((s, i) => (
                <li key={i}>
                  <span className="inv-glyph" aria-hidden="true">{scopeGlyph(s.kind)}</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {issue.evidence.length > 0 && (
          <div className="inv-detail-block">
            <h4 className="inv-detail-h">Evidence</h4>
            <ul className="inv-evidence">
              {issue.evidence.map((e, i) => (
                <li key={i}>
                  <span className="inv-glyph" aria-hidden="true">{scopeGlyph(e.kind)}</span>
                  <span className="inv-ev-type">{e.type}</span>
                  <span className="inv-ev-detail">{e.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {issue.timeline.length > 0 && (
        <div className="inv-detail-block">
          <h4 className="inv-detail-h">Timeline</h4>
          <ol className="inv-timeline">
            {issue.timeline.map((t, i) => (
              <li key={i} className={'inv-tl-item' + (t.critical ? ' is-critical' : '')}>
                <span className="inv-tl-dot" aria-hidden="true" />
                <span className="inv-tl-time num">{t.time}</span>
                <span className="inv-tl-label">{t.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
