import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

// Loader shown while auth state loads
function AuthLoader() {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm">Authenticating...</p>
      </div>
    </div>
  )
}

/** Requires authentication — if not logged in, redirect to /login */
export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children ? <>{children}</> : <Outlet />
}

/** Requires admin role — if not admin, redirect to /dashboard */
export function RequireAdmin({ children }: { children?: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // Wait for profile to load before deciding — profile could be null while fetching
  if (user && profile === null) return <AuthLoader />

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

/** Requires ambassador role — if admin, redirect to /admin */
export function RequireAmbassador({ children }: { children?: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (user && profile === null) return <AuthLoader />

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
