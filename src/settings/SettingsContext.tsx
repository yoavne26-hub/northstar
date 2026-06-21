import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_WEIGHTS, type RiskWeights, type FactorKey } from '../lib/risk'

export type WidgetKey = 'statusBand' | 'kpiStrip' | 'trend' | 'contributors' | 'recentRail'
export type Density = 'comfortable' | 'compact'

export interface Settings {
  widgets: Record<WidgetKey, boolean>
  density: Density
  notifications: { critical: boolean; assigned: boolean; weekly: boolean; sound: boolean }
  integrations: { slack: boolean; pagerduty: boolean; jira: boolean }
  riskWeights: RiskWeights
}

export const DEFAULT_SETTINGS: Settings = {
  widgets: { statusBand: true, kpiStrip: true, trend: true, contributors: true, recentRail: true },
  density: 'comfortable',
  notifications: { critical: true, assigned: true, weekly: false, sound: false },
  integrations: { slack: true, pagerduty: true, jira: false },
  riskWeights: DEFAULT_WEIGHTS,
}

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  statusBand: 'Status band',
  kpiStrip: 'KPI cards',
  trend: 'Macro trend chart',
  contributors: 'Top contributors',
  recentRail: 'Recent & verification',
}

interface SettingsCtx {
  settings: Settings
  setWidget: (k: WidgetKey, v: boolean) => void
  setDensity: (d: Density) => void
  setNotification: (k: keyof Settings['notifications'], v: boolean) => void
  setIntegration: (k: keyof Settings['integrations'], v: boolean) => void
  setWeight: (k: FactorKey, v: number) => void
  applyWeights: (w: RiskWeights) => void
  reset: () => void
}

const STORAGE_KEY = 'northstar.settings'
const Ctx = createContext<SettingsCtx | null>(null)

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch { return DEFAULT_SETTINGS }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) }, [settings])

  const value = useMemo<SettingsCtx>(() => ({
    settings,
    setWidget: (k, v) => setSettings((s) => ({ ...s, widgets: { ...s.widgets, [k]: v } })),
    setDensity: (d) => setSettings((s) => ({ ...s, density: d })),
    setNotification: (k, v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, [k]: v } })),
    setIntegration: (k, v) => setSettings((s) => ({ ...s, integrations: { ...s.integrations, [k]: v } })),
    setWeight: (k, v) => setSettings((s) => ({ ...s, riskWeights: { ...s.riskWeights, [k]: v } })),
    applyWeights: (w) => setSettings((s) => ({ ...s, riskWeights: w })),
    reset: () => setSettings(DEFAULT_SETTINGS),
  }), [settings])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
