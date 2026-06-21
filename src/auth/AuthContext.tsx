import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Role = 'analyst' | 'admin'
export interface User { name: string; email: string; role: Role; initials: string }

interface AuthCtx {
  user: User | null
  signIn: (u: User) => void
  signInDemo: (role: Role) => void
  signOut: () => void
}

const STORAGE_KEY = 'northstar.user'
const Ctx = createContext<AuthCtx | null>(null)

const DEMO: Record<Role, User> = {
  analyst: { name: 'Dana Levi', email: 'dana.levi@upwind.io', role: 'analyst', initials: 'DL' },
  admin: { name: 'Yoav Nesher', email: 'yoav.nesher@upwind.io', role: 'admin', initials: 'YN' },
}

function load(): User | null {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? (JSON.parse(raw) as User) : null }
  catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(load)

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const value = useMemo<AuthCtx>(() => ({
    user,
    signIn: (u) => setUser(u),
    signInDemo: (role) => setUser(DEMO[role]),
    signOut: () => setUser(null),
  }), [user])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function initialsFromEmail(email: string): string {
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  const parts = name.split(' ')
  return ((parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '')).toUpperCase()
}
