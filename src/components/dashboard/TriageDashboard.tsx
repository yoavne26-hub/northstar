import { useState } from 'react'
import { useTriage } from '../../hooks/useTriage'
import { useSettings } from '../../settings/SettingsContext'
import { useScope } from '../../scope/ScopeContext'
import type { Status } from '../../data/mockData'
import { StatusBand } from './StatusBand'
import { KpiStrip } from './KpiStrip'
import { TrendChart } from '../shared/TrendChart'
import { Contributors } from './Contributors'
import { Toolbar } from './Toolbar'
import { FilterBar } from './FilterBar'
import { IssueQueue } from './IssueQueue'
import { BulkActionBar } from './BulkActionBar'
import { RecentRail } from './RecentRail'
import { Toast } from './Toast'
import { InvestigationDrawer } from '../investigation/InvestigationDrawer'

export function TriageContent() {
  const { state, visible, groups, views, activeAdvanced, scopeCounts, findById, actions } = useTriage()
  const { settings } = useSettings()
  const scope = useScope()
  const w = settings.widgets
  const [openId, setOpenId] = useState<number | null>(null)
  const openIssue = openId != null ? findById(openId) : null

  const escalate = (id: number) => actions.actOn([id], 'Escalated')
  const ignore = (id: number) => actions.actOn([id], 'Dismissed')

  return (
    <div className={`content${settings.density === 'compact' ? ' compact' : ''}`}>
      {w.statusBand && (
        <StatusBand
          criticals={scopeCounts.critical} highs={scopeCounts.high} mediums={scopeCounts.medium}
          total={scopeCounts.total} envLabel={scope.envLabel} assets={scope.assets}
        />
      )}
      {w.kpiStrip && <KpiStrip criticalCount={scopeCounts.critical} />}
      {(w.trend || w.contributors) && (
        <div className="grid2">
          {w.trend && <TrendChart />}
          {w.contributors && <Contributors />}
        </div>
      )}

      <Toolbar
        sevOn={state.sevOn} flagOn={state.flagOn} groupBy={state.groupBy} query={state.query}
        onToggleSev={actions.toggleSev} onToggleFlag={actions.toggleFlag}
        onChangeGroup={actions.changeGroup} onQuery={actions.setQuery}
      />
      <FilterBar
        query={state.query} envOn={state.envOn} statusOn={state.statusOn} scoreMin={state.scoreMin}
        sort={state.sort} views={views} activeAdvanced={activeAdvanced}
        onQuery={actions.setQuery} onToggleEnv={actions.toggleEnv} onToggleStatus={actions.toggleStatus}
        onScoreMin={actions.setScoreMin} onSort={actions.setSort} onClear={actions.clearAdvanced}
        onSaveView={actions.saveView} onApplyView={actions.applyView} onDeleteView={actions.deleteView}
      />

      <div className="qhead">
        Prioritized issues <span className="tag">{visible.length} shown · ranked by {state.sort}</span>
      </div>

      <IssueQueue
        groups={groups} groupBy={state.groupBy} selected={state.selected} acted={state.acted}
        onToggle={actions.toggleSelect} onInvestigate={setOpenId} onEscalate={escalate} onIgnore={ignore}
      />

      <BulkActionBar
        count={state.selected.size}
        onAct={(label: Status) => actions.actOn([...state.selected], label)}
        onClear={actions.clearSelected}
      />

      {w.recentRail && <RecentRail />}

      <InvestigationDrawer
        issue={openIssue} actedLabel={openIssue ? state.acted[openIssue.id] : undefined}
        onClose={() => setOpenId(null)} onAct={(id, label) => actions.actOn([id], label)}
      />
      <Toast text={state.toast} />
    </div>
  )
}
