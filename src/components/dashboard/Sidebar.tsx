import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Shield, Grid, Pulse, Search, Trend, Bars, Settings, Swords } from '../../lib/icons'

const NAV = [
  { to: '/dashboard', label: 'Overview', Icon: Grid },
  { to: '/events', label: 'Events', Icon: Pulse },
  { to: '/investigations', label: 'Investigations', Icon: Search },
  { to: '/cve-trends', label: 'CVE Trends', Icon: Trend },
  { to: '/red-blue', label: 'Red vs Blue', Icon: Swords },
]

export function Sidebar() {
  const { user } = useAuth()
  const navCls = ({ isActive }: { isActive: boolean }) => `nav${isActive ? ' on' : ''}`

  return (
    <aside className="side">
      <NavLink to="/dashboard" className="brand-side" aria-label="Northstar home">
        <span className="bm"><Shield /></span><span className="brand-name">Northstar</span>
      </NavLink>

      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} className={navCls}>
          <n.Icon /><span className="nav-label">{n.label}</span>
        </NavLink>
      ))}
      {user?.role === 'admin' && (
        <NavLink to="/analytics" className={navCls}>
          <Bars /><span className="nav-label">Analytics</span>
        </NavLink>
      )}

      <div className="grow" />

      <NavLink to="/settings" className={navCls}>
        <Settings /><span className="nav-label">Settings</span>
      </NavLink>
      <NavLink to="/settings" className="side-user" title={user?.name}>
        <span className="avatar">{user?.initials ?? 'NS'}</span>
        <span className="su-meta">
          <span className="su-name">{user?.name ?? 'Guest'}</span>
          <span className="su-role">{user?.role ?? 'signed out'}</span>
        </span>
      </NavLink>
    </aside>
  )
}
