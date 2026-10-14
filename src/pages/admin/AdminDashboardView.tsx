import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Users, FileText, CheckSquare, AlertCircle, Star, TrendingUp } from "lucide-react"
import { Card } from "../../components/Card"
import { ErrorAlert } from "../../components/ErrorAlert"

type Stats = {
  totalAmbassadors: number
  pendingApps: number
  tasksCompleted: number
  pendingReviews: number
  totalPoints: number
  activeToday: number
}

type RecentActivity = {
  id: string
  full_name: string
  status: string
  created_at: string
}

export function AdminDashboardView() {
  const [stats, setStats] = useState<Stats>({
    totalAmbassadors: 0, pendingApps: 0, tasksCompleted: 0,
    pendingReviews: 0, totalPoints: 0, activeToday: 0
  })
  const [recentApplications, setRecentApplications] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        { count: totalAmb, error: ambErr },
        { count: pendingApp, error: appErr },
        { count: tasksDone, error: taskErr },
        { count: pendingRev, error: revErr },
        { data: pointsData, error: ptsErr },
        { data: recentApps, error: recErr },
      ] = await Promise.all([
        supabase.from('ambassadors').select('*', { count: 'exact', head: true }).eq('status', 'Approved').neq('role', 'admin'),
        supabase.from('ambassadors').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'Approved'),
        supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('ambassadors').select('total_points').eq('status', 'Approved'),
        supabase.from('ambassadors').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(6),
      ])

      if (ambErr) throw ambErr
      if (appErr) throw appErr
      if (taskErr) throw taskErr
      if (revErr) throw revErr
      if (ptsErr) throw ptsErr
      if (recErr) throw recErr

      const totalPts = pointsData?.reduce((acc, curr) => acc + (curr.total_points || 0), 0) ?? 0

      setStats({
        totalAmbassadors: totalAmb || 0,
        pendingApps: pendingApp || 0,
        tasksCompleted: tasksDone || 0,
        pendingReviews: pendingRev || 0,
        totalPoints: totalPts,
        activeToday: 0,
      })
      setRecentApplications(recentApps as RecentActivity[] || [])
    } catch (err: any) {
      console.error("Failed to load admin stats:", err)
      setError(err.message || "Failed to load dashboard metrics.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const statCards = [
    { label: 'Active Ambassadors', value: stats.totalAmbassadors, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+' },
    { label: 'Pending Applications', value: stats.pendingApps, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/10', trend: stats.pendingApps > 0 ? '!' : null },
    { label: 'Tasks Approved', value: stats.tasksCompleted, icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10', trend: stats.pendingReviews > 0 ? '!' : null },
    { label: 'Total Points Issued', value: stats.totalPoints.toLocaleString(), icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: null },
    { label: 'Avg Points/Ambassador', value: stats.totalAmbassadors > 0 ? Math.round(stats.totalPoints / stats.totalAmbassadors).toLocaleString() : '0', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10', trend: null },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-bg-card rounded-2xl" />)}
        </div>
        <div className="h-72 bg-bg-card rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && <ErrorAlert message={error} onRetry={fetchAll} />}

      {/* Stats Grid — 2 cols mobile, 3 cols md+, native vertical cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-3.5 sm:p-4 flex flex-col justify-between hover:border-border-dark/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${stat.color}`} />
              </div>
              {stat.trend === '!' && (
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                  Action
                </span>
              )}
            </div>
            <div>
              <div className={`text-xl sm:text-2xl font-black tracking-tight ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-text-muted text-[11px] sm:text-xs font-medium mt-1 leading-tight line-clamp-1">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-muted" />
          Recent Applications
        </h2>
        <Card className="p-0 overflow-hidden border-border-dark">
          {/* Mobile Native List View (< sm) */}
          <div className="block sm:hidden divide-y divide-border-dark/60">
            {recentApplications.length === 0 && (
              <p className="text-center py-8 text-text-muted text-sm">No applications yet.</p>
            )}
            {recentApplications.map((app) => {
              const initials = app.full_name
                ? app.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : '?'
              return (
                <div key={app.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{app.full_name}</p>
                      <p className="text-[11px] text-text-muted">
                        Applied {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                    app.status === 'Approved' ? "bg-green-500/15 text-green-400 border border-green-500/25" :
                    app.status === 'Pending' ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25" :
                    "bg-red-500/15 text-red-400 border border-red-500/25"
                  )}>
                    {app.status}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">Name</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">Applied</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-text-muted text-sm">No applications yet.</td>
                  </tr>
                )}
                {recentApplications.map((app, i) => (
                  <tr key={app.id} className={cn("border-b border-border-dark/50 hover:bg-white/3 transition-colors", i === recentApplications.length - 1 ? "border-b-0" : "")}>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{app.full_name}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider",
                        app.status === 'Approved' ? "bg-green-500/12 text-green-400 border border-green-500/20" :
                        app.status === 'Pending' ? "bg-yellow-500/12 text-yellow-400 border border-yellow-500/20" :
                        "bg-red-500/12 text-red-400 border border-red-500/20"
                      )}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
