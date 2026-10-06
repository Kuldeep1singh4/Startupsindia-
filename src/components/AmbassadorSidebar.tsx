import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, CheckSquare, Trophy, Gift, Award, UserPlus, LogOut } from "lucide-react"
import { cn } from "../lib/utils"
import { supabase } from "../lib/supabase"

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Rewards', path: '/rewards', icon: Gift },
  { name: 'Certificates', path: '/certificates', icon: Award },
  { name: 'Refer a Friend', path: '/referrals', icon: UserPlus },
]

export function AmbassadorSidebar({ profile }: { profile: any }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <aside className="hidden md:flex w-64 flex-col bg-bg-card border-r border-border-dark h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-border-dark shrink-0">
        <Link to="/dashboard" className="text-xl font-bold text-white tracking-tight">
          Startups<span className="text-primary">India</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold px-3 mb-2">Menu</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm group",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-text-muted group-hover:text-white")} />
                {item.name}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User block — single profile entry (item 4 of Phase 7.3) */}
      {profile && (
        <div className="p-3 border-t border-border-dark shrink-0">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-bold text-sm shrink-0 group-hover:bg-primary/25 transition-colors">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-primary font-medium truncate">
                {profile.current_level || 'Bronze Ambassador'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/8 transition-colors w-full mt-0.5 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
