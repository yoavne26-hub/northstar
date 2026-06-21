import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth, initialsFromEmail, type Role } from '../auth/AuthContext'
import { Shield, Bolt } from '../lib/icons'

export function LoginPage() {
  const { user, signIn, signInDemo } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const go = (role: Role) => nav(role === 'admin' ? '/analytics' : '/dashboard')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    const role: Role = /admin/i.test(email) ? 'admin' : 'analyst'
    setTimeout(() => {
      signIn({ name: email.split('@')[0].replace(/[._-]+/g, ' '), email, role, initials: initialsFromEmail(email) })
      go(role)
    }, 500)
  }

  const demo = (role: Role) => { signInDemo(role); go(role) }

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="brand light"><span className="bm"><Shield /></span>Northstar</div>
        <h1>See the signal<br />before the crisis.</h1>
        <p>Real-time cloud runtime security. Understand → Decide → Act, in one workspace.</p>
        <div className="auth-stats">
          <div><b className="num">412</b><span>assets monitored</span></div>
          <div><b className="num">2h 41m</b><span>median MTTR</span></div>
          <div><b className="num">94%</b><span>fleet health</span></div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Sign in to Northstar</h2>
          <p className="auth-sub">Use any email to continue, or pick a demo role.</p>

          <form onSubmit={submit}>
            <label className="field"><span>Work email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
            </label>
            <label className="field"><span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </label>
            <button className="auth-btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>

          <div className="auth-or"><span>or continue with</span></div>
          <div className="sso">
            <button className="sso-btn" onClick={() => demo('analyst')}>Google</button>
            <button className="sso-btn" onClick={() => demo('analyst')}>Okta SSO</button>
            <button className="sso-btn" onClick={() => demo('analyst')}>GitHub</button>
          </div>

          <div className="demo-row">
            <button className="demo-btn" onClick={() => demo('analyst')}>
              <span className="dr-role">Analyst</span><span className="dr-desc">triage workspace</span>
            </button>
            <button className="demo-btn admin" onClick={() => demo('admin')}>
              <Bolt /><span className="dr-role">Admin</span><span className="dr-desc">+ fleet analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
