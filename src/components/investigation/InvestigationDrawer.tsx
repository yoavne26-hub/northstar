import { useEffect } from 'react'
import type { Issue, Status } from '../../data/mockData'
import { SEV_CLASS } from '../../data/mockData'
import { scopeIcon, Info, Cube, Doc, Clock, Close, Bolt } from '../../lib/icons'
import { verdictFromScore } from '../../lib/risk'

interface Props {
  issue: Issue | null
  actedLabel?: Status
  onClose: () => void
  onAct: (id: number, label: Status) => void
}

const FOOTER: { label: Status; cls?: string }[] = [
  { label: 'Acknowledged' },
  { label: 'Monitoring' },
  { label: 'Opened incident' },
  { label: 'Dismissed', cls: 'danger' },
]

export function InvestigationDrawer({ issue, actedLabel, onClose, onAct }: Props) {
  useEffect(() => {
    if (!issue) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [issue, onClose])

  const act = (label: Status) => {
    if (!issue) return
    if (label === 'Dismissed' && !window.confirm('Dismiss this issue? This is a high-impact action.')) return
    onAct(issue.id, label)
    onClose()
  }

  const sc = issue ? SEV_CLASS[issue.severity] : 'c'
  const scopeLabel = (k: string) => (k === 'cube' ? 'Resource' : k === 'user' ? 'Identity' : 'Location')

  return (
    <>
      <div className={`scrim${issue ? ' show' : ''}`} onClick={onClose} />
      <aside className={`drawer${issue ? ' show' : ''}`} aria-hidden={!issue} aria-label="Investigation">
        {issue && (
          <>
            <div className="dhead">
              <div className="dtop">
                <span className={`sev ${sc}`}>{issue.severity.toUpperCase()}</span>
                <span className={`verdict v-${verdictFromScore(issue.score).toLowerCase()}`}>{verdictFromScore(issue.score)}</span>
                <span className="status">{actedLabel ?? issue.status}</span>
                <button className="dclose" onClick={onClose} aria-label="Close"><Close /></button>
              </div>
              <h2>{issue.title}</h2>
              <div className="dmeta">
                <span className="num">Risk {issue.score}</span>
                <span className="num">{issue.mitre}</span>
                <span>{issue.deviation}</span>
                <span>{issue.time}</span>
              </div>
            </div>

            <div className="dbody">
              <div className="sec">
                <div className="st"><Info />Why this is abnormal</div>
                <div className="reason">{issue.reason}</div>
              </div>

              <div className="sec">
                <div className="st"><Cube />Scope &amp; blast radius</div>
                <div className="kv2">
                  {issue.scope.map((s, i) => (
                    <div className="cell" key={i}><div className="l">{scopeLabel(s.kind)}</div><div className="v">{s.label}</div></div>
                  ))}
                  <div className="cell"><div className="l">Environment</div><div className="v">{issue.environment}</div></div>
                </div>
              </div>

              <div className="sec">
                <div className="st"><Doc />Evidence</div>
                <div className="evlist">
                  {issue.evidence.map((e, i) => {
                    const Icon = scopeIcon[e.kind]
                    return (
                      <div className="ev" key={i}>
                        <div className="eic"><Icon /></div>
                        <div><div className="et">{e.type}</div><div className="ed">{e.detail}</div></div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="sec">
                <div className="st"><Clock />Timeline</div>
                <div className="tl">
                  {issue.timeline.map((t, i) => (
                    <div className={`te${t.critical ? ' crit' : ''}`} key={i}>
                      <div className="tt">{t.label}</div><div className="td">{t.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dfoot">
              <div className="afull">
                <button className="abtn pri" onClick={() => act('Escalated')}><Bolt />Escalate</button>
                <button className="abtn" onClick={() => act('Assigned')}>Assign</button>
              </div>
              {FOOTER.map((f) => (
                <button key={f.label} className={`abtn${f.cls ? ' ' + f.cls : ''}`} onClick={() => act(f.label)}>{f.label}</button>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
