import { Link, useLocation } from "react-router-dom"
import { Home, CheckSquare, Trophy, Gift, User } from "lucide-react"
import { cn } from "../lib/utils"

const NAV_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Leaders', path: '/leaderboard', icon: Trophy },
  { name: 'Rewards', path: '/rewards', icon: Gift },
  { name: 'Profile', path: '/profile', icon: User },
]

export function AmbassadorMobileNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted glass bar */}
      <div className="bg-bg-card/95 backdrop-blur-xl border-t border-border-dark pb-safe">
        <div className="flex items-stretch justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-150 rounded-xl mx-0.5 my-1.5 active:scale-95",
                  isActive ? "text-primary" : "text-text-muted"
                )}
              >
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                  isActive ? "bg-primary/15" : "bg-transparent"
                )}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={cn("text-[10px] font-semibold leading-none", isActive ? "text-primary" : "text-text-muted")}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
