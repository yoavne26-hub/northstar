# Northstar — Cloud Runtime Security

> **See the signal before the crisis.** A cloud‑runtime security (CDR/CNAPP) triage platform that turns an overwhelming stream of detections into a clear **Understand → Decide → Act** workflow for the on‑call analyst.

Northstar is a front‑end product built with **React + TypeScript + Vite**. It started from a product‑discovery brief ("users are drowning in events, charts and alerts — help them understand what matters *right now*") and grew into a full, multi‑page security console with a **tunable risk model**, role‑based access, and two open‑source security projects integrated into it.

![stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![stack](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![stack](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## Quick start

```bash
cd northstar
npm install
npm run dev        # http://localhost:5273 (opens automatically)
npm run build      # type-check (tsc) + production build to dist/
npm run preview    # serve the production build
```

No backend and no API keys required — every data source is mocked in `src/data/`.

### Signing in

Open `/login` and use a **demo role** button, or any email (an address containing `admin` signs you in as an admin):

| Role | Sees |
|------|------|
| **Analyst** | Overview · Events · Investigations · CVE Trends · Red vs Blue · Settings |
| **Admin** | all of the above **plus** Fleet Analytics and user management |

Auth, settings and saved views persist to `localStorage`. Sign out from the avatar menu (top‑right) or **Settings → Account**.

---

## What's inside

### The core idea: a tunable risk score
Every issue's risk score is a **weighted blend of five factors** — action severity, behavioral deviation, internet exposure, asset criticality, and detection confidence. You tune the weights to match how *you* triage:

- **Settings → Risk scoring** — a slider per factor plus "personality" presets (Balanced, Severity‑first, Exposure‑first, Anomaly hunter, Blast‑radius, Low false‑positive).
- **Inline ⓘ** next to any score — a popover shows that issue's factor breakdown and lets you adjust weights without leaving the page.
- Every issue also gets a **RES‑24 verdict** — `PRIORITIZE / MONITOR / DEFER` — derived from the score using the same thresholds as the CVE‑Trend model, so the dashboard and CVE views agree. Changing weights re‑ranks the queue *and* moves verdicts live.

### Pages

| Route | What it does |
|-------|--------------|
| `/` | Public **Understand → Decide → Act** explainer deck (personas, annotated trend chart, risk‑score table, the GenAI design prompt) ending in an embedded live dashboard. |
| `/dashboard` | The analyst **triage workspace**: status band, KPI strip, macro trend chart (detected vs resolved + WoW baseline + amber 20 % threshold), advanced filters, and the prioritized issue queue with an investigation drawer. |
| `/events` | **Activity console** — the raw telemetry stream detections are derived from: severity‑mix donut, filterable/sortable event table, detail modal. |
| `/investigations` | Full sortable, filterable **case list** with expandable detail. |
| `/cve-trends` | **"The prioritization crisis"** — CVE volume flood, acceleration, the CVSS×EPSS×KEV money chart, NVD scoring backlog, and a **RES‑24**‑scored, sortable top‑CVE table. |
| `/red-blue` | **Red vs Blue**, a sub‑tab per team (see below). |
| `/analytics` | **Admin‑only** fleet analytics: risk over time, MTTR trend, detections by MITRE tactic & environment, severity mix, team performance. |
| `/settings` | Workspace **modularity** (toggle dashboard widgets), appearance/density, notifications, integrations, risk‑score tuning, and **admin user management** (invite / suspend / delete). |

### Triage interactions
- **Top‑bar scope** — working **environment** (All / Production / Staging / per‑cluster) and **time‑range** (1 h → 30 d) selectors that filter the whole dashboard and recompute the status band.
- **Filtering** — severity chips, "needs attention" / "acted" flags, text search, environment & status multi‑select, risk‑score range, sort, and **saved views**.
- **Grouping** — flat / by environment / by status, collapsible.
- **Decide & act** — multi‑select rows → floating bulk‑action bar; inline Investigate / Escalate / Ignore; the investigation drawer preserves context (reasoning, scope, evidence, timeline) and offers safe actions with confirmation.
- **Feedback** — entrance animations, live‑feed stream‑in, toasts, and haptics (`navigator.vibrate`, mobile).

### Red vs Blue
The two teams are wired into one loop — **Blue scans the exact dataset Red generates**:
- **Red Team (AttackGen)** — pick one of 10 scenarios → a weighted kill chain (discovery → impact) → 20 malicious commands hidden in benign noise + an attack narrative.
- **Blue Team (SENTRY)** — a deterministic engine scores those commands against 28 patterns grounded in MITRE ATT&CK / LOLBAS / GTFOBins (HIGH / GRAY / LOW bands) and reports a detection rate, confirmed‑by‑rules table, false positives, and what the rules missed.

---

## Tech & architecture

- **Vite + React 18 + TypeScript** (strict). Routing via **react‑router**. Charts are hand‑rolled inline SVG (no chart dependency). Icons are inline SVG components — no emoji as icons.
- **State** lives in focused hooks/contexts: `useTriage` (filters, grouping, selection, actions, live feed, scoring), `AuthContext` (roles + guards), `SettingsContext` (modularity + risk weights), `ScopeContext` (env + time range).
- **Design language** — light theme, deep navy `#2B3A66`, teal `#1BA88A`, amber thresholds, crimson criticals; Fredoka display / Nunito body / JetBrains Mono numerics. Tokens in `src/styles/tokens.css`.
- **Accessibility** — labeled inputs, visible focus, `aria-live` toasts, tabular numerics, and `prefers-reduced-motion` fallbacks.

```
src/
  main.tsx · App.tsx              # entry + router + providers
  auth/        AuthContext        # mock sign-in, roles, persistence
  settings/    SettingsContext    # modularity, density, risk weights
  scope/       ScopeContext       # environment + time-range scope
  hooks/       useTriage · useOrgUsers
  lib/         risk.ts (weighted score + RES-24 verdict) · icons · haptics
  data/        mockData · analytics · org · events · cve · redblue
  components/
    layout/       AppShell
    dashboard/    Sidebar, TopBar, StatusBand, KpiStrip, Toolbar, FilterBar,
                  IssueQueue, IssueRow, BulkActionBar, RecentRail,
                  RiskInfoPopover, ScopeDropdown, UserMenu, Toast …
    investigation/ InvestigationDrawer
    shared/        TrendChart
    ui/            Toggle
  pages/         ExplainerPage, DashboardPage, EventsPage, InvestigationsPage,
                 CveTrendsPage, RedBluePage, AnalyticsPage, SettingsPage, LoginPage
```

All data is mocked; a service layer could be swapped in behind the hooks without touching the UI.

---

## Integrations & credits

Northstar integrates the ideas (and ports the core logic) of several security projects into one product:

- **AttackGen** — Red‑team attack‑dataset generator (scenario → kill‑chain → labeled command dataset). → `/red-blue` Red tab.
- **SENTRY (Blueteam_Bootcamp)** — Blue‑team process‑command threat analyst (pattern + correlation scoring, HIGH/GRAY/LOW bands). → `/red-blue` Blue tab.
- **The Prioritization Crisis (CVE‑Trend)** — CVSS×EPSS×KEV money chart, volume forecast, NVD backlog, and the **RES‑24** runtime‑contextual score. → `/cve-trends`.
- **PenguWave** — SOC events console (normalized event stream, severity donut, detail modal). → `/events`.

These are reference integrations rebuilt in this app's design system with mock data; credit to the original authors.

---

## Status

Front‑end only, fully mocked, builds clean under TypeScript strict mode. Intended as a product/design + engineering demonstration of runtime‑aware security triage.
