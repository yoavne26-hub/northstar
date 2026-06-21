export type Severity = 'critical' | 'high' | 'medium'
export type Status =
  | 'New' | 'Investigating' | 'Assigned' | 'Monitoring' | 'Resolved' | 'Dismissed'
  | 'Acknowledged' | 'Escalated' | 'Opened incident'
export type ScopeKind = 'globe' | 'user' | 'cube'

export interface WhyFactor { label: string; danger: boolean }
export interface ScopeItem { kind: ScopeKind; label: string }
export interface EvidenceItem { kind: ScopeKind; type: string; detail: string }
export interface TimelineItem { label: string; time: string; critical: boolean }

export interface Issue {
  id: number
  rank: string
  severity: Severity
  title: string
  score: number
  deviation: string
  environment: string
  status: Status
  flag: 'attention' | null
  time: string
  mitre: string
  why: WhyFactor[]
  scope: ScopeItem[]
  reason: string
  evidence: EvidenceItem[]
  timeline: TimelineItem[]
}

export interface Kpi {
  label: string
  value: string
  tone: 'good' | 'critical' | 'warning' | 'neutral'
  sub: string
  subTone?: 'good' | 'critical' | null
  icon: 'pulse' | 'alert' | 'bars' | 'clock'
}

export const ISSUES: Issue[] = [
  {
    id: 1, rank: '#1', severity: 'critical', title: 'Reverse shell spawned from payments container',
    score: 96, deviation: '+140% WoW', environment: 'eks-prod-use1', status: 'New', flag: 'attention',
    time: '2m ago', mitre: 'T1059.004',
    why: [{ label: 'Active exploitation', danger: true }, { label: 'Internet-exposed workload', danger: true }, { label: 'C2 to known-malicious IP', danger: true }],
    scope: [{ kind: 'cube', label: 'payments-api-7f9c4b' }, { kind: 'user', label: 'www-data' }, { kind: 'globe', label: 'us-east-1 · ns/payments' }],
    reason: 'www-data spawned /bin/sh with a socket connected to 185.220.101.45 — a process tree never seen in 30 days of baseline for this workload. The container image defines no shell entrypoint.',
    evidence: [
      { kind: 'cube', type: 'Process exec', detail: 'sh -i → connect() 185.220.101.45:443' },
      { kind: 'globe', type: 'Network', detail: 'outbound TLS to known-malicious IP (Tor exit)' },
      { kind: 'user', type: 'Identity', detail: 'www-data · no interactive shell in baseline' },
      { kind: 'cube', type: 'File', detail: '/tmp/.x dropped 4s before exec' },
    ],
    timeline: [
      { label: 'HTTP POST to /upload — oversized payload', time: '14:02:11', critical: true },
      { label: 'Worker process forks /bin/sh', time: '14:02:14', critical: true },
      { label: 'Outbound connect to 185.220.101.45:443', time: '14:02:15', critical: true },
      { label: 'Northstar detection fired', time: '14:02:17', critical: false },
    ],
  },
  {
    id: 2, rank: '#2', severity: 'critical', title: 'AssumeRole → AdminAccess, impossible travel',
    score: 93, deviation: '+85% WoW', environment: 'aws-prod', status: 'New', flag: 'attention',
    time: '8m ago', mitre: 'T1078.004',
    why: [{ label: 'Impossible travel', danger: true }, { label: 'Privilege escalation to admin', danger: true }, { label: 'No MFA', danger: false }],
    scope: [{ kind: 'user', label: 'role/payments-exec' }, { kind: 'globe', label: 'eu-west-1 ← us-east-1' }, { kind: 'cube', label: '482 perms' }],
    reason: 'role/payments-exec assumed AdminAccess from eu-west-1 four minutes after activity in us-east-1 — geographically impossible. The role has never assumed admin in baseline.',
    evidence: [
      { kind: 'user', type: 'Identity', detail: 'role/payments-exec · STS AssumeRole AdminAccess' },
      { kind: 'globe', type: 'Network', detail: 'source 91.219.x (eu-west-1) · prior 13.59.x (us-east-1)' },
      { kind: 'cube', type: 'Grant', detail: '482 permissions, incl. iam:*, s3:*' },
    ],
    timeline: [
      { label: 'Console login us-east-1', time: '13:54:02', critical: false },
      { label: 'AssumeRole AdminAccess from eu-west-1', time: '13:58:40', critical: true },
      { label: 'ListBuckets + GetSecretValue ×12', time: '13:59:05', critical: true },
      { label: 'Northstar detection fired', time: '13:59:20', critical: false },
    ],
  },
  {
    id: 3, rank: '#3', severity: 'critical', title: 'Credential access: /etc/shadow read by nginx',
    score: 90, deviation: '+60% WoW', environment: 'eks-prod-use1', status: 'Investigating', flag: null,
    time: '22m ago', mitre: 'T1003.008',
    why: [{ label: 'Credential dumping', danger: true }, { label: 'Process deviates from baseline', danger: true }],
    scope: [{ kind: 'cube', label: 'web-frontend-5d8b9' }, { kind: 'user', label: 'nginx' }, { kind: 'globe', label: 'ns/checkout' }],
    reason: 'The nginx process opened /etc/shadow — a file it never reads in baseline. Indicates post-exploitation credential access.',
    evidence: [
      { kind: 'cube', type: 'File', detail: 'open(/etc/shadow, O_RDONLY) by nginx' },
      { kind: 'user', type: 'Identity', detail: 'uid=0 escalation from www-data' },
    ],
    timeline: [
      { label: 'nginx worker anomalous fork', time: '13:40:10', critical: true },
      { label: 'read /etc/shadow', time: '13:40:12', critical: true },
      { label: 'Northstar detection fired', time: '13:40:15', critical: false },
    ],
  },
  {
    id: 4, rank: '#4', severity: 'high', title: 'Cryptominer (XMRig) executing on EKS node',
    score: 84, deviation: '+45% WoW', environment: 'eks-staging-use1', status: 'Investigating', flag: null,
    time: '15m ago', mitre: 'T1496',
    why: [{ label: 'Untrusted binary', danger: true }, { label: 'CPU 6.4× baseline', danger: false }, { label: 'Spreading laterally', danger: false }],
    scope: [{ kind: 'cube', label: 'node ip-10-0-3-217' }, { kind: 'globe', label: '12 pods' }],
    reason: 'An unsigned binary matching XMRig signatures is consuming 6.4× baseline CPU across 12 pods on the node.',
    evidence: [
      { kind: 'cube', type: 'Process', detail: 'xmrig --donate-level 1 -o pool.x' },
      { kind: 'globe', type: 'Network', detail: 'stratum+tcp to mining pool' },
    ],
    timeline: [
      { label: 'Unknown image pulled', time: '13:30:00', critical: false },
      { label: 'xmrig exec', time: '13:31:20', critical: true },
      { label: 'CPU spike 6.4×', time: '13:32:00', critical: false },
    ],
  },
  {
    id: 5, rank: '#5', severity: 'high', title: '4.2 GB egress to Tor exit 185.220.101.45',
    score: 80, deviation: '+30% WoW', environment: 'eks-prod-use1', status: 'New', flag: 'attention',
    time: '31m ago', mitre: 'T1048.003',
    why: [{ label: 'Known-malicious destination', danger: true }, { label: 'Volume 22× baseline', danger: false }, { label: 'Off-hours', danger: false }],
    scope: [{ kind: 'cube', label: 'api-gateway-6c4f8' }, { kind: 'globe', label: '→ 185.220.101.45' }],
    reason: 'api-gateway sent 4.2 GB (22× baseline) to a known Tor exit node, off-hours. Possible data exfiltration.',
    evidence: [
      { kind: 'globe', type: 'Network', detail: '4.2 GB egress → 185.220.101.45:443' },
      { kind: 'cube', type: 'Process', detail: 'api-gateway worker' },
    ],
    timeline: [
      { label: 'Egress volume rises', time: '02:10:00', critical: false },
      { label: 'Sustained transfer 4.2 GB', time: '02:10–02:20', critical: true },
      { label: 'Northstar detection fired', time: '02:20:30', critical: false },
    ],
  },
  {
    id: 6, rank: '#6', severity: 'high', title: 'Public S3 bucket exposing PII — customer-pii-prod',
    score: 76, deviation: '+22% WoW', environment: 'aws-prod', status: 'Assigned', flag: null,
    time: '1h ago', mitre: 'T1530',
    why: [{ label: 'Internet-exposed', danger: true }, { label: 'PII at risk', danger: true }],
    scope: [{ kind: 'cube', label: 's3://customer-pii-prod' }, { kind: 'globe', label: 'us-east-1' }],
    reason: 'Bucket customer-pii-prod has a public ACL and contains PII. Internet-exposed.',
    evidence: [
      { kind: 'cube', type: 'Config', detail: 'BucketACL: public-read' },
      { kind: 'globe', type: 'Exposure', detail: 'reachable from 0.0.0.0/0' },
    ],
    timeline: [
      { label: 'Bucket policy changed', time: '12:00:00', critical: true },
      { label: 'Public access detected', time: '12:05:00', critical: false },
    ],
  },
  {
    id: 7, rank: '#7', severity: 'high', title: 'Kubernetes API anonymous access enabled',
    score: 72, deviation: '+18% WoW', environment: 'eks-staging-use1', status: 'New', flag: null,
    time: '1h ago', mitre: 'T1610',
    why: [{ label: 'Misconfiguration', danger: true }, { label: 'Cluster-wide exposure', danger: false }],
    scope: [{ kind: 'cube', label: 'clusterrolebinding/anon' }, { kind: 'globe', label: 'staging' }],
    reason: 'A ClusterRoleBinding grants system:anonymous cluster access — anyone can hit the API.',
    evidence: [{ kind: 'cube', type: 'Config', detail: 'clusterrolebinding/anon → cluster-admin' }],
    timeline: [
      { label: 'Binding created', time: '11:00:00', critical: true },
      { label: 'Anonymous request observed', time: '11:30:00', critical: false },
    ],
  },
  {
    id: 8, rank: '#8', severity: 'medium', title: 'Unsigned image from untrusted registry deployed',
    score: 60, deviation: '+12% WoW', environment: 'eks-staging-use1', status: 'Monitoring', flag: null,
    time: '2h ago', mitre: 'T1610',
    why: [{ label: 'Unverified image', danger: false }, { label: 'No signature', danger: false }],
    scope: [{ kind: 'cube', label: 'docker.io/unknown/tool' }, { kind: 'globe', label: 'ns/dev' }],
    reason: 'A pod was deployed from an unsigned image on an untrusted registry.',
    evidence: [{ kind: 'cube', type: 'Image', detail: 'docker.io/unknown/tool:latest · no signature' }],
    timeline: [{ label: 'Deploy applied', time: '10:00:00', critical: false }],
  },
  {
    id: 9, rank: '#9', severity: 'medium', title: 'Unusual API call volume from CI runner',
    score: 55, deviation: '+9% WoW', environment: 'aws-staging', status: 'Monitoring', flag: null,
    time: '3h ago', mitre: 'T1078',
    why: [{ label: '3.1× baseline', danger: false }, { label: 'Known identity', danger: false }],
    scope: [{ kind: 'user', label: 'ci-deploy-bot' }, { kind: 'globe', label: 'us-east-1' }],
    reason: 'ci-deploy-bot made 3.1× its baseline API calls — likely a noisy pipeline, low risk.',
    evidence: [{ kind: 'user', type: 'Identity', detail: 'ci-deploy-bot · 3.1× call volume' }],
    timeline: [{ label: 'Volume rises', time: '09:00:00', critical: false }],
  },
  {
    id: 10, rank: '#10', severity: 'medium', title: 'First-seen external connection from web-tier',
    score: 48, deviation: '+6% WoW', environment: 'eks-prod-use1', status: 'New', flag: null,
    time: '4h ago', mitre: 'T1071.001',
    why: [{ label: 'First-seen destination', danger: false }, { label: 'Low volume', danger: false }],
    scope: [{ kind: 'cube', label: 'web-frontend-5d8b9' }, { kind: 'globe', label: '→ 13.59.20.4' }],
    reason: 'web-frontend connected to a first-seen external IP at low volume — worth noting, low risk.',
    evidence: [{ kind: 'globe', type: 'Network', detail: '→ 13.59.20.4 · 12 KB' }],
    timeline: [{ label: 'First connection', time: '08:00:00', critical: false }],
  },
  {
    id: 11, rank: '#11', severity: 'high', title: 'Suspicious cron job added on host',
    score: 79, deviation: '+24% WoW', environment: 'aws-prod', status: 'New', flag: null,
    time: '8h ago', mitre: 'T1053.003',
    why: [{ label: 'Persistence', danger: true }, { label: 'Unexpected scheduled task', danger: false }],
    scope: [{ kind: 'cube', label: 'ip-10-2-1-44' }, { kind: 'globe', label: 'us-east-1' }],
    reason: 'A cron entry was added to spawn /opt/.sync hourly — a persistence behavior not seen in baseline.',
    evidence: [{ kind: 'cube', type: 'Process', detail: 'crontab modified → /opt/.sync' }, { kind: 'cube', type: 'File', detail: '/opt/.sync created' }],
    timeline: [{ label: 'Cron entry added', time: '06:10:00', critical: true }, { label: 'First execution', time: '07:00:00', critical: false }],
  },
  {
    id: 12, rank: '#12', severity: 'medium', title: 'IAM access key created for dormant user',
    score: 57, deviation: '+9% WoW', environment: 'aws-prod', status: 'Monitoring', flag: null,
    time: '14h ago', mitre: 'T1136.003',
    why: [{ label: 'Dormant identity', danger: false }, { label: 'New long-lived credential', danger: false }],
    scope: [{ kind: 'user', label: 'user/legacy-svc' }, { kind: 'globe', label: 'us-east-1' }],
    reason: 'A new access key was created for an identity inactive for 90 days.',
    evidence: [{ kind: 'user', type: 'Identity', detail: 'CreateAccessKey user/legacy-svc' }],
    timeline: [{ label: 'Access key created', time: 'yesterday 22:00', critical: false }],
  },
  {
    id: 13, rank: '#13', severity: 'critical', title: 'Privilege escalation via writable hostPath mount',
    score: 91, deviation: '+70% WoW', environment: 'eks-prod-euw1', status: 'New', flag: 'attention',
    time: '1d ago', mitre: 'T1611',
    why: [{ label: 'Container escape', danger: true }, { label: 'Writable host mount', danger: true }, { label: 'Critical node', danger: false }],
    scope: [{ kind: 'cube', label: 'pod/batch-runner-2' }, { kind: 'globe', label: 'eu-west-1 · ns/batch' }, { kind: 'cube', label: 'hostPath /' }],
    reason: 'A pod mounted the host root filesystem read-write and wrote to /etc — a container-escape path.',
    evidence: [{ kind: 'cube', type: 'Config', detail: 'hostPath: / (rw)' }, { kind: 'cube', type: 'File', detail: 'wrote /host/etc/cron.d/x' }],
    timeline: [{ label: 'Pod scheduled', time: '-26h', critical: false }, { label: 'Host filesystem write', time: '-25h', critical: true }],
  },
  {
    id: 14, rank: '#14', severity: 'high', title: 'Outbound DNS tunneling detected',
    score: 75, deviation: '+20% WoW', environment: 'eks-staging-use1', status: 'Investigating', flag: null,
    time: '2d ago', mitre: 'T1071.004',
    why: [{ label: 'Covert channel', danger: true }, { label: 'High-entropy queries', danger: false }],
    scope: [{ kind: 'cube', label: 'api-worker-3' }, { kind: 'globe', label: '→ DNS exfil' }],
    reason: 'Sustained high-entropy DNS queries to a single domain — classic DNS tunneling.',
    evidence: [{ kind: 'globe', type: 'Network', detail: '4,200 TXT queries to *.exfil.net' }],
    timeline: [{ label: 'Query spike', time: '-2d', critical: true }],
  },
  {
    id: 15, rank: '#15', severity: 'medium', title: 'Unusual S3 GetObject volume',
    score: 52, deviation: '+7% WoW', environment: 'aws-prod', status: 'Monitoring', flag: null,
    time: '4d ago', mitre: 'T1530',
    why: [{ label: 'Volume 4× baseline', danger: false }, { label: 'Known identity', danger: false }],
    scope: [{ kind: 'user', label: 'role/analytics' }, { kind: 'cube', label: 's3://reports' }],
    reason: 'The analytics role read 4× its baseline object volume — likely a backfill job.',
    evidence: [{ kind: 'user', type: 'Identity', detail: 'role/analytics · 18k GetObject' }],
    timeline: [{ label: 'Volume rises', time: '-4d', critical: false }],
  },
  {
    id: 16, rank: '#16', severity: 'high', title: 'New cluster-admin role binding created',
    score: 74, deviation: '+19% WoW', environment: 'eks-prod-use1', status: 'Assigned', flag: null,
    time: '9d ago', mitre: 'T1078.001',
    why: [{ label: 'Privileged binding', danger: true }, { label: 'Off-hours change', danger: false }],
    scope: [{ kind: 'cube', label: 'clusterrolebinding/ops-x' }, { kind: 'user', label: 'user/contractor' }],
    reason: 'A new binding granted cluster-admin to a contractor identity.',
    evidence: [{ kind: 'cube', type: 'Config', detail: 'clusterrolebinding ops-x → cluster-admin' }],
    timeline: [{ label: 'Binding created', time: '-9d', critical: true }],
  },
  {
    id: 17, rank: '#17', severity: 'medium', title: 'Stale public security-group rule',
    score: 49, deviation: '+5% WoW', environment: 'gke-prod-eu', status: 'New', flag: null,
    time: '21d ago', mitre: 'T1190',
    why: [{ label: 'Internet-exposed', danger: false }, { label: 'Legacy rule', danger: false }],
    scope: [{ kind: 'cube', label: 'sg-0a1b · 0.0.0.0/0:22' }, { kind: 'globe', label: 'eu-west-1' }],
    reason: 'An SSH rule open to the internet has persisted for three weeks.',
    evidence: [{ kind: 'cube', type: 'Config', detail: 'ingress 22 from 0.0.0.0/0' }],
    timeline: [{ label: 'Rule added', time: '-21d', critical: false }],
  },
]

// Parse a relative time label ("2m ago", "1d ago", "-26h", "now") to minutes-ago.
export function parseAge(time: string): number {
  if (/now/i.test(time)) return 0
  const m = time.match(/(\d+)\s*([mhdw])/i)
  if (!m) return 0
  const n = Number(m[1])
  switch (m[2].toLowerCase()) {
    case 'm': return n
    case 'h': return n * 60
    case 'd': return n * 1440
    case 'w': return n * 10080
    default: return n
  }
}

export const INCOMING_ISSUE: Issue = {
  id: 99, rank: '⚡', severity: 'critical', title: 'Container drift: unexpected binary written to /tmp',
  score: 89, deviation: 'NEW', environment: 'eks-prod-use1', status: 'New', flag: 'attention',
  time: 'now', mitre: 'T1059',
  why: [{ label: 'Just detected', danger: true }, { label: 'File-integrity violation', danger: true }],
  scope: [{ kind: 'cube', label: 'payments-worker-3a1f' }, { kind: 'globe', label: 'ns/payments' }],
  reason: 'A binary was written to /tmp and executed inside payments-worker — file-integrity violation in a critical namespace.',
  evidence: [
    { kind: 'cube', type: 'File', detail: '/tmp/.run written + chmod +x' },
    { kind: 'cube', type: 'Process', detail: '/tmp/.run executed' },
  ],
  timeline: [
    { label: 'File written to /tmp', time: 'now', critical: true },
    { label: 'Executed', time: 'now', critical: true },
  ],
}

export const KPIS: Kpi[] = [
  { label: 'System Health', value: '94%', tone: 'good', sub: '412 assets · 3 degraded', subTone: 'critical', icon: 'pulse' },
  { label: 'Open Critical', value: '3', tone: 'critical', sub: '+2 in last 3h', subTone: 'critical', icon: 'alert' },
  { label: 'Detected vs Resolved', value: '+14', tone: 'warning', sub: '38 detected · 24 resolved', subTone: null, icon: 'bars' },
  { label: 'MTTR', value: '2h 41m', tone: 'neutral', sub: '▼ 12m vs last week', subTone: 'good', icon: 'clock' },
]

export interface ContribRow { name: string; pct: number }
export const CONTRIBUTORS: ContribRow[] = [
  { name: 'eks-prod-use1', pct: 46 },
  { name: 'aws-prod', pct: 28 },
  { name: 'eks-staging-use1', pct: 19 },
  { name: 'aws-staging', pct: 7 },
]

// macro trend chart points (detected vs resolved + baseline)
export const TREND = {
  weeks: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'],
  detected: '60,180 190,156 320,40 450,92 580,108',
  resolved: '60,188 190,165 320,128 450,102 580,114',
  baseline: '60,175 190,148 320,112 450,105 580,112',
  thresholdX: 260, thresholdW: 135,
}

export const SEV_CLASS: Record<Severity, string> = { critical: 'c', high: 'h', medium: 'm' }

// --- filter option sources ---
export const ENVIRONMENTS = [...new Set(ISSUES.map((i) => i.environment))].sort()
export const STATUS_LIST: Status[] = ['New', 'Investigating', 'Assigned', 'Monitoring', 'Resolved', 'Dismissed']
export type SortKey = 'risk' | 'time' | 'severity'
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'risk', label: 'Risk score' },
  { key: 'severity', label: 'Severity' },
  { key: 'time', label: 'Most recent' },
]
export const SEVERITY_RANK: Record<Severity, number> = { critical: 3, high: 2, medium: 1 }
