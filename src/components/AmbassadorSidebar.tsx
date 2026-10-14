import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, CheckSquare, Trophy, Gift, Award, UserPlus, LogOut } from "lucide-react"
import { cn } from "../lib/utils"
import { supabase } from "../lib/supabase"
import { Logo } from "./Logo"

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
    <aside className="hidden md:flex w-64 flex-col bg-bg-card border-r border-border-dark h-full shrink-0 select-none">
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="h-14 px-6 flex items-center border-b border-border-dark shrink-0">
        <Logo size="md" to="/dashboard" />
      </div>

      {/* ── Navigation Menu (Scrolls internally) ────── */}
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

      {/* ── Bottom Section: Status display & Sign out ──── */}
      {/* Task 5: No duplicate profile button here. Single profile entry is top-right avatar */}
      {profile && (
        <div className="p-3 border-t border-border-dark shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-dark/50 border border-border-dark/60 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-[10px] text-primary font-medium truncate">
                {profile.role === 'admin' ? 'Administrator' : (profile.current_level || 'Bronze Ambassador')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
