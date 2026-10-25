import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants'

/** Route guard — redirects anonymous users to the sign-in page. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  return <>{children}</>
}

/**
 * Role gate for the operator workspace. A member who reaches an admin route
 * is sent to their own portal rather than being shown a shell they cannot
 * use — the API independently rejects the data requests either way.
 */
export function RequireRole({ role, children }: { role: 'admin'; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />

  // Resolved before the comparison below so the narrowing on `role`
  // doesn't collapse this expression.
  const destination = user ? (user.role === 'admin' ? ROUTES.dashboard : ROUTES.member) : ROUTES.login
  if (user?.role !== role) return <Navigate to={destination} replace />

  return <>{children}</>
}
