import { Outlet } from "react-router-dom"
import { AmbassadorSidebar } from "./AmbassadorSidebar"
import { AmbassadorMobileNav } from "./AmbassadorMobileNav"
import { AppTopbar } from "./AppTopbar"
import { useAuth } from "../contexts/AuthContext"

export function AmbassadorLayout() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen min-h-dvh bg-bg-dark text-white flex overflow-x-hidden">
      {/* Fixed sidebar — desktop only */}
      <AmbassadorSidebar profile={profile} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AppTopbar profile={profile} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <AmbassadorMobileNav />
    </div>
  )
}
