import { useScope, ENV_SCOPES, TIME_RANGES } from '../../scope/ScopeContext'
import { ScopeDropdown } from './ScopeDropdown'
import { UserMenu } from './UserMenu'
import { Globe, Clock } from '../../lib/icons'

export function TopBar({ title, crumb = 'Northstar · Cloud Runtime Security' }: { title: string; crumb?: string }) {
  const { env, range, setEnv, setRange } = useScope()
  return (
    <div className="top">
      <div>
        <h1>{title}</h1>
        <div className="crumb">{crumb}</div>
      </div>
      <div className="sp" />
      <ScopeDropdown value={env} options={ENV_SCOPES} onChange={setEnv} icon={<Globe />} />
      <ScopeDropdown value={range} options={TIME_RANGES} onChange={setRange} icon={<Clock />} />
      <div className="livep"><span className="d" />LIVE</div>
      <UserMenu />
    </div>
  )
}
