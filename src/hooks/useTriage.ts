import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ISSUES, INCOMING_ISSUE, SEVERITY_RANK, parseAge,
  type Issue, type Severity, type Status, type SortKey,
} from '../data/mockData'
import { useScope, envMatches } from '../scope/ScopeContext'
import { useSettings } from '../settings/SettingsContext'
import { computeRisk } from '../lib/risk'
import { buzz } from '../lib/haptics'

export type GroupBy = 'none' | 'env' | 'status'
export type FlagKey = 'attention' | 'acted'

export interface TriageGroup { key: string; issues: Issue[] }

export interface SavedView {
  name: string
  sev: Severity[]
  flag: FlagKey[]
  env: string[]
  status: Status[]
  scoreMin: number
  sort: SortKey
  query: string
}

const VIEWS_KEY = 'northstar.savedViews'
function loadViews(): SavedView[] {
  try { const raw = localStorage.getItem(VIEWS_KEY); return raw ? (JSON.parse(raw) as SavedView[]) : [] }
  catch { return [] }
}

export function useTriage(liveFeed = true) {
  const scope = useScope()
  const { settings } = useSettings()
  const weights = settings.riskWeights
  const [issues, setIssues] = useState<Issue[]>(ISSUES)
  const [sevOn, setSevOn] = useState<Set<Severity>>(new Set(['critical', 'high', 'medium']))
  const [flagOn, setFlagOn] = useState<Set<FlagKey>>(new Set())
  const [envOn, setEnvOn] = useState<Set<string>>(new Set())
  const [statusOn, setStatusOn] = useState<Set<Status>>(new Set())
  const [scoreMin, setScoreMin] = useState(0)
  const [sort, setSort] = useState<SortKey>('risk')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [acted, setActed] = useState<Record<number, Status>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [views, setViews] = useState<SavedView[]>(loadViews)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => { localStorage.setItem(VIEWS_KEY, JSON.stringify(views)) }, [views])

  useEffect(() => {
    if (!liveFeed) return
    const t = setTimeout(() => {
      setIssues((prev) => (prev.some((i) => i.id === INCOMING_ISSUE.id)
        ? prev
        : [prev[0], INCOMING_ISSUE, ...prev.slice(1)]))
      showToast('⚡ New critical detected — added to top of queue')
      buzz([10, 40, 10])
    }, 5000)
    return () => clearTimeout(t)
  }, [liveFeed, showToast])

  const toggleIn = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>) => (v: T) => {
    buzz(8)
    setter((prev) => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n })
  }
  const toggleSev = useCallback(toggleIn(setSevOn), [])
  const toggleFlag = useCallback(toggleIn(setFlagOn), [])
  const toggleEnv = useCallback(toggleIn(setEnvOn), [])
  const toggleStatus = useCallback(toggleIn(setStatusOn), [])
  const changeGroup = useCallback((g: GroupBy) => { buzz(8); setGroupBy(g) }, [])

  const clearAdvanced = useCallback(() => {
    setEnvOn(new Set()); setStatusOn(new Set()); setScoreMin(0); setSort('risk')
    setSevOn(new Set(['critical', 'high', 'medium'])); setFlagOn(new Set()); setQuery('')
  }, [])

  const toggleSelect = useCallback((id: number) => {
    buzz(10)
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }, [])
  const clearSelected = useCallback(() => setSelected(new Set()), [])

  const actOn = useCallback((ids: number[], label: Status) => {
    if (!ids.length) return
    buzz([15, 30, 15])
    setActed((prev) => { const n = { ...prev }; ids.forEach((id) => { n[id] = label }); return n })
    setSelected(new Set())
    const n = ids.length, verb = label.toLowerCase()
    showToast(n === 1 ? `✓ Issue ${verb} · verification tracking started`
      : `✓ ${n} issues ${verb} · verification tracking started`)
  }, [showToast])

  const saveView = useCallback((name: string) => {
    const v: SavedView = {
      name, sev: [...sevOn], flag: [...flagOn], env: [...envOn], status: [...statusOn], scoreMin, sort, query,
    }
    setViews((prev) => [...prev.filter((x) => x.name !== name), v])
    showToast(`✓ View "${name}" saved`)
  }, [sevOn, flagOn, envOn, statusOn, scoreMin, sort, query, showToast])

  const applyView = useCallback((v: SavedView) => {
    setSevOn(new Set(v.sev)); setFlagOn(new Set(v.flag)); setEnvOn(new Set(v.env))
    setStatusOn(new Set(v.status)); setScoreMin(v.scoreMin); setSort(v.sort); setQuery(v.query)
    showToast(`Applied view "${v.name}"`)
  }, [showToast])

  const deleteView = useCallback((name: string) => setViews((prev) => prev.filter((x) => x.name !== name)), [])

  // recompute each issue's risk score from the user's factor weights
  const scoredAll = useMemo(
    () => issues.map((it) => ({ ...it, score: computeRisk(it, weights) })),
    [issues, weights],
  )
  const findById = (id: number) => scoredAll.find((i) => i.id === id) ?? null

  // scope pre-filter (top-bar environment + time range)
  const scoped = useMemo(() => scoredAll.filter((it) =>
    envMatches(scope.env, it.environment) && parseAge(it.time) <= scope.rangeMinutes
  ), [scoredAll, scope.env, scope.rangeMinutes])

  const scopeCounts = useMemo(() => ({
    critical: scoped.filter((i) => i.severity === 'critical').length,
    high: scoped.filter((i) => i.severity === 'high').length,
    medium: scoped.filter((i) => i.severity === 'medium').length,
    total: scoped.length,
  }), [scoped])

  const visible = useMemo(() => {
    const out = scoped.filter((it) => {
      if (!sevOn.has(it.severity)) return false
      if (envOn.size && !envOn.has(it.environment)) return false
      if (statusOn.size && !statusOn.has(acted[it.id] ?? it.status)) return false
      if (it.score < scoreMin) return false
      if (flagOn.size) {
        const isAtt = it.flag === 'attention' && !acted[it.id]
        const isActed = !!acted[it.id]
        if (flagOn.has('attention') && flagOn.has('acted')) { if (!isAtt && !isActed) return false }
        else if (flagOn.has('attention')) { if (!isAtt) return false }
        else if (flagOn.has('acted')) { if (!isActed) return false }
      }
      if (query) {
        const q = query.toLowerCase()
        if (!it.title.toLowerCase().includes(q) && !it.environment.toLowerCase().includes(q)
          && !it.mitre.toLowerCase().includes(q)) return false
      }
      return true
    })
    out.sort((a, b) => {
      if (sort === 'severity') return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.score - a.score
      if (sort === 'time') return a.id - b.id // ids roughly ordered by recency in mock
      return b.score - a.score
    })
    return out
  }, [scoped, sevOn, envOn, statusOn, scoreMin, flagOn, acted, query, sort])

  const groups = useMemo<TriageGroup[]>(() => {
    if (groupBy === 'none') return [{ key: '', issues: visible }]
    const map = new Map<string, Issue[]>()
    visible.forEach((it) => {
      const key = groupBy === 'env' ? it.environment : (acted[it.id] ?? it.status)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(it)
    })
    return [...map.entries()].map(([key, issues]) => ({ key, issues }))
  }, [visible, groupBy, acted])

  const activeAdvanced = envOn.size + statusOn.size + (scoreMin > 0 ? 1 : 0) + (sort !== 'risk' ? 1 : 0)

  return {
    state: { issues, sevOn, flagOn, envOn, statusOn, scoreMin, sort, groupBy, query, selected, acted, toast },
    visible, groups, views, activeAdvanced, scopeCounts, findById,
    actions: {
      toggleSev, toggleFlag, toggleEnv, toggleStatus, setScoreMin, setSort, changeGroup, setQuery,
      toggleSelect, clearSelected, actOn, showToast, clearAdvanced, saveView, applyView, deleteView,
    },
  }
}

export type TriageApi = ReturnType<typeof useTriage>
