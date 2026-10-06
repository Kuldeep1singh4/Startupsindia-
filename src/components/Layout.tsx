import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { Topbar } from "./Topbar"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function Layout() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('ambassadors')
          .select('id, full_name, email, role, current_level, total_points, referral_code, mobile_number, college_name, city, district, state, status')
          .eq('user_id', user.id)
          .single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  return (
    <div className="min-h-screen min-h-dvh bg-bg-dark text-white flex overflow-x-hidden">
      {/* Fixed sidebar — desktop only */}
      <Sidebar profile={profile} />

      {/* Main content: offset by sidebar width on md+ */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Topbar profile={profile} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet context={{ profile }} />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav profile={profile} />
    </div>
  )
}
