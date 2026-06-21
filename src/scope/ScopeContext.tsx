import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { ENVIRONMENTS } from '../data/mockData'

export interface Option { value: string; label: string }

export const ENV_SCOPES: Option[] = [
  { value: 'all', label: 'All environments' },
  { value: 'prod', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  ...ENVIRONMENTS.map((e) => ({ value: e, label: e })),
]

export interface TimeRange { value: string; label: string; minutes: number }
export const TIME_RANGES: TimeRange[] = [
  { value: '1h', label: 'Last 1 hour', minutes: 60 },
  { value: '6h', label: 'Last 6 hours', minutes: 360 },
  { value: '24h', label: 'Last 24 hours', minutes: 1440 },
  { value: '7d', label: 'Last 7 days', minutes: 10080 },
  { value: '30d', label: 'Last 30 days', minutes: 43200 },
]

// rough asset counts per scope, for the status band
const ASSETS: Record<string, number> = { all: 1240, prod: 412, staging: 168 }

interface ScopeCtx {
  env: string
  range: string
  rangeMinutes: number
  envLabel: string
  assets: number
  setEnv: (v: string) => void
  setRange: (v: string) => void
}

const Ctx = createContext<ScopeCtx | null>(null)

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [env, setEnv] = useState('all')
  const [range, setRange] = useState('24h')

  const value = useMemo<ScopeCtx>(() => {
    const tr = TIME_RANGES.find((t) => t.value === range) ?? TIME_RANGES[2]
    const envOpt = ENV_SCOPES.find((e) => e.value === env)
    return {
      env, range, rangeMinutes: tr.minutes,
      envLabel: envOpt?.label ?? 'All environments',
      assets: ASSETS[env] ?? 96,
      setEnv, setRange,
    }
  }, [env, range])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useScope() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useScope must be used within ScopeProvider')
  return ctx
}

// scope matchers
export function envMatches(scope: string, environment: string): boolean {
  if (scope === 'all') return true
  if (scope === 'prod') return environment.includes('prod')
  if (scope === 'staging') return environment.includes('staging')
  return environment === scope
}
