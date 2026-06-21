import type { ReactNode } from 'react'
import { Sidebar } from '../dashboard/Sidebar'
import { TopBar } from '../dashboard/TopBar'

export function AppShell({ title, crumb, children }: { title: string; crumb?: string; children: ReactNode }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <TopBar title={title} crumb={crumb} />
        {children}
      </div>
    </div>
  )
}
