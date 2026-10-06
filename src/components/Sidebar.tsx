import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, CheckSquare, Trophy, Gift, Award, Settings, UserPlus, LogOut } from "lucide-react"
import { cn } from "../lib/utils"
import { supabase } from "../lib/supabase"

const AMBASSADOR_NAV = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Rewards', path: '/rewards', icon: Gift },
  { name: 'Certificates', path: '/certificates', icon: Award },
  { name: 'Refer a Friend', path: '/referrals', icon: UserPlus },
]

const ADMIN_NAV = [
  { name: 'Admin Portal', path: '/admin', icon: Settings },
]

export function Sidebar({ profile }: { profile: any }) {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = profile?.role === 'admin' ? ADMIN_NAV : AMBASSADOR_NAV

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex w-64 flex-col bg-bg-card border-r border-border-dark h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-border-dark shrink-0">
        <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-bold text-white tracking-tight hover:opacity-90 transition-opacity">
          Startups<span className="text-primary">India</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm group",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10"
                )}
              >
                <Icon className={cn(
                  "w-4.5 h-4.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-text-muted group-hover:text-white"
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Info Block — profile entry point (items 7) */}
      {profile && (
        <div className="p-3 border-t border-border-dark shrink-0">
          <Link
            to={profile.role === 'admin' ? '#' : '/profile'}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0 group-hover:bg-primary/30 transition-colors">
              {profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-primary font-medium truncate">
                {profile.role === 'admin' ? 'Administrator' : (profile.current_level || 'Ambassador')}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors w-full mt-1 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
