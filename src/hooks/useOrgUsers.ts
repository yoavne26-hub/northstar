import { useCallback, useEffect, useState } from 'react'
import { ORG_USERS, type OrgUser } from '../data/org'

const STORAGE_KEY = 'northstar.orgUsers'

function load(): OrgUser[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? (JSON.parse(raw) as OrgUser[]) : ORG_USERS }
  catch { return ORG_USERS }
}

export function useOrgUsers() {
  const [users, setUsers] = useState<OrgUser[]>(load)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)) }, [users])

  const deleteUser = useCallback((id: number) => setUsers((u) => u.filter((x) => x.id !== id)), [])

  const toggleStatus = useCallback((id: number) => setUsers((u) => u.map((x) =>
    x.id === id ? { ...x, status: x.status === 'Suspended' ? 'Active' : 'Suspended' } : x)), [])

  const inviteUser = useCallback((email: string) => setUsers((u) => {
    const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const id = Math.max(0, ...u.map((x) => x.id)) + 1
    return [...u, { id, name, email, role: 'Viewer', team: 'unassigned', status: 'Invited' }]
  }), [])

  const reset = useCallback(() => setUsers(ORG_USERS), [])

  return { users, deleteUser, toggleStatus, inviteUser, reset }
}
