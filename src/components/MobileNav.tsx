import { Link, useLocation } from "react-router-dom"
import { Home, CheckSquare, Trophy, Gift, User, Settings } from "lucide-react"
import { cn } from "../lib/utils"

export function MobileNav({ profile }: { profile: any }) {
  const location = useLocation()

  const navItems = profile?.role === 'admin'
    ? [
        { name: 'Admin', path: '/admin', icon: Settings },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Leaders', path: '/leaderboard', icon: Trophy },
        { name: 'Rewards', path: '/rewards', icon: Gift },
        { name: 'Profile', path: '/profile', icon: User },
      ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-card/95 backdrop-blur-md border-t border-border-dark pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 rounded-lg mx-0.5",
                isActive 
                  ? "text-primary" 
                  : "text-text-muted active:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[10px] font-semibold", isActive ? "text-primary" : "text-text-muted")}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
