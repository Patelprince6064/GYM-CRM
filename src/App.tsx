import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import WorkoutSchedules from './pages/WorkoutSchedules'
import DailyUpdates from './pages/DailyUpdates'
import WeightManagement from './pages/WeightManagement'
import MemberPortal from './pages/MemberPortal'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? "/dashboard" : "/member"} replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
      <Route path="/workouts" element={<ProtectedRoute><Layout><WorkoutSchedules /></Layout></ProtectedRoute>} />
      <Route path="/daily-updates" element={<ProtectedRoute><Layout><DailyUpdates /></Layout></ProtectedRoute>} />
      <Route path="/weight" element={<ProtectedRoute><Layout><WeightManagement /></Layout></ProtectedRoute>} />
      <Route path="/member" element={<ProtectedRoute><Layout><MemberPortal /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
