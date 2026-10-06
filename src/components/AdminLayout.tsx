import { Outlet } from "react-router-dom"
import { AppTopbar } from "./AppTopbar"
import { useAuth } from "../contexts/AuthContext"

export function AdminLayout() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen min-h-dvh bg-bg-dark text-white flex flex-col overflow-x-hidden">
      <AppTopbar profile={profile} showProfileLink={false} />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
