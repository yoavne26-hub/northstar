import type { Issue } from '../data/mockData'

export type FactorKey = 'severity' | 'deviation' | 'exposure' | 'assetCriticality' | 'confidence'

export type RiskWeights = Record<FactorKey, number>

export interface FactorMeta { key: FactorKey; label: string; desc: string }

export const FACTORS: FactorMeta[] = [
  { key: 'severity', label: 'Action severity', desc: 'How dangerous the detected action is on its own.' },
  { key: 'deviation', label: 'Behavioral deviation', desc: 'How far this strays from the learned baseline.' },
  { key: 'exposure', label: 'Internet exposure', desc: 'Whether the affected asset is reachable from the internet.' },
  { key: 'assetCriticality', label: 'Asset criticality', desc: 'How important the affected resource/environment is.' },
  { key: 'confidence', label: 'Detection confidence', desc: 'How sure the engine is this is a true positive.' },
]

export const DEFAULT_WEIGHTS: RiskWeights = {
  severity: 30, deviation: 25, exposure: 20, assetCriticality: 15, confidence: 10,
}

export interface Preset { name: string; desc: string; weights: RiskWeights }
export const PRESETS: Preset[] = [
  { name: 'Balanced', desc: 'A bit of everything.', weights: { severity: 30, deviation: 25, exposure: 20, assetCriticality: 15, confidence: 10 } },
  { name: 'Severity-first', desc: 'Most dangerous actions float to the top.', weights: { severity: 55, deviation: 15, exposure: 12, assetCriticality: 10, confidence: 8 } },
  { name: 'Exposure-first', desc: 'Prioritize internet-facing risk.', weights: { severity: 18, deviation: 14, exposure: 45, assetCriticality: 18, confidence: 5 } },
  { name: 'Anomaly hunter', desc: 'Chase the weird — reward deviation.', weights: { severity: 18, deviation: 50, exposure: 14, assetCriticality: 8, confidence: 10 } },
  { name: 'Blast-radius', desc: 'Protect the crown jewels first.', weights: { severity: 20, deviation: 15, exposure: 18, assetCriticality: 42, confidence: 5 } },
  { name: 'Low false-positive', desc: 'Trust high-confidence detections.', weights: { severity: 22, deviation: 18, exposure: 15, assetCriticality: 10, confidence: 35 } },
]

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
const has = (s: string, ...needles: string[]) => needles.some((n) => s.toLowerCase().includes(n))

/** Derive 0–100 sub-scores for each factor from an issue's intrinsic properties. */
export function deriveFactors(it: Issue): RiskWeights {
  const whyText = it.why.map((w) => w.label).join(' ').toLowerCase()
  const scopeText = it.scope.map((s) => s.label).join(' ').toLowerCase()
  const dangerCount = it.why.filter((w) => w.danger).length

  const severity = it.severity === 'critical' ? 96 : it.severity === 'high' ? 74 : 50

  let devPct: number
  if (it.deviation === 'NEW') devPct = 100
  else { const m = it.deviation.match(/(\d+)%/); devPct = m ? Number(m[1]) : 25 }
  const deviation = clamp(40 + devPct / 3)

  const exposed = has(whyText, 'internet', 'exposed', 'public', 'malicious', 'tor', 'egress', 'external', '0.0.0.0')
    || has(scopeText, '0.0.0.0', '→')
  const exposure = clamp(exposed ? 92 : it.environment.includes('prod') ? 60 : 38)

  let asset = it.environment.includes('prod') ? 88 : it.environment.includes('staging') ? 52 : 45
  if (has(whyText, 'critical') || has(scopeText, 'payments', 'pii', 'admin')) asset += 8
  const assetCriticality = clamp(asset)

  let conf = 52 + dangerCount * 15
  if (it.flag === 'attention') conf += 6
  const confidence = clamp(conf)

  return { severity, deviation, exposure, assetCriticality, confidence }
}

// Verdict derived from a 0–100 risk score, using the RES-24 thresholds
// (PRIORITIZE ≥70 · MONITOR ≥35 · DEFER) so the dashboard and CVE models agree.
export type Verdict = 'PRIORITIZE' | 'MONITOR' | 'DEFER'
export const VERDICT_COLOR: Record<Verdict, string> = {
  PRIORITIZE: '#E04A3B', MONITOR: '#E6A23C', DEFER: '#1BA88A',
}
export function verdictFromScore(score: number): Verdict {
  return score >= 70 ? 'PRIORITIZE' : score >= 35 ? 'MONITOR' : 'DEFER'
}

/** Weighted 0–100 risk score for an issue given the user's factor weights. */
export function computeRisk(it: Issue, w: RiskWeights): number {
  const f = deriveFactors(it)
  const total = w.severity + w.deviation + w.exposure + w.assetCriticality + w.confidence || 1
  const score =
    (f.severity * w.severity + f.deviation * w.deviation + f.exposure * w.exposure
      + f.assetCriticality * w.assetCriticality + f.confidence * w.confidence) / total
  return clamp(score)
}
