import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Shield, Grid, Pulse, Search, Trend, Bars, Settings, Swords, Close } from '../../lib/icons'

const NAV = [
  { to: '/dashboard', label: 'Overview', Icon: Grid },
  { to: '/events', label: 'Events', Icon: Pulse },
  { to: '/investigations', label: 'Investigations', Icon: Search },
  { to: '/cve-trends', label: 'CVE Trends', Icon: Trend },
  { to: '/red-blue', label: 'Red vs Blue', Icon: Swords },
]

export function Sidebar({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: () => void }) {
  const { user } = useAuth()
  const closeButton = useRef<HTMLButtonElement>(null)
  const navCls = ({ isActive }: { isActive: boolean }) => `nav${isActive ? ' on' : ''}`
  useEffect(() => { if (open) closeButton.current?.focus() }, [open])

  return (
    <aside className={`side${open ? ' open' : ''}`} aria-label="Primary navigation" role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined}>
      <div className="side-header">
        <NavLink to="/dashboard" className="brand-side" aria-label="Northstar home" onClick={open ? onNavigate : undefined}>
          <span className="bm"><Shield /></span><span className="brand-name">Northstar</span>
        </NavLink>
        <button ref={closeButton} className="menu-close" type="button" aria-label="Close navigation" onClick={onClose}><Close /></button>
      </div>

      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} className={navCls} onClick={open ? onNavigate : undefined}>
          <n.Icon /><span className="nav-label">{n.label}</span>
        </NavLink>
      ))}
      {user?.role === 'admin' && (
        <NavLink to="/analytics" className={navCls} onClick={open ? onNavigate : undefined}>
          <Bars /><span className="nav-label">Analytics</span>
        </NavLink>
      )}

      <div className="grow" />

      <NavLink to="/settings" className={navCls} onClick={open ? onNavigate : undefined}>
        <Settings /><span className="nav-label">Settings</span>
      </NavLink>
      <NavLink to="/settings" className="side-user" title={user?.name} onClick={open ? onNavigate : undefined}>
        <span className="avatar">{user?.initials ?? 'NS'}</span>
        <span className="su-meta">
          <span className="su-name">{user?.name ?? 'Guest'}</span>
          <span className="su-role">{user?.role ?? 'signed out'}</span>
        </span>
      </NavLink>
    </aside>
  )
}
