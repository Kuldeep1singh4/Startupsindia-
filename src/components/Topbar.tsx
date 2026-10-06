import { Bell, Search, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

export function Topbar({ profile }: { profile: any }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="h-16 border-b border-border-dark bg-bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
      {/* Left: Logo on mobile, Search on desktop */}
      <div className="flex items-center gap-4">
        <div className="md:hidden font-bold text-white tracking-tight text-lg">
          Startups<span className="text-primary">India</span>
        </div>

        <div className="hidden md:flex items-center bg-bg-dark border border-border-dark rounded-full px-4 py-2 w-64 text-sm text-text-muted hover:border-primary/50 transition-colors focus-within:border-primary">
          <Search className="w-4 h-4 mr-2 shrink-0" />
          <span>Search...</span>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
            className="relative p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5 active:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-bg-card"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-bg-card border border-border-dark shadow-2xl rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-border-dark flex items-center justify-between">
                <h3 className="font-bold text-white">Notifications</h3>
                <span className="text-xs text-text-muted">Mark all read</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                  <p className="text-xs mt-1 opacity-60">No new notifications</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User avatar — desktop: visible. Mobile: visible but links to profile */}
        {profile && (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
              className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors"
              aria-label="User menu"
            >
              {initials}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-bg-card border border-border-dark shadow-2xl rounded-xl overflow-hidden z-50">
                <div className="p-4 border-b border-border-dark">
                  <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
                  <p className="text-xs text-primary font-semibold mt-0.5 truncate">
                    {profile.role === 'admin' ? 'Administrator' : profile.current_level || 'Ambassador'}
                  </p>
                </div>
                <div className="p-2">
                  {profile.role !== 'admin' && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors w-full"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
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
