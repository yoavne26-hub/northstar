import { ENVIRONMENTS, STATUS_LIST, SORT_OPTIONS, type Status, type SortKey } from '../../data/mockData'
import type { SavedView } from '../../hooks/useTriage'
import { Search, Chevron, Close } from '../../lib/icons'

interface Props {
  query: string
  envOn: Set<string>
  statusOn: Set<Status>
  scoreMin: number
  sort: SortKey
  views: SavedView[]
  activeAdvanced: number
  onQuery: (q: string) => void
  onToggleEnv: (e: string) => void
  onToggleStatus: (s: Status) => void
  onScoreMin: (n: number) => void
  onSort: (s: SortKey) => void
  onClear: () => void
  onSaveView: (name: string) => void
  onApplyView: (v: SavedView) => void
  onDeleteView: (name: string) => void
}

export function FilterBar(p: Props) {
  const saveView = () => {
    const name = window.prompt('Save current filters as a view. Name:')
    if (name && name.trim()) p.onSaveView(name.trim())
  }

  return (
    <div className="filterbar">
      <div className="fb-search">
        <Search />
        <input value={p.query} onChange={(e) => p.onQuery(e.target.value)} placeholder="Search title, environment, MITRE…" aria-label="Search issues" />
      </div>

      <details className="fb-pop">
        <summary>Environment{p.envOn.size > 0 && <span className="fb-count">{p.envOn.size}</span>}<Chevron /></summary>
        <div className="fb-menu">
          {ENVIRONMENTS.map((e) => (
            <label key={e} className="fb-check">
              <input type="checkbox" checked={p.envOn.has(e)} onChange={() => p.onToggleEnv(e)} />{e}
            </label>
          ))}
        </div>
      </details>

      <details className="fb-pop">
        <summary>Status{p.statusOn.size > 0 && <span className="fb-count">{p.statusOn.size}</span>}<Chevron /></summary>
        <div className="fb-menu">
          {STATUS_LIST.map((s) => (
            <label key={s} className="fb-check">
              <input type="checkbox" checked={p.statusOn.has(s)} onChange={() => p.onToggleStatus(s)} />{s}
            </label>
          ))}
        </div>
      </details>

      <div className="fb-range">
        <span>Min risk <b className="num">{p.scoreMin}</b></span>
        <input type="range" min={0} max={100} step={5} value={p.scoreMin} onChange={(e) => p.onScoreMin(Number(e.target.value))} aria-label="Minimum risk score" />
      </div>

      <label className="fb-sort">Sort
        <select value={p.sort} onChange={(e) => p.onSort(e.target.value as SortKey)}>
          {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </label>

      <details className="fb-pop">
        <summary>Saved views{p.views.length > 0 && <span className="fb-count">{p.views.length}</span>}<Chevron /></summary>
        <div className="fb-menu">
          {p.views.length === 0 && <div className="fb-empty">No saved views yet</div>}
          {p.views.map((v) => (
            <div key={v.name} className="fb-view">
              <button className="fb-view-apply" onClick={() => p.onApplyView(v)}>{v.name}</button>
              <button className="fb-view-del" onClick={() => p.onDeleteView(v.name)} aria-label={`Delete ${v.name}`}><Close /></button>
            </div>
          ))}
          <button className="fb-save" onClick={saveView}>+ Save current filters</button>
        </div>
      </details>

      <span className="spacer" />
      {p.activeAdvanced > 0 && (
        <button className="fb-clear" onClick={p.onClear}>Clear filters ({p.activeAdvanced})</button>
      )}
    </div>
  )
}
