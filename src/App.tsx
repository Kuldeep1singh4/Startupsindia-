import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth, RequireAdmin, RequireAmbassador } from './components/ProtectedRoute'
import { AmbassadorLayout } from './components/AmbassadorLayout'
import { AdminLayout } from './components/AdminLayout'

// Public pages
import { Landing } from './pages/Landing'
import { Registration } from './pages/Registration'
import { Login } from './pages/Login'
import { ApplicationStatus } from './pages/ApplicationStatus'
import { Terms } from './pages/Terms'
import { Welcome } from './pages/Welcome'
import { ResetPassword } from './pages/ResetPassword'
import { NotFound } from './pages/NotFound'
import { ErrorPage } from './pages/ErrorPage'
import { ErrorBoundary } from './components/ErrorBoundary'

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
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* ── Public Routes ────────────────────────────── */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/status" element={<ApplicationStatus />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/error" element={<ErrorPage />} />

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

            {/* ── Custom 404 Route ─────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
