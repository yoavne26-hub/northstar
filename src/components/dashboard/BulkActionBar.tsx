import type { Status } from '../../data/mockData'

interface Props {
  count: number
  onAct: (label: Status) => void
  onClear: () => void
}

export function BulkActionBar({ count, onAct, onClear }: Props) {
  return (
    <div className={`bulk${count > 0 ? ' show' : ''}`}>
      <span className="cnt"><span className="num">{count}</span> selected</span>
      <button className="bbtn" onClick={() => onAct('Acknowledged')}>Acknowledge</button>
      <button className="bbtn" onClick={() => onAct('Assigned')}>Assign ▾</button>
      <button className="bbtn esc" onClick={() => onAct('Escalated')}>Escalate</button>
      <button className="bbtn" onClick={() => onAct('Monitoring')}>Monitor</button>
      <button className="x" onClick={onClear} aria-label="Clear selection">✕</button>
    </div>
  )
}
