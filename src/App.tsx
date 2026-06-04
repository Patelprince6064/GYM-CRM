import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import WorkoutSchedules from './pages/WorkoutSchedules'
import DailyUpdates from './pages/DailyUpdates'
import WeightManagement from './pages/WeightManagement'
import MemberPortal from './pages/MemberPortal'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/clients" element={<Layout><Clients /></Layout>} />
      <Route path="/workouts" element={<Layout><WorkoutSchedules /></Layout>} />
      <Route path="/daily-updates" element={<Layout><DailyUpdates /></Layout>} />
      <Route path="/weight" element={<Layout><WeightManagement /></Layout>} />
      <Route path="/member" element={<Layout><MemberPortal /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
