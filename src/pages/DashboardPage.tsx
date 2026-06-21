import { AppShell } from '../components/layout/AppShell'
import { TriageContent } from '../components/dashboard/TriageDashboard'

export function DashboardPage() {
  return (
    <AppShell title="Threat Overview">
      <TriageContent />
    </AppShell>
  )
}
