import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { SettingsProvider } from './settings/SettingsContext'
import { ScopeProvider } from './scope/ScopeContext'
import { ProtectedRoute, AdminRoute } from './components/routing/Guards'
import { ExplainerPage } from './pages/ExplainerPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { InvestigationsPage } from './pages/InvestigationsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { EventsPage } from './pages/EventsPage'
import { CveTrendsPage } from './pages/CveTrendsPage'
import { RedBluePage } from './pages/RedBluePage'

const router = createBrowserRouter([
  { path: '/', element: <ExplainerPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/investigations', element: <ProtectedRoute><InvestigationsPage /></ProtectedRoute> },
  { path: '/events', element: <ProtectedRoute><EventsPage /></ProtectedRoute> },
  { path: '/cve-trends', element: <ProtectedRoute><CveTrendsPage /></ProtectedRoute> },
  { path: '/red-blue', element: <ProtectedRoute><RedBluePage /></ProtectedRoute> },
  { path: '/analytics', element: <AdminRoute><AnalyticsPage /></AdminRoute> },
  { path: '/settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
])

export function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ScopeProvider>
          <RouterProvider router={router} />
        </ScopeProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}
