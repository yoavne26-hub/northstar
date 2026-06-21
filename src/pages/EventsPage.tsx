import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { ALL_TAGS, EVENTS, EVENT_SEVERITY_COLOR, EVENT_SEVERITY_ORDER } from '../data/events'
import type { EventSeverity, SecurityEvent } from '../data/events'
import './events-page.css'

type SortKey = 'time' | 'severity' | 'title' | 'host' | 'sourceIp'
type SortDir = 'asc' | 'desc'

interface Column {
  key: SortKey
  label: string
}

const COLUMNS: Column[] = [
  { key: 'time', label: 'Time' },
  { key: 'severity', label: 'Severity' },
  { key: 'title', label: 'Title' },
  { key: 'host', label: 'Host' },
  { key: 'sourceIp', label: 'Source IP' },
]

const SEV_RANK: Record<EventSeverity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

// Relative time vs now. Handles minutes / hours / days.
function ago(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const diffMs = Date.now() - then
  if (diffMs < 0) return 'just now'
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function absTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sevBadgeStyle(sev: EventSeverity): { color: string; background: string; border: string } {
  const c = EVENT_SEVERITY_COLOR[sev]
  return { color: c, background: `${c}1a`, border: `1px solid ${c}55` }
}

function compare(a: SecurityEvent, b: SecurityEvent, key: SortKey): number {
  switch (key) {
    case 'time':
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    case 'severity':
      return SEV_RANK[a.severity] - SEV_RANK[b.severity]
    case 'title':
      return a.title.localeCompare(b.title)
    case 'host':
      return a.host.localeCompare(b.host)
    case 'sourceIp':
      return (a.sourceIp ?? '').localeCompare(b.sourceIp ?? '')
  }
}

export function EventsPage() {
  const [query, setQuery] = useState('')
  const [activeSev, setActiveSev] = useState<Record<EventSeverity, boolean>>({
    CRITICAL: true,
    HIGH: true,
    MEDIUM: true,
    LOW: true,
  })
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [tagMenuOpen, setTagMenuOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('time')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<SecurityEvent | null>(null)

  // Esc closes the modal.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const toggleSev = (s: EventSeverity) => setActiveSev((prev) => ({ ...prev, [s]: !prev[s] }))
  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'title' || key === 'host' || key === 'sourceIp' ? 'asc' : 'desc')
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = EVENTS.filter((ev) => {
      if (!activeSev[ev.severity]) return false
      if (activeTags.length && !activeTags.every((t) => ev.tags.includes(t))) return false
      if (!q) return true
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.host.toLowerCase().includes(q) ||
        ev.ip.toLowerCase().includes(q) ||
        (ev.sourceIp ?? '').toLowerCase().includes(q)
      )
    })
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => dir * compare(a, b, sortKey))
  }, [query, activeSev, activeTags, sortKey, sortDir])

  // Severity mix over the whole dataset for the donut + tiles.
  const counts = useMemo(() => {
    const c: Record<EventSeverity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    for (const ev of EVENTS) c[ev.severity] += 1
    return c
  }, [])
  const total = EVENTS.length
  const hostsAffected = useMemo(() => new Set(EVENTS.map((e) => e.host)).size, [])

  // Donut geometry (rotated -90deg in CSS so arcs start at 12 o'clock).
  const R = 54
  const C = 2 * Math.PI * R
  let offsetAcc = 0
  const arcs = EVENT_SEVERITY_ORDER.map((sev) => {
    const frac = total ? counts[sev] / total : 0
    const seg = { sev, dash: frac * C, offset: offsetAcc }
    offsetAcc += frac * C
    return seg
  })

  const sevAllOn = EVENT_SEVERITY_ORDER.every((s) => activeSev[s])
  const filtered = !sevAllOn || activeTags.length > 0 || query.trim() !== ''

  const clearAll = () => {
    setQuery('')
    setActiveSev({ CRITICAL: true, HIGH: true, MEDIUM: true, LOW: true })
    setActiveTags([])
  }

  return (
    <AppShell title="Events" crumb="Northstar · Activity stream">
      <div className="content">
        {/* Top band */}
        <div className="ev-band">
          <div className="ev-donut-wrap">
            <div className="ev-donut">
              <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label="Severity mix">
                <circle cx="66" cy="66" r={R} fill="none" stroke="var(--border)" strokeWidth="16" />
                {arcs.map(
                  (a) =>
                    a.dash > 0 && (
                      <circle
                        key={a.sev}
                        cx="66"
                        cy="66"
                        r={R}
                        fill="none"
                        stroke={EVENT_SEVERITY_COLOR[a.sev]}
                        strokeWidth="16"
                        strokeDasharray={`${a.dash} ${C - a.dash}`}
                        strokeDashoffset={-a.offset}
                      />
                    ),
                )}
              </svg>
              <div className="ev-donut-center">
                <span className="ev-donut-total num">{total}</span>
                <span className="ev-donut-label">events</span>
              </div>
            </div>
            <div className="ev-legend">
              {EVENT_SEVERITY_ORDER.map((s) => (
                <div className="ev-legend-row" key={s}>
                  <span className="ev-dot" style={{ background: EVENT_SEVERITY_COLOR[s] }} />
                  <span>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                  <span className="ev-legend-n">{counts[s]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ev-tiles">
            <div className="ev-tile">
              <div className="ev-tile-k">Total events</div>
              <div className="ev-tile-v num">{total}</div>
            </div>
            <div className="ev-tile">
              <div className="ev-tile-k">Criticals</div>
              <div className="ev-tile-v is-crit num">{counts.CRITICAL}</div>
            </div>
            <div className="ev-tile">
              <div className="ev-tile-k">Hosts affected</div>
              <div className="ev-tile-v num">{hostsAffected}</div>
            </div>
            <div className="ev-tile">
              <div className="ev-tile-k">Tags tracked</div>
              <div className="ev-tile-v is-teal num">{ALL_TAGS.length}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ev-toolbar">
          <div className="ev-search">
            <span className="ev-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search title, description, host, or IP…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search events"
            />
          </div>

          <div className="ev-sevchips" role="group" aria-label="Filter by severity">
            {EVENT_SEVERITY_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className={'ev-sevchip ' + (activeSev[s] ? 'is-on' : 'is-off')}
                aria-pressed={activeSev[s]}
                onClick={() => toggleSev(s)}
              >
                <span className="ev-dot" style={{ background: EVENT_SEVERITY_COLOR[s] }} />
                {s}
              </button>
            ))}
          </div>

          <div className="ev-tagmenu">
            <button
              type="button"
              className="ev-tagbtn"
              aria-expanded={tagMenuOpen}
              onClick={() => setTagMenuOpen((o) => !o)}
            >
              Tags
              {activeTags.length > 0 && <span className="ev-count-pill">{activeTags.length}</span>}
              <span aria-hidden="true">{tagMenuOpen ? '▴' : '▾'}</span>
            </button>
            {tagMenuOpen && (
              <div className="ev-popover" role="group" aria-label="Filter by tag">
                {ALL_TAGS.map((t) => (
                  <label className="ev-popover-row" key={t}>
                    <input type="checkbox" checked={activeTags.includes(t)} onChange={() => toggleTag(t)} />
                    {t}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {filtered && (
          <div className="ev-active">
            <span className="ev-active-lbl">Filters:</span>
            {query.trim() !== '' && (
              <span className="ev-fchip">
                search: “{query.trim()}”
                <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                  ✕
                </button>
              </span>
            )}
            {EVENT_SEVERITY_ORDER.filter((s) => !activeSev[s]).map((s) => (
              <span className="ev-fchip" key={'off-' + s}>
                not {s}
                <button type="button" aria-label={'Re-enable ' + s} onClick={() => toggleSev(s)}>
                  ✕
                </button>
              </span>
            ))}
            {activeTags.map((t) => (
              <span className="ev-fchip" key={'tag-' + t}>
                {t}
                <button type="button" aria-label={'Remove tag ' + t} onClick={() => toggleTag(t)}>
                  ✕
                </button>
              </span>
            ))}
            <button type="button" className="ev-clearall" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        <div className="ev-count" aria-live="polite">
          <span className="num">{rows.length}</span> of <span className="num">{total}</span> events
          {filtered ? ' (filtered)' : ''}
        </div>

        {/* Table */}
        <div className="ev-tablewrap panel">
          <table className="ev-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const isSorted = col.key === sortKey
                  const ariaSort = isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                  return (
                    <th key={col.key} scope="col" aria-sort={ariaSort} className={isSorted ? 'is-sorted' : ''}>
                      <button type="button" className="ev-th-btn" onClick={() => onSort(col.key)}>
                        <span>{col.label}</span>
                        <span className="ev-sort-ind" aria-hidden="true">
                          {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </button>
                    </th>
                  )
                })}
                <th scope="col">
                  <span className="ev-th-btn" style={{ cursor: 'default' }}>
                    Tags
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ev) => (
                <tr key={ev.id} onClick={() => setSelected(ev)} aria-label={`Open event ${ev.title}`}>
                  <td className="ev-time">{ago(ev.timestamp)}</td>
                  <td>
                    <span className="ev-sev" style={sevBadgeStyle(ev.severity)}>
                      {ev.severity}
                    </span>
                  </td>
                  <td className="ev-title-cell">{ev.title}</td>
                  <td className="ev-mono">{ev.host}</td>
                  <td className="ev-mono">{ev.sourceIp ?? '—'}</td>
                  <td className="ev-tags-cell">
                    <div className="ev-tags">
                      {ev.tags.map((t) => (
                        <span className="ev-pill" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="ev-empty" colSpan={COLUMNS.length + 1}>
                    No events match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  )
}

function EventModal({ event, onClose }: { event: SecurityEvent; onClose: () => void }) {
  return (
    <div
      className="ev-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ev-modal">
        <button type="button" className="ev-modal-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className="ev-modal-head">
          <span className="ev-sev" style={sevBadgeStyle(event.severity)}>
            {event.severity}
          </span>
          <span className="ev-mono">{event.id}</span>
        </div>
        <h2 className="ev-modal-title">{event.title}</h2>

        <div className="ev-ctx-grid">
          <div>
            <div className="ev-ctx-k">Host</div>
            <div className="ev-ctx-v ev-mono">{event.host}</div>
          </div>
          <div>
            <div className="ev-ctx-k">Asset IP</div>
            <div className="ev-ctx-v ev-mono">{event.ip}</div>
          </div>
          <div>
            <div className="ev-ctx-k">Source IP</div>
            <div className="ev-ctx-v ev-mono">{event.sourceIp ?? '—'}</div>
          </div>
          <div>
            <div className="ev-ctx-k">User</div>
            <div className="ev-ctx-v ev-mono">{event.user ?? '—'}</div>
          </div>
          <div>
            <div className="ev-ctx-k">Severity</div>
            <div className="ev-ctx-v">{event.severity}</div>
          </div>
          <div>
            <div className="ev-ctx-k">Time</div>
            <div className="ev-ctx-v num">{absTime(event.timestamp)}</div>
          </div>
        </div>

        <h3 className="ev-modal-h">Description</h3>
        <p className="ev-desc">{event.description}</p>

        <h3 className="ev-modal-h">Tags</h3>
        <div className="ev-tags">
          {event.tags.map((t) => (
            <span className="ev-pill" key={t}>
              {t}
            </span>
          ))}
        </div>

        <details className="ev-raw">
          <summary>Raw JSON</summary>
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </details>
      </div>
    </div>
  )
}
