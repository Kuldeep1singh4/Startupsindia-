import { Bell, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

// Single topbar shared by ambassador and admin — no search bar (item 5 Phase 7.3)
export function AppTopbar({ profile, showProfileLink = true }: { profile: any; showProfileLink?: boolean }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <header className="h-14 border-b border-border-dark bg-bg-dark/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: Logo on mobile only */}
      <div className="md:hidden font-bold text-white tracking-tight">
        Startups<span className="text-primary">India</span>
      </div>
      <div className="hidden md:block" /> {/* spacer */}

      {/* Right: Bell + Avatar */}
      <div className="flex items-center gap-1">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
            className="relative p-2.5 text-text-muted hover:text-white transition-colors rounded-xl hover:bg-white/5 active:bg-white/8"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border border-bg-dark"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-bg-card border border-border-dark shadow-2xl rounded-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border-dark">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <Bell className="w-8 h-8 mb-2 opacity-15" />
                <p className="text-sm">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar — top-right is the ONLY profile entry on mobile (item 4 Phase 7.3) */}
        {profile && (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
              className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-bold text-xs hover:bg-primary/25 transition-colors ml-1"
              aria-label="Account menu"
            >
              {initials}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-bg-card border border-border-dark shadow-2xl rounded-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-dark">
                  <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {profile.role === 'admin' ? 'Administrator' : (profile.current_level || 'Ambassador')}
                  </p>
                </div>
                <div className="p-1.5">
                  {showProfileLink && profile.role !== 'admin' && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/8 transition-colors w-full"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
