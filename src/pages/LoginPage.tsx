import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth, initialsFromEmail, type Role } from '../auth/AuthContext'
import { Shield, Bolt } from '../lib/icons'

export function LoginPage() {
  const { user, signIn, signInDemo } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')

  if (user) return <Navigate to={user.role === 'admin' ? '/analytics' : '/dashboard'} replace />

  const go = (role: Role) => nav(role === 'admin' ? '/analytics' : '/dashboard')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    const role: Role = /admin/i.test(email) ? 'admin' : 'analyst'
    signIn({ name: email.split('@')[0].replace(/[._-]+/g, ' '), email, role, initials: initialsFromEmail(email) })
    go(role)
  }

  const demo = (role: Role) => { signInDemo(role); go(role) }

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="brand light"><span className="bm"><Shield /></span>Northstar</div>
        <h1>See the signal<br />before the crisis.</h1>
        <p>Explore a sample cloud security workspace. Understand → Decide → Act, in one place.</p>
        <span className="auth-sample">Sample workspace data</span>
        <div className="auth-stats">
          <div><b className="num">412</b><span>assets monitored</span></div>
          <div><b className="num">2h 41m</b><span>median MTTR</span></div>
          <div><b className="num">94%</b><span>fleet health</span></div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Explore Northstar</h2>
          <p className="auth-sub">Open the local demo with any email, or choose a sample role.</p>

          <form onSubmit={submit}>
            <label className="field"><span>Demo email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
            </label>
            <button className="auth-btn" type="submit">Continue to demo</button>
          </form>

          <p className="auth-note">No password needed. An address containing “admin” opens the admin view.</p>
          <div className="auth-or"><span>or try a sample role</span></div>

          <div className="demo-row">
            <button className="demo-btn" type="button" onClick={() => demo('analyst')}>
              <span className="dr-role">Analyst demo</span><span className="dr-desc">Triage workspace</span>
            </button>
            <button className="demo-btn admin" type="button" onClick={() => demo('admin')}>
              <Bolt /><span className="dr-role">Admin demo</span><span className="dr-desc">Fleet analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
