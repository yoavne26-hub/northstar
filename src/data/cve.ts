// CVE-trend data — integration inspired by the "Prioritization Crisis" project.
// The thesis: too many CVEs to patch them all; CVSS severity over-flags; only a
// sliver of "critical" CVEs are actually exploited (CISA KEV) — so you need
// runtime-aware prioritization (what Northstar's tunable risk score does).

export interface YearCount { year: number; count: number }
export interface YearShare { year: number; pct: number }       // % High+Critical
export interface BacklogYear { year: number; scored: number; unscored: number }
export interface MoneyPoint { id: string; cvss: number; epss: number; kev: boolean }
export type Res24Verdict = 'PRIORITIZE' | 'MONITOR' | 'DEFER'

/** Customer runtime/business context applied after public-signal scoring. */
export interface RuntimeCtx {
  running: boolean
  internetExposed: boolean
  reachable: boolean
  privileged: boolean
  sensitive: boolean
  identityRisk: boolean
  attackPaths: number
  criticality: 'Low' | 'Medium' | 'High' | 'Critical'
}

export interface TopCve {
  cve: string; product: string; cvss: number; epss: number; kev: boolean; runtime: boolean; note: string
  ctx: RuntimeCtx
  res24: number          // 0–100, customer-contextual 24h exploitation likelihood
  verdict: Res24Verdict
}

const clip = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
const logit = (p: number) => { const c = clip(p, 0.001, 0.999); return Math.log(c / (1 - c)) }
const businessAdj = (c: string) => ({ low: 0, medium: 0.2, high: 0.45, critical: 0.7 }[c.toLowerCase()] ?? 0.2)

/** RES-24 (ported from the CVE-Trend project): a public-signal base score
 *  adjusted by runtime/business context in log-odds space, then a verdict. */
export function computeRes24(cvss: number, epss: number, kev: boolean, ctx: RuntimeCtx): { score: number; verdict: Res24Verdict } {
  const base = clip(0.5 * Math.sqrt(clip(epss)) + 0.25 * (kev ? 1 : 0) + 0.2 * clip(cvss / 10), 0.001, 0.999)
  const paths = Math.max(0, Math.min(10, ctx.attackPaths))
  let adj =
    0.9 * (ctx.running ? 1 : 0) +           // is_running + loaded_at_runtime
    0.7 * (ctx.internetExposed ? 1 : 0) +
    0.7 * (ctx.reachable ? 1 : 0) +
    0.45 * (ctx.privileged ? 1 : 0) +
    0.45 * (ctx.sensitive ? 1 : 0) +
    0.5 * (ctx.identityRisk ? 1 : 0) +
    0.6 * (paths / 10) +
    businessAdj(ctx.criticality)
  if (ctx.running) adj += 0.35
  if (ctx.internetExposed && ctx.reachable) adj += 0.5
  if (ctx.privileged && ctx.sensitive) adj += 0.45
  if (!ctx.running) adj -= 0.7
  if (!ctx.internetExposed && !ctx.reachable) adj -= 0.8
  const score = clip(sigmoid(logit(base) + adj))
  const verdict: Res24Verdict = score >= 0.7 ? 'PRIORITIZE' : score >= 0.35 ? 'MONITOR' : 'DEFER'
  return { score: Math.round(score * 100), verdict }
}

// 1) The Flood — CVE publication volume keeps growing.
export const CVE_VOLUME: YearCount[] = [
  { year: 2016, count: 6447 }, { year: 2017, count: 14645 }, { year: 2018, count: 16511 },
  { year: 2019, count: 17344 }, { year: 2020, count: 18352 }, { year: 2021, count: 20155 },
  { year: 2022, count: 25068 }, { year: 2023, count: 28902 }, { year: 2024, count: 40009 },
  { year: 2025, count: 48201 },
]

// 2) It's Accelerating — rising High+Critical share of all CVEs.
export const HIGH_CRIT_SHARE: YearShare[] = [
  { year: 2016, pct: 38 }, { year: 2018, pct: 44 }, { year: 2020, pct: 49 },
  { year: 2022, pct: 55 }, { year: 2024, pct: 58 }, { year: 2025, pct: 61 },
]

// 4) Scoring Is Breaking — NVD enrichment backlog since 2024.
export const BACKLOG: BacklogYear[] = [
  { year: 2021, scored: 19500, unscored: 655 }, { year: 2022, scored: 24100, unscored: 968 },
  { year: 2023, scored: 27800, unscored: 1102 }, { year: 2024, scored: 21800, unscored: 18209 },
  { year: 2025, scored: 19400, unscored: 28801 },
]

// 3) The Money Chart — CVSS × EPSS, colored by whether it's actually exploited (KEV).
// Deterministically generated so the scatter is stable across reloads.
function buildMoneyPoints(n: number): MoneyPoint[] {
  let seed = 1337
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
  const pts: MoneyPoint[] = []
  for (let i = 0; i < n; i++) {
    const cvss = Math.round((3 + rnd() * 7) * 10) / 10            // 3.0–10.0
    // EPSS is heavily skewed low; most CVEs are unlikely to be exploited.
    const epss = Math.round(Math.pow(rnd(), 3) * 100) / 100        // 0–1, skewed low
    // KEV (actually exploited) is rare and correlates with high EPSS.
    const kev = epss > 0.6 && rnd() > 0.35
    pts.push({ id: `pt-${i}`, cvss, epss, kev })
  }
  return pts
}
export const MONEY_POINTS: MoneyPoint[] = buildMoneyPoints(160)

// Top movers — the few that actually matter. RES-24 fuses public signals with
// runtime context, so a scary CVE that isn't running in your env can still DEFER.
interface RawCve { cve: string; product: string; cvss: number; epss: number; kev: boolean; note: string; ctx: RuntimeCtx }

const RAW_CVES: RawCve[] = [
  { cve: 'CVE-2021-44228', product: 'Apache Log4j', cvss: 10.0, epss: 0.97, kev: true, note: 'Log4Shell — RCE, mass-exploited',
    ctx: { running: true, internetExposed: true, reachable: true, privileged: false, sensitive: true, identityRisk: false, attackPaths: 6, criticality: 'Critical' } },
  { cve: 'CVE-2024-3094', product: 'XZ Utils', cvss: 10.0, epss: 0.62, kev: true, note: 'Supply-chain backdoor — not loaded here',
    ctx: { running: false, internetExposed: false, reachable: false, privileged: false, sensitive: false, identityRisk: false, attackPaths: 0, criticality: 'Medium' } },
  { cve: 'CVE-2023-23397', product: 'MS Outlook', cvss: 9.8, epss: 0.94, kev: true, note: 'Privilege escalation, in the wild',
    ctx: { running: true, internetExposed: false, reachable: false, privileged: true, sensitive: true, identityRisk: true, attackPaths: 3, criticality: 'High' } },
  { cve: 'CVE-2022-1388', product: 'F5 BIG-IP', cvss: 9.8, epss: 0.96, kev: true, note: 'Auth bypass RCE — edge-facing',
    ctx: { running: true, internetExposed: true, reachable: true, privileged: true, sensitive: false, identityRisk: false, attackPaths: 5, criticality: 'Critical' } },
  { cve: 'CVE-2023-34362', product: 'MOVEit Transfer', cvss: 9.8, epss: 0.95, kev: true, note: 'Cl0p exfiltration — not deployed',
    ctx: { running: false, internetExposed: true, reachable: false, privileged: false, sensitive: true, identityRisk: false, attackPaths: 1, criticality: 'Medium' } },
  { cve: 'CVE-2021-34527', product: 'Windows Print Spooler', cvss: 8.8, epss: 0.93, kev: true, note: 'PrintNightmare — internal only',
    ctx: { running: true, internetExposed: false, reachable: false, privileged: true, sensitive: false, identityRisk: false, attackPaths: 2, criticality: 'Medium' } },
]

export const TOP_CVES: TopCve[] = RAW_CVES.map((c) => {
  const { score, verdict } = computeRes24(c.cvss, c.epss, c.kev, c.ctx)
  return { ...c, runtime: c.ctx.running, res24: score, verdict }
})

export const RES24_COLOR: Record<Res24Verdict, string> = {
  PRIORITIZE: '#E04A3B', MONITOR: '#E6A23C', DEFER: '#1BA88A',
}

export const CVE_STATS = {
  total: 355775,
  thisYear: 48201,
  perDay: 132,
  forecastNextYear: 57800,
  kevShare: 4.1,         // % of all CVEs ever added to KEV
  criticalExploited: 5,  // % of "Critical" CVEs that are actually exploited
}
