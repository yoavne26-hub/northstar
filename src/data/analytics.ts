// Aggregated mock analytics for the admin dashboards.

export interface SeriesPoint { label: string; value: number }

export const RISK_OVER_TIME: SeriesPoint[] = [
  { label: 'Mon', value: 42 }, { label: 'Tue', value: 48 }, { label: 'Wed', value: 61 },
  { label: 'Thu', value: 58 }, { label: 'Fri', value: 73 }, { label: 'Sat', value: 67 }, { label: 'Sun', value: 71 },
]

export const MTTR_TREND: SeriesPoint[] = [
  { label: 'W1', value: 214 }, { label: 'W2', value: 198 }, { label: 'W3', value: 205 },
  { label: 'W4', value: 176 }, { label: 'W5', value: 161 },
] // minutes

export const DETECTIONS_BY_TACTIC: SeriesPoint[] = [
  { label: 'Execution', value: 38 },
  { label: 'Privilege Esc', value: 27 },
  { label: 'Exfiltration', value: 21 },
  { label: 'Credential Access', value: 18 },
  { label: 'Initial Access', value: 14 },
  { label: 'Persistence', value: 9 },
]

export const DETECTIONS_BY_ENV: SeriesPoint[] = [
  { label: 'eks-prod-use1', value: 46 },
  { label: 'aws-prod', value: 28 },
  { label: 'eks-staging-use1', value: 19 },
  { label: 'aws-staging', value: 7 },
]

export const SEVERITY_DIST: { label: string; value: number; color: string }[] = [
  { label: 'Critical', value: 12, color: '#E04A3B' },
  { label: 'High', value: 24, color: '#E6A23C' },
  { label: 'Medium', value: 41, color: '#D9B400' },
  { label: 'Low', value: 88, color: '#1BA88A' },
]

export interface TeamRow { team: string; open: number; mttr: string; resolution: number; risk: 'High' | 'Medium' | 'Low' }
export const TEAM_PERFORMANCE: TeamRow[] = [
  { team: 'payments-platform', open: 7, mttr: '1h 52m', resolution: 88, risk: 'High' },
  { team: 'core-api', open: 4, mttr: '2h 18m', resolution: 81, risk: 'Medium' },
  { team: 'data-platform', open: 3, mttr: '3h 04m', resolution: 74, risk: 'Medium' },
  { team: 'infra-sre', open: 2, mttr: '1h 12m', resolution: 92, risk: 'Low' },
]

export const ADMIN_KPIS = [
  { label: 'Fleet risk score', value: '71', tone: 'warning' as const, sub: '▲ 18% vs prev 24h' },
  { label: 'Open across org', value: '24', tone: 'critical' as const, sub: '7 teams affected' },
  { label: 'Avg resolution rate', value: '84%', tone: 'good' as const, sub: '▲ 6pts this month' },
  { label: 'SLA breaches', value: '2', tone: 'critical' as const, sub: 'both in payments' },
]
