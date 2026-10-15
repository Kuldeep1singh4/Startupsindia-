import { Outlet } from "react-router-dom"
import { AmbassadorSidebar } from "./AmbassadorSidebar"
import { AmbassadorMobileNav } from "./AmbassadorMobileNav"
import { AppTopbar } from "./AppTopbar"
import { useAuth } from "../contexts/AuthContext"

export function AmbassadorLayout() {
  const { profile } = useAuth()

  return (
    <div className="h-screen h-dvh bg-bg-dark text-white flex overflow-hidden">
      {/* ── Fixed / Static Sidebar (Desktop) ───────────── */}
      <AmbassadorSidebar profile={profile} />

      {/* ── Main Column ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header — Fixed & Static */}
        <AppTopbar profile={profile} />

        {/* Middle Main Content — ONLY this area scrolls */}
        <main data-scroll-container className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-12">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ──────────────────────────── */}
      <AmbassadorMobileNav />
    </div>
  )
}
