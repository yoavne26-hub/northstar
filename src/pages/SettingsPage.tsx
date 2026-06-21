import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAuth } from '../auth/AuthContext'
import { useSettings, WIDGET_LABELS, type WidgetKey } from '../settings/SettingsContext'
import { Toggle } from '../components/ui/Toggle'
import { useOrgUsers } from '../hooks/useOrgUsers'
import { FACTORS, PRESETS } from '../lib/risk'
import { Trash, UserPlus, LogOut } from '../lib/icons'

const WIDGETS = Object.keys(WIDGET_LABELS) as WidgetKey[]

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const { settings, setWidget, setDensity, setNotification, setIntegration, setWeight, applyWeights, reset } = useSettings()
  const { users, deleteUser, toggleStatus, inviteUser } = useOrgUsers()

  const handleSignOut = () => { signOut(); nav('/login') }
  const handleInvite = () => {
    const email = window.prompt('Invite a teammate — work email:')
    if (email && /.+@.+\..+/.test(email)) inviteUser(email.trim())
  }
  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Remove ${name} from the organization? This is a high-impact action.`)) deleteUser(id)
  }

  return (
    <AppShell title="Settings" crumb="Northstar · Account & workspace">
      <div className="content settings">
        {/* Profile */}
        <section className="set-card">
          <div className="set-h"><h2>Profile</h2></div>
          <div className="profile">
            <div className="prof-av">{user?.initials}</div>
            <div>
              <div className="prof-name">{user?.name}</div>
              <div className="prof-email">{user?.email}</div>
            </div>
            <span className={`um-role ${user?.role}`} style={{ marginLeft: 'auto' }}>{user?.role}</span>
          </div>
        </section>

        {/* Appearance */}
        <section className="set-card">
          <div className="set-h"><h2>Appearance</h2><p>Information density across the workspace.</p></div>
          <div className="seg">
            <button className={settings.density === 'comfortable' ? 'on' : ''} onClick={() => setDensity('comfortable')}>Comfortable</button>
            <button className={settings.density === 'compact' ? 'on' : ''} onClick={() => setDensity('compact')}>Compact</button>
          </div>
        </section>

        {/* Risk scoring */}
        <section className="set-card">
          <div className="set-h"><h2>Risk scoring</h2><p>Tune how Northstar weights each factor — make the score match how <i>you</i> triage. Re-ranks the queue live.</p></div>
          <div className="preset-row">
            {PRESETS.map((pr) => (
              <button key={pr.name} className="preset" title={pr.desc} onClick={() => applyWeights(pr.weights)}>{pr.name}</button>
            ))}
          </div>
          {FACTORS.map((f) => (
            <div className="weight-row" key={f.key}>
              <div className="wr-head">
                <span className="wr-label">{f.label}</span>
                <span className="wr-val num">{settings.riskWeights[f.key]}</span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={settings.riskWeights[f.key]}
                onChange={(e) => setWeight(f.key, Number(e.target.value))}
                aria-label={`${f.label} weight`}
              />
              <div className="wr-desc">{f.desc}</div>
            </div>
          ))}
          <div className="wr-hint">Weights are relative — the score is a normalized 0–100 blend. Heavier weight → that factor pulls issues up the queue.</div>
        </section>

        {/* Modularity */}
        <section className="set-card">
          <div className="set-h"><h2>Dashboard modules</h2><p>Show or hide sections of the Threat Overview.</p></div>
          {WIDGETS.map((k) => (
            <div className="set-row" key={k}>
              <span>{WIDGET_LABELS[k]}</span>
              <Toggle checked={settings.widgets[k]} onChange={(v) => setWidget(k, v)} label={WIDGET_LABELS[k]} />
            </div>
          ))}
        </section>

        {/* Notifications */}
        <section className="set-card">
          <div className="set-h"><h2>Notifications</h2><p>How Northstar alerts you.</p></div>
          {([
            ['critical', 'Critical detections (real-time)'],
            ['assigned', 'Issues assigned to me'],
            ['weekly', 'Weekly risk digest'],
            ['sound', 'Sound on new critical'],
          ] as const).map(([k, label]) => (
            <div className="set-row" key={k}>
              <span>{label}</span>
              <Toggle checked={settings.notifications[k]} onChange={(v) => setNotification(k, v)} label={label} />
            </div>
          ))}
        </section>

        {/* Integrations */}
        <section className="set-card">
          <div className="set-h"><h2>Integrations</h2><p>Route actions to your tools.</p></div>
          {([
            ['slack', 'Slack', 'Post critical alerts to #security'],
            ['pagerduty', 'PagerDuty', 'Escalate criticals to on-call'],
            ['jira', 'Jira', 'Open tickets on assign'],
          ] as const).map(([k, name, desc]) => (
            <div className="set-row" key={k}>
              <div><div className="int-name">{name}</div><div className="int-desc">{desc}</div></div>
              <Toggle checked={settings.integrations[k]} onChange={(v) => setIntegration(k, v)} label={name} />
            </div>
          ))}
        </section>

        {/* Admin: user management */}
        {user?.role === 'admin' && (
          <section className="set-card">
            <div className="set-h"><h2>User management <span className="admin-pill">Admin</span></h2><p>Members of your organization — {users.length} total.</p>
              <button className="auth-btn invite" style={{ width: 'auto', marginLeft: 'auto' }} onClick={handleInvite}><UserPlus />Invite user</button>
            </div>
            <table className="org-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.email === user?.email
                  return (
                    <tr key={u.id}>
                      <td className="ev2">{u.name}{isSelf && <span className="you-pill">you</span>}</td>
                      <td className="num" style={{ fontSize: 12 }}>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.team}</td>
                      <td><span className={`ostat ${u.status.toLowerCase()}`}>{u.status}</span></td>
                      <td>
                        <div className="row-acts">
                          <button className="row-act" disabled={isSelf} onClick={() => toggleStatus(u.id)}>
                            {u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button className="row-act danger" disabled={isSelf} title={isSelf ? "You can't delete yourself" : 'Delete user'} onClick={() => handleDelete(u.id, u.name)}>
                            <Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* Account */}
        <section className="set-card">
          <div className="set-h"><h2>Account</h2><p>Signed in as {user?.email}</p></div>
          <div className="account-actions">
            <button className="reset-btn" onClick={reset}>Reset preferences</button>
            <button className="signout-btn" onClick={handleSignOut}><LogOut />Sign out</button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
