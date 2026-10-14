import { Outlet } from "react-router-dom"
import { AppTopbar } from "./AppTopbar"
import { useAuth } from "../contexts/AuthContext"

export function AdminLayout() {
  const { profile } = useAuth()

  return (
    <div className="h-screen h-dvh bg-bg-dark text-white flex flex-col overflow-hidden">
      {/* Top Header — Fixed & Static */}
      <AppTopbar profile={profile} showProfileLink={false} />

      {/* Main Container — Stays within viewport */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
