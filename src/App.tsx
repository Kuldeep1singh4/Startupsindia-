import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth, RequireAdmin, RequireAmbassador } from './components/ProtectedRoute'
import { AmbassadorLayout } from './components/AmbassadorLayout'
import { AdminLayout } from './components/AdminLayout'

// Public pages
import { Landing } from './pages/Landing'
import { Registration } from './pages/Registration'
import { Login } from './pages/Login'
import { ApplicationStatus } from './pages/ApplicationStatus'

// Ambassador pages
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { Leaderboard } from './pages/Leaderboard'
import { Rewards } from './pages/Rewards'
import { Profile } from './pages/Profile'
import { Certificates } from './pages/Certificates'
import { Referrals } from './pages/Referrals'

// Admin pages (standalone, no ambassador layout)
import { AdminPortal } from './pages/admin/AdminPortal'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/status" element={<ApplicationStatus />} />

          {/* ── Ambassador-Only Routes ───────────────────── */}
          {/* Admin cannot access these — redirected to /admin */}
          <Route element={<RequireAuth><RequireAmbassador /></RequireAuth>}>
            <Route element={<AmbassadorLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/referrals" element={<Referrals />} />
            </Route>
          </Route>

          {/* ── Admin-Only Routes ────────────────────────── */}
          {/* Ambassador cannot access — redirected to /dashboard */}
          <Route element={<RequireAuth><RequireAdmin /></RequireAuth>}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/*" element={<AdminPortal />} />
            </Route>
          </Route>

          {/* ── Catch-all ────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
