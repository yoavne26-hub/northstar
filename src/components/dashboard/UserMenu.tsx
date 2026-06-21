import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Settings, Close } from '../../lib/icons'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  if (!user) return null

  return (
    <div className="usermenu">
      <button className="um-avatar" onClick={() => setOpen((o) => !o)} aria-label="Account menu">{user.initials}</button>
      {open && (
        <>
          <div className="um-backdrop" onClick={() => setOpen(false)} />
          <div className="um-panel" role="menu">
            <div className="um-head">
              <div className="um-av-lg">{user.initials}</div>
              <div>
                <div className="um-name">{user.name}</div>
                <div className="um-email">{user.email}</div>
                <span className={`um-role ${user.role}`}>{user.role}</span>
              </div>
            </div>
            <button className="um-item" onClick={() => { setOpen(false); nav('/settings') }}><Settings />Settings</button>
            <button className="um-item danger" onClick={() => { setOpen(false); signOut(); nav('/login') }}><Close />Sign out</button>
          </div>
        </>
      )}
    </div>
  )
}
