import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import { ROUTES } from '@/constants'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/admin/Dashboard'
import Clients from '@/pages/admin/Clients'
import WorkoutSchedules from '@/pages/admin/WorkoutSchedules'
import DailyUpdates from '@/pages/admin/DailyUpdates'
import WeightManagement from '@/pages/admin/WeightManagement'
import MemberPortal from '@/pages/member/MemberPortal'
import MemberDashboard from '@/pages/member/MemberDashboard'
import MemberActivity from '@/pages/member/MemberActivity'

function RootRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Login />
  return <Navigate to={user?.role === 'admin' ? ROUTES.dashboard : ROUTES.member} replace />
}

const withLayout = (page: React.ReactNode) => (
  <ProtectedRoute>
    <Layout>{page}</Layout>
  </ProtectedRoute>
)

/** All routes in one place — add new pages here. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<RootRoute />} />
      <Route path={ROUTES.dashboard} element={withLayout(<Dashboard />)} />
      <Route path={ROUTES.clients} element={withLayout(<Clients />)} />
      <Route path={ROUTES.workouts} element={withLayout(<WorkoutSchedules />)} />
      <Route path={ROUTES.dailyUpdates} element={withLayout(<DailyUpdates />)} />
      <Route path={ROUTES.weight} element={withLayout(<WeightManagement />)} />
      <Route path={ROUTES.member} element={withLayout(<MemberPortal />)} />
      <Route path={ROUTES.memberDashboard} element={withLayout(<MemberDashboard />)} />
      <Route path={ROUTES.memberActivity} element={withLayout(<MemberActivity />)} />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  )
}
