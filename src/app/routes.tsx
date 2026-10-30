import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute, RequireRole } from '@/components/guards/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Layout from '@/components/layout/Layout'
import { ROUTES } from '@/constants'
import Login from '@/pages/auth/Login'
import Landing from '@/pages/landing/Landing'
import { PageSkeleton } from '@/components/ui'

// Route-level code splitting — the marketing site never downloads the admin bundle.
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Clients = lazy(() => import('@/pages/admin/Clients'))
const Memberships = lazy(() => import('@/pages/admin/Memberships'))
const Reports = lazy(() => import('@/pages/admin/Reports'))
const WorkoutSchedules = lazy(() => import('@/pages/admin/WorkoutSchedules'))
const DailyUpdates = lazy(() => import('@/pages/admin/DailyUpdates'))
const WeightManagement = lazy(() => import('@/pages/admin/WeightManagement'))
const MemberPortal = lazy(() => import('@/pages/member/MemberPortal'))
const MemberDashboard = lazy(() => import('@/pages/member/MemberDashboard'))
const MemberActivity = lazy(() => import('@/pages/member/MemberActivity'))

/** `/login` — send an already-authenticated user into their workspace. */
function LoginRoute() {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? ROUTES.dashboard : ROUTES.member} replace />
  }
  return <Login />
}

/** Restores scroll position on navigation; no-ops for in-page anchors. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])
  return null
}

/** Cross-fade between routes without touching the router itself. */
function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/**
 * The boundary wraps the *page*, not the shell — so if a view throws, the
 * operator still keeps the sidebar, top bar and every other route.
 */
const withLayout = (page: ReactNode, viewName: string) => (
  <ProtectedRoute>
    <Layout>
      <PageTransition>
        <ErrorBoundary viewName={viewName}>
          <Suspense fallback={<PageSkeleton />}>{page}</Suspense>
        </ErrorBoundary>
      </PageTransition>
    </Layout>
  </ProtectedRoute>
)

/** Operator-only shell: same layout behind an administrator role gate. */
const withAdminLayout = (page: ReactNode, viewName: string) => (
  <RequireRole role="admin">
    <Layout>
      <PageTransition>
        <ErrorBoundary viewName={viewName}>
          <Suspense fallback={<PageSkeleton />}>{page}</Suspense>
        </ErrorBoundary>
      </PageTransition>
    </Layout>
  </RequireRole>
)

export function AppRoutes() {
  const location = useLocation()
  return (
    <>
      <ScrollManager />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path={ROUTES.landing} element={<Landing />} />
          <Route path={ROUTES.login} element={<LoginRoute />} />

          {/* Admin */}
          <Route path={ROUTES.dashboard} element={withAdminLayout(<Dashboard />, 'Overview')} />
          <Route path={ROUTES.clients} element={withAdminLayout(<Clients />, 'Members')} />
          <Route path={ROUTES.memberships} element={withAdminLayout(<Memberships />, 'Memberships')} />
          <Route path={ROUTES.reports} element={withAdminLayout(<Reports />, 'Reports')} />
          <Route path={ROUTES.workouts} element={withAdminLayout(<WorkoutSchedules />, 'Workout schedules')} />
          <Route path={ROUTES.dailyUpdates} element={withAdminLayout(<DailyUpdates />, 'Daily logs')} />
          <Route path={ROUTES.weight} element={withAdminLayout(<WeightManagement />, 'Weight tracking')} />

          {/* Member portal — open to either role so admins can review it */}
          <Route path={ROUTES.member} element={withLayout(<MemberPortal />, 'Member portal')} />
          <Route path={ROUTES.memberDashboard} element={withLayout(<MemberDashboard />, 'Member dashboard')} />
          <Route path={ROUTES.memberActivity} element={withLayout(<MemberActivity />, 'Activity & attendance')} />

          <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
