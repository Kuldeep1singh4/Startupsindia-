import { Bell, LogOut, CheckSquare, Gift, AlertCircle, Megaphone, Plus, ExternalLink } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Logo } from "./Logo"
import {
  type AppNotification,
  fetchNotifications,
  getReadNotificationIds,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../lib/notifications"

export function AppTopbar({ profile, showProfileLink = true }: { profile: any; showProfileLink?: boolean }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications()
      setNotifications(data)
      setReadIds(getReadNotificationIds())
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadNotifications()

    const handleAdded = () => {
      loadNotifications()
    }
    window.addEventListener('startupsindia:notification_added', handleAdded)
    return () => window.removeEventListener('startupsindia:notification_added', handleAdded)
  }, [])

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

  const homeRoute = profile?.role === 'admin' ? '/admin' : '/dashboard'
  const isAdmin = profile?.role === 'admin'

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowUserMenu(false)
  }

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(notifications)
    setReadIds(notifications.map(n => n.id))
  }

  const handleItemClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id)
    setReadIds(prev => [...prev, notif.id])
    if (notif.action_url) {
      setShowNotifications(false)
      navigate(notif.action_url)
    }
  }

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-amber-400" />
      case 'reward':
        return <Gift className="w-4 h-4 text-emerald-400" />
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-rose-400" />
      default:
        return <Megaphone className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <header className="h-14 border-b border-border-dark bg-bg-dark/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* ── Left Header Area ────────────────────────────── */}
      {/* In Admin mode: StartupsIndia logo is placed prominently on top-left (Task 1) */}
      {isAdmin ? (
        <div className="flex items-center gap-3">
          <Logo size="sm" to="/admin" />
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
            Admin
          </span>
        </div>
      ) : (
        <>
          {/* In Ambassador mode: logo shows on mobile; desktop has logo in AmbassadorSidebar */}
          <div className="md:hidden">
            <Logo size="sm" to={homeRoute} />
          </div>
          <div className="hidden md:block" />
        </>
      )}

      {/* ── Right Header Area: Bell + Avatar ──────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotifications}
            className="relative p-2.5 text-text-muted hover:text-white transition-colors rounded-xl hover:bg-white/5 active:bg-white/8"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-primary text-white text-[10px] font-bold rounded-full border-2 border-bg-dark flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-bg-card border border-border-dark shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in duration-150">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between bg-bg-card">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-text-muted hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border-dark/60">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                    <Bell className="w-8 h-8 mb-2 opacity-15" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = !readIds.includes(notif.id)
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleItemClick(notif)}
                        className={`p-3.5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${
                          isUnread ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-bg-dark border border-border-dark flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(notif.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className={`text-xs font-bold leading-tight truncate ${isUnread ? 'text-white' : 'text-white/80'}`}>
                              {notif.title}
                            </p>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-text-muted/70 mt-1.5">
                            <span>
                              {new Date(notif.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                            {notif.action_url && (
                              <span className="text-primary flex items-center gap-1 font-medium">
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Admin Footer Shortcut */}
              {isAdmin && (
                <div className="p-2.5 border-t border-border-dark bg-bg-dark/50 flex justify-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false)
                      navigate('/admin?tab=notifications')
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Manage & Push Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar — Top-right is the SINGLE profile icon */}
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
              <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] bg-bg-card border border-border-dark shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="px-4 py-3 border-b border-border-dark">
                  <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {profile.role === 'admin' ? 'Administrator' : (profile.current_level || 'Ambassador')}
                  </p>
                </div>
                <div className="p-1.5">
                  {profile.role === 'admin' ? (
                    <Link
                      to="/admin?tab=profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Admin Profile
                    </Link>
                  ) : (
                    showProfileLink && (
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Profile
                      </Link>
                    )
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
