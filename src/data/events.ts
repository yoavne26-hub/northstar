// SOC activity events — integration inspired by the PenguWave events console.
// RAW telemetry: the low-level activity stream that detections are *derived*
// from. Deliberately distinct from the correlated issues on the dashboard —
// individual process/network/auth/cloud signals, mostly benign, a few notable.

export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface SecurityEvent {
  id: string
  timestamp: string        // ISO
  severity: EventSeverity
  title: string
  description: string
  host: string
  ip: string
  sourceIp: string | null
  user: string | null
  tags: string[]
}

export const EVENT_SEVERITY_ORDER: EventSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
export const EVENT_SEVERITY_COLOR: Record<EventSeverity, string> = {
  CRITICAL: '#E04A3B', HIGH: '#E6A23C', MEDIUM: '#D9B400', LOW: '#1BA88A',
}

export const EVENTS: SecurityEvent[] = [
  { id: 'evt-001', timestamp: '2026-06-21T14:33:18Z', severity: 'LOW', title: 'Process executed: /usr/bin/curl', description: 'curl spawned by deploy.sh on the build agent - matches the expected CI baseline.', host: 'ci-runner-02', ip: '10.0.6.11', sourceIp: null, user: 'ci-deploy-bot', tags: ['process', 'endpoint'] },
  { id: 'evt-002', timestamp: '2026-06-21T14:31:50Z', severity: 'MEDIUM', title: 'New listening port opened (:8443)', description: 'Process java began listening on 0.0.0.0:8443 - first time observed for this workload.', host: 'payments-api-7f9c4b', ip: '10.0.3.15', sourceIp: null, user: 'app', tags: ['network', 'first-seen', 'container'] },
  { id: 'evt-003', timestamp: '2026-06-21T14:28:02Z', severity: 'HIGH', title: 'Failed sudo attempt (x5)', description: 'Five consecutive failed sudo attempts by user devops on a production host within 40 seconds.', host: 'ip-10-2-1-44', ip: '10.2.1.44', sourceIp: '10.5.5.22', user: 'devops', tags: ['authentication', 'privilege', 'endpoint'] },
  { id: 'evt-004', timestamp: '2026-06-21T14:20:41Z', severity: 'MEDIUM', title: 'Secret read from Vault', description: 'Path secret/data/payments/db read by a service token - outside the usual access window.', host: 'vault-prod', ip: '10.0.1.9', sourceIp: '10.0.3.15', user: 'sa/payments', tags: ['secrets', 'identity'] },
  { id: 'evt-005', timestamp: '2026-06-21T14:02:15Z', severity: 'LOW', title: 'Container image pulled', description: 'node:20-alpine pulled from the internal registry by the kubelet on a staging node.', host: 'ip-10-0-3-217', ip: '10.0.3.217', sourceIp: null, user: 'kubelet', tags: ['container', 'supply-chain', 'kubernetes'] },
  { id: 'evt-006', timestamp: '2026-06-21T13:55:30Z', severity: 'LOW', title: 'DNS query resolved', description: 'A records resolved for api.stripe.com - known, allow-listed destination.', host: 'web-frontend-5d8b9', ip: '10.0.3.21', sourceIp: null, user: null, tags: ['dns', 'network'] },
  { id: 'evt-007', timestamp: '2026-06-21T13:40:09Z', severity: 'MEDIUM', title: 'File permission changed: /etc/ssh', description: 'Mode of /etc/ssh/sshd_config changed to 0666 by a configuration-management run.', host: 'bastion-staging', ip: '10.0.2.10', sourceIp: null, user: 'root', tags: ['file-integrity', 'endpoint'] },
  { id: 'evt-008', timestamp: '2026-06-21T13:12:44Z', severity: 'LOW', title: 'S3 GetObject', description: 'role/analytics read 1,204 objects from s3://reports - within the daily batch baseline.', host: 'aws-prod', ip: '-', sourceIp: null, user: 'role/analytics', tags: ['cloud', 'data', 's3'] },
  { id: 'evt-009', timestamp: '2026-06-21T12:50:03Z', severity: 'MEDIUM', title: 'User added to group "deployers"', description: 'IAM user marcus.cole was added to the deployers group by an admin.', host: 'aws-prod', ip: '-', sourceIp: '13.59.20.4', user: 'user/admin', tags: ['identity', 'iam'] },
  { id: 'evt-010', timestamp: '2026-06-21T11:18:27Z', severity: 'HIGH', title: 'Kernel module loaded', description: 'An out-of-tree kernel module (nf_hook.ko) was loaded on a production node.', host: 'ip-10-0-4-88', ip: '10.0.4.88', sourceIp: null, user: 'root', tags: ['kernel', 'endpoint', 'first-seen'] },
  { id: 'evt-011', timestamp: '2026-06-21T10:42:11Z', severity: 'LOW', title: 'TLS certificate rotated', description: 'cert-manager renewed the certificate for *.northstar.internal - scheduled rotation.', host: 'eks-prod-use1', ip: '-', sourceIp: null, user: 'cert-manager', tags: ['network', 'tls'] },
  { id: 'evt-012', timestamp: '2026-06-21T09:30:55Z', severity: 'MEDIUM', title: 'SSH key added to authorized_keys', description: 'A new public key was appended to /home/deploy/.ssh/authorized_keys.', host: 'ip-10-2-1-44', ip: '10.2.1.44', sourceIp: null, user: 'deploy', tags: ['persistence', 'authentication'] },
  { id: 'evt-013', timestamp: '2026-06-21T08:05:38Z', severity: 'LOW', title: 'Scheduled task ran', description: 'The nightly backup CronJob completed successfully on the data-platform cluster.', host: 'eks-staging-use1', ip: '-', sourceIp: null, user: 'sa/backup', tags: ['scheduled', 'kubernetes'] },
  { id: 'evt-014', timestamp: '2026-06-21T06:20:14Z', severity: 'MEDIUM', title: 'Large write to /var/tmp', description: 'A 1.8 GB file was written to /var/tmp by an unknown process, then deleted 90s later.', host: 'api-worker-3', ip: '10.0.4.7', sourceIp: null, user: null, tags: ['file-integrity', 'endpoint'] },
  { id: 'evt-015', timestamp: '2026-06-20T23:11:02Z', severity: 'LOW', title: 'Outbound connection established', description: 'TCP connection to 13.59.20.4:443 from the web tier - low volume, previously seen.', host: 'web-frontend-5d8b9', ip: '10.0.3.21', sourceIp: '13.59.20.4', user: null, tags: ['network'] },
  { id: 'evt-016', timestamp: '2026-06-20T19:47:50Z', severity: 'LOW', title: 'ConfigMap updated', description: 'ConfigMap app-flags was updated in ns/checkout by a GitOps reconcile.', host: 'eks-prod-use1', ip: '-', sourceIp: null, user: 'argocd', tags: ['config', 'kubernetes'] },
]

export const ALL_TAGS = [...new Set(EVENTS.flatMap((e) => e.tags))].sort()
