import { useState, type MouseEvent } from 'react'
import type { Issue } from '../../data/mockData'
import { useSettings } from '../../settings/SettingsContext'
import { FACTORS, deriveFactors, PRESETS } from '../../lib/risk'
import { Info } from '../../lib/icons'

/** An "i" button next to a risk score that opens a small popover to inspect
 *  the factor breakdown and tune the global risk weights inline. */
export function RiskInfoPopover({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false)
  const { settings, setWeight, applyWeights } = useSettings()
  const factors = deriveFactors(issue)
  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <span className="riskinfo" onClick={stop}>
      <button className="ri-btn" aria-label="Explain & tune risk score" onClick={() => setOpen((o) => !o)}>
        <Info />
      </button>
      {open && (
        <>
          <div className="ri-backdrop" onClick={() => setOpen(false)} />
          <div className="ri-pop" role="dialog" aria-label="Risk score breakdown">
            <div className="ri-head">
              <div>
                <div className="ri-title">Risk {issue.score}</div>
                <div className="ri-sub">factor × your weight</div>
              </div>
              <span className="ri-mitre num">{issue.mitre}</span>
            </div>

            <div className="ri-presets">
              {PRESETS.slice(0, 4).map((p) => (
                <button key={p.name} className="ri-preset" title={p.desc} onClick={() => applyWeights(p.weights)}>{p.name}</button>
              ))}
            </div>

            {FACTORS.map((f) => (
              <div className="ri-factor" key={f.key}>
                <div className="ri-frow">
                  <span className="ri-flabel">{f.label}</span>
                  <span className="ri-fval num">{factors[f.key]}</span>
                </div>
                <div className="ri-bar"><i style={{ width: `${factors[f.key]}%` }} /></div>
                <div className="ri-wrow">
                  <span className="ri-wlbl">weight</span>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={settings.riskWeights[f.key]}
                    onChange={(e) => setWeight(f.key, Number(e.target.value))}
                    aria-label={`${f.label} weight`}
                  />
                  <span className="ri-wval num">{settings.riskWeights[f.key]}</span>
                </div>
              </div>
            ))}

            <div className="ri-foot">Changes re-rank every issue · saved to your profile</div>
          </div>
        </>
      )}
    </span>
  )
}
