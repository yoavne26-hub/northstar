import './redblue.css'
import { useMemo, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import {
  SCENARIOS, PHASES, generateDataset, scanDataset,
  type Row, type Phase, type Scenario, type ScanResult, type Band,
} from '../data/redblue'

const BAND_COLOR: Record<Band, string> = { HIGH: '#E04A3B', GRAY: '#E6A23C', LOW: '#8A92A8' }

// ---------- RED TEAM ----------
function PhaseMix({ scn }: { scn: Scenario }): JSX.Element {
  const max = Math.max(...PHASES.map((p) => scn.mix[p.key]))
  return (
    <div className="rb-mix">
      {PHASES.map((p) => (
        <div className="rb-mixrow" key={p.key}>
          <span className="rb-mixlbl">{p.label}</span>
          <div className="rb-mixbar"><i style={{ width: `${(scn.mix[p.key] / max) * 100}%` }} /></div>
          <span className="rb-mixval num">{scn.mix[p.key]}</span>
        </div>
      ))}
    </div>
  )
}

function RedPanel({ scenarioKey, setScenarioKey, dataset, regenerate }: {
  scenarioKey: string; setScenarioKey: (k: string) => void; dataset: Row[]; regenerate: () => void
}): JSX.Element {
  const scn = SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[0]
  const mal = dataset.filter((r) => r.label === 'malicious')
  const benign = dataset.length - mal.length
  const byPhase = (ph: Phase) => mal.filter((m) => m.phase === ph)

  return (
    <div className="rb-body">
      <div className="rb-intro red">
        <div>
          <h2>AttackGen — adversary simulator</h2>
          <p>Pick a scenario. The engine builds a weighted kill chain — exactly <b>20 malicious</b> commands hidden in benign noise — then hands the labeled dataset to the Blue tab.</p>
        </div>
      </div>

      <div className="rb-scenarios">
        {SCENARIOS.map((s) => (
          <button key={s.key} className={`rb-scn${s.key === scenarioKey ? ' on' : ''}`} onClick={() => setScenarioKey(s.key)}>
            <span className="rb-scn-name">{s.label}</span>
            <span className="rb-scn-desc">{s.desc}</span>
          </button>
        ))}
      </div>

      <div className="rb-grid">
        <div className="panel">
          <div className="ph"><div className="t">Kill-chain weighting · {scn.label}</div><div className="s">malicious mix (Σ = 20)</div></div>
          <PhaseMix scn={scn} />
          <button className="rb-gen" onClick={regenerate}>⟳ Generate new dataset</button>
        </div>
        <div className="panel">
          <div className="ph"><div className="t">Attack narrative</div><div className="s">what the operator did</div></div>
          <p className="rb-story">{scn.story}</p>
          <div className="rb-stats">
            <div className="rb-stat red"><span className="num">{mal.length}</span><span>malicious</span></div>
            <div className="rb-stat"><span className="num">{benign}</span><span>benign noise</span></div>
            <div className="rb-stat"><span className="num">{dataset.length}</span><span>total rows</span></div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="ph"><div className="t">Malicious commands by phase</div><div className="s">Red Team ground truth</div></div>
        <div className="rb-phases">
          {PHASES.map((p) => {
            const cmds = byPhase(p.key)
            if (!cmds.length) return null
            return (
              <div className="rb-phase" key={p.key}>
                <div className="rb-phase-h">{p.label} <span className="num">{cmds.length}</span></div>
                {cmds.map((c) => (
                  <div className="rb-cmd" key={c.id}><span className="rb-tech num">{c.technique}</span><code>{c.command}</code></div>
                ))}
              </div>
            )
          })}
        </div>
        <p className="rb-hint">→ Switch to the <b>Blue Team</b> tab — SENTRY will scan this exact dataset and try to find all 20.</p>
      </div>
    </div>
  )
}

// ---------- BLUE TEAM ----------
function BluePanel({ result }: { result: ScanResult }): JSX.Element {
  const flagged = result.scored.filter((s) => s.band !== 'LOW')
  const missedRows = result.scored.filter((s) => s.row.label === 'malicious' && s.band === 'LOW')

  return (
    <div className="rb-body">
      <div className="rb-intro blue">
        <div>
          <h2>SENTRY — detection engine</h2>
          <p>A deterministic pass scores every command against <b>{PHASES.length ? 28 : 0} patterns</b> grounded in MITRE ATT&amp;CK, LOLBAS &amp; GTFOBins. Bands: <span className="rb-band" style={{ color: BAND_COLOR.HIGH }}>HIGH</span> <span className="rb-band" style={{ color: BAND_COLOR.GRAY }}>GRAY</span> <span className="rb-band" style={{ color: BAND_COLOR.LOW }}>LOW</span>.</p>
        </div>
      </div>

      <div className="rb-score">
        <div className="rb-scorebig">
          <div className={`rb-rate ${result.detectionRate >= 80 ? 'good' : result.detectionRate >= 50 ? 'mid' : 'bad'}`}>
            <span className="num">{result.detectionRate}%</span><span>detection rate</span>
          </div>
        </div>
        <div className="rb-stat"><span className="num">{result.caughtHigh}</span><span>confirmed (HIGH)</span></div>
        <div className="rb-stat"><span className="num">{result.caughtGray}</span><span>needs review (GRAY)</span></div>
        <div className="rb-stat bad"><span className="num">{result.missed}</span><span>missed by rules</span></div>
        <div className="rb-stat warn"><span className="num">{result.falsePositives}</span><span>false positives</span></div>
      </div>

      <div className="panel">
        <div className="ph"><div className="t">Confirmed by rules</div><div className="s">{flagged.length} flagged · sorted by risk</div></div>
        <table className="rb-table">
          <thead><tr><th>Risk</th><th>Band</th><th>Command</th><th>MITRE</th><th>Ground truth</th></tr></thead>
          <tbody>
            {flagged.map((s) => (
              <tr key={s.row.id}>
                <td className="num rb-risk" style={{ color: BAND_COLOR[s.band] }}>{s.score.toFixed(2)}</td>
                <td><span className="rb-bandpill" style={{ color: BAND_COLOR[s.band], borderColor: `${BAND_COLOR[s.band]}55`, background: `${BAND_COLOR[s.band]}14` }}>{s.band}</span></td>
                <td className="rb-cmdcell"><span className="rb-proc num">{s.row.process}</span><code>{s.row.command}</code></td>
                <td className="num rb-mitre">{s.technique ?? '—'}</td>
                <td>{s.row.label === 'malicious'
                  ? <span className="rb-truth tp">✓ malicious</span>
                  : <span className="rb-truth fp">✗ false positive</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {missedRows.length > 0 && (
        <div className="panel rb-missed">
          <div className="ph"><div className="t">Missed by deterministic rules</div><div className="s">{missedRows.length} — where SENTRY's AI pass + correlation earn their keep</div></div>
          {missedRows.map((s) => (
            <div className="rb-cmd" key={s.row.id}><span className="rb-tech num">{s.row.technique}</span><code>{s.row.command}</code></div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- PAGE ----------
export function RedBluePage(): JSX.Element {
  const [tab, setTab] = useState<'red' | 'blue'>('red')
  const [scenarioKey, setScenarioKey] = useState('ransomware')
  const [seed, setSeed] = useState(42)
  const dataset = useMemo(() => generateDataset(scenarioKey, seed), [scenarioKey, seed])
  const result = useMemo(() => scanDataset(dataset), [dataset])

  return (
    <AppShell title="Red vs Blue" crumb="Northstar · Adversary simulation & detection">
      <div className="content">
        <div className="rb-tabs">
          <button className={`rb-tab red${tab === 'red' ? ' on' : ''}`} onClick={() => setTab('red')}>
            <span className="rb-dot" /> Red Team <span className="rb-tagline">attack</span>
          </button>
          <button className={`rb-tab blue${tab === 'blue' ? ' on' : ''}`} onClick={() => setTab('blue')}>
            <span className="rb-dot" /> Blue Team <span className="rb-tagline">defend</span>
          </button>
        </div>

        {tab === 'red'
          ? <RedPanel scenarioKey={scenarioKey} setScenarioKey={setScenarioKey} dataset={dataset} regenerate={() => setSeed((s) => s + 1)} />
          : <BluePanel result={result} />}
      </div>
    </AppShell>
  )
}
