import type { RefObject } from 'react'
import { useScope, ENV_SCOPES, TIME_RANGES } from '../../scope/ScopeContext'
import { ScopeDropdown } from './ScopeDropdown'
import { UserMenu } from './UserMenu'
import { Globe, Clock } from '../../lib/icons'

export function TopBar({ title, crumb = 'Northstar · Cloud Runtime Security', onOpenMenu, menuButtonRef }: { title: string; crumb?: string; onOpenMenu: () => void; menuButtonRef: RefObject<HTMLButtonElement> }) {
  const { env, range, setEnv, setRange } = useScope()
  return (
    <div className="top">
      <button ref={menuButtonRef} className="menu-open" type="button" aria-label="Open navigation" onClick={onOpenMenu}><span /><span /><span /></button>
      <div className="top-heading">
        <h1 tabIndex={-1}>{title}</h1>
        <div className="crumb">{crumb}</div>
      </div>
      <div className="sp" />
      <div className="top-scopes">
        <ScopeDropdown value={env} options={ENV_SCOPES} onChange={setEnv} icon={<Globe />} />
        <ScopeDropdown value={range} options={TIME_RANGES} onChange={setRange} icon={<Clock />} />
      </div>
      <div className="livep"><span className="d" />LIVE</div>
      <UserMenu />
    </div>
  )
}
