import { Alert } from '../../lib/icons'

interface Props {
  criticals: number
  highs: number
  mediums: number
  total: number
  envLabel: string
  assets: number
}

export function StatusBand({ criticals, highs, mediums, total, envLabel, assets }: Props) {
  const atRisk = criticals > 0
  const verdict = atRisk ? 'At Risk' : highs > 0 ? 'Elevated' : 'Healthy'

  return (
    <div className={`band${atRisk ? '' : ' ok'}`}>
      <div className="verdict">
        <span className="vdot" />
        <div>
          <div className="vtxt">{verdict}</div>
          <div className="vsub">{envLabel} · {assets} assets monitored · updated 30s ago</div>
        </div>
      </div>
      <div className="bsep" />
      <div className="bstat">
        <div className="n num">{criticals} <b>Critical</b> · {highs} High · {mediums} Med</div>
        <div className="l">{total} in scope · need attention</div>
      </div>
      <div className="bsep" />
      <div className="bstat">
        <div className="n up num">▲ 18%</div>
        <div className="l">Risk vs prev 24h</div>
      </div>
      <div className="cta">
        {atRisk
          ? <span className="pill"><Alert />{criticals} need immediate triage</span>
          : <span className="pill ok"><Alert />No criticals in scope</span>}
      </div>
    </div>
  )
}
