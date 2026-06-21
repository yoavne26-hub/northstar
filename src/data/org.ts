// Mock org users (admin user-management).
export interface OrgUser {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Analyst' | 'Engineer' | 'Viewer'
  team: string
  status: 'Active' | 'Invited' | 'Suspended'
}

export const ORG_USERS: OrgUser[] = [
  { id: 1, name: 'Yoav Nesher', email: 'yoav.nesher@upwind.io', role: 'Admin', team: 'security', status: 'Active' },
  { id: 2, name: 'Dana Levi', email: 'dana.levi@upwind.io', role: 'Analyst', team: 'security', status: 'Active' },
  { id: 3, name: 'Marcus Cole', email: 'marcus.cole@upwind.io', role: 'Engineer', team: 'payments-platform', status: 'Active' },
  { id: 4, name: 'Priya Raman', email: 'priya.raman@upwind.io', role: 'Analyst', team: 'core-api', status: 'Active' },
  { id: 5, name: 'Sam Okoro', email: 'sam.okoro@upwind.io', role: 'Engineer', team: 'data-platform', status: 'Invited' },
  { id: 6, name: 'Lena Fischer', email: 'lena.fischer@upwind.io', role: 'Viewer', team: 'infra-sre', status: 'Suspended' },
]
