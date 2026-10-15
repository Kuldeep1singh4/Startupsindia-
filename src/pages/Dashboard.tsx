import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Badge } from "../components/Badge"
import { supabase } from "../lib/supabase"
import { Lock, Trophy, CheckSquare, Users, Star } from "lucide-react"
import { cn } from "../lib/utils"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ErrorAlert } from "../components/ErrorAlert"

const LEVELS = [
  { name: 'Bronze', emoji: '🥉', designation: 'Campus Ambassador', points: 0 },
  { name: 'Silver', emoji: '🥈', designation: 'Sr. Campus Ambassador', points: 2000 },
  { name: 'Gold', emoji: '🥇', designation: 'City Ambassador', points: 5000 },
  { name: 'Platinum', emoji: '💠', designation: 'District Ambassador', points: 10000 },
  { name: 'Diamond', emoji: '💎', designation: 'State Ambassador', points: 20000 },
  { name: 'National', emoji: '🏅', designation: 'National Ambassador', points: 50000 },
]

export const Dashboard = () => {
  const { profile } = useAuth()
  const [completedTasks, setCompletedTasks] = useState(0)
  const [referralsCount, setReferralsCount] = useState(0)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    if (!profile) { setLoading(false); return }
    setLoading(true)
    setError(null)

    try {
      // Parallel fetch for counts (not in context)
      const [
        { count: taskCount, error: taskErr },
        { count: refCount, error: refErr },
        { count: rankCount, error: rankErr },
      ] = await Promise.all([
        supabase.from('task_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('ambassador_id', profile.id)
          .eq('status', 'Approved'),
        profile.referral_code
          ? supabase.from('ambassadors')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', profile.referral_code)
          : Promise.resolve({ count: 0, error: null }),
        supabase.from('ambassadors')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Approved')
          .gt('total_points', profile.total_points || 0),
      ])

      if (taskErr) throw taskErr
      if (refErr) throw refErr
      if (rankErr) throw rankErr

      if (taskCount !== null) setCompletedTasks(taskCount)
      if (refCount !== null) setReferralsCount(refCount)
      if (rankCount !== null) setMyRank(rankCount + 1)
    } catch (err: any) {
      console.error("Failed to load dashboard metrics:", err)
      setError(err.message || "Failed to load dashboard statistics.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [profile])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-bg-card rounded-xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className={`h-28 bg-bg-card rounded-xl ${i === 4 ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''}`}></div>)}
        </div>
        <div className="h-56 bg-bg-card rounded-xl"></div>
      </div>
    )
  }

  if (!profile) return (
    <div className="text-white text-center py-20">Profile not found.</div>
  )

  const currentPoints = profile.total_points || 0

  // Find current level index
  let currentLevelIdx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (currentPoints >= LEVELS[i].points) currentLevelIdx = i
  }

  const currentLevel = LEVELS[currentLevelIdx]
  const nextLevel = currentLevelIdx < LEVELS.length - 1 ? LEVELS[currentLevelIdx + 1] : null

  // Progress bar within current segment
  const progressPct = nextLevel
    ? Math.min(100, Math.max(0, ((currentPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100))
    : 100

  // Proportional line width for Journey component
  let journeyProgress = 0
  if (currentPoints >= LEVELS[LEVELS.length - 1].points) {
    journeyProgress = 100
  } else if (nextLevel) {
    const segProgress = (currentPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)
    journeyProgress = ((currentLevelIdx + Math.max(0, Math.min(1, segProgress))) / (LEVELS.length - 1)) * 100
  }

  const statCards = [
    {
      label: 'Current Level',
      value: `${currentLevel.emoji} ${currentLevel.name}`,
      sub: currentLevel.designation,
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      label: 'Total Points',
      value: currentPoints.toLocaleString(),
      sub: nextLevel ? `${nextLevel.points.toLocaleString()} to ${nextLevel.name}` : 'Max Level!',
      icon: Star,
      color: 'text-primary',
      progress: nextLevel ? progressPct : null,
    },
    {
      label: 'Leaderboard Rank',
      value: myRank ? `#${myRank}` : '#—',
      sub: 'India Ranking',
      icon: Trophy,
      color: 'text-blue-400',
    },
    {
      label: 'Tasks Completed',
      value: completedTasks.toString(),
      sub: 'Approved tasks',
      icon: CheckSquare,
      color: 'text-green-400',
    },
    {
      label: 'Students Referred',
      value: referralsCount.toString(),
      sub: 'Total referrals',
      icon: Users,
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-4">
      <SectionHeader
        title={`Welcome back, ${profile.full_name?.split(' ')[0] || 'Ambassador'} 👋`}
        subtitle="Complete tasks, earn points and unlock new opportunities."
      />

      {error && <ErrorAlert message={error} onRetry={fetchAll} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className={cn(
              "flex flex-col justify-between hover:border-border-dark/60 transition-colors group",
              i === 4 ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""
            )}
          >
            <p className="text-text-muted text-xs font-medium mb-2">{stat.label}</p>
            <div>
              <h3 className={cn("font-bold text-lg md:text-xl leading-tight", stat.color)}>
                {stat.value}
              </h3>
              <p className="text-text-muted text-xs mt-1 truncate">{stat.sub}</p>
            </div>
            {stat.progress !== null && stat.progress !== undefined && (
              <div className="w-full bg-border-dark h-1 mt-3 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-700"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Ambassador Journey */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Ambassador Journey</h3>
          {nextLevel && (
            <span className="text-xs text-text-muted">
              {(nextLevel.points - currentPoints).toLocaleString()} pts to {nextLevel.name}
            </span>
          )}
        </div>
        <Card className="overflow-x-auto p-6">
          {/* Journey Rail */}
          <div className="relative min-w-[600px]">
            {/* Background rail */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-border-dark"></div>
            {/* Progress rail */}
            <div
              className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
              style={{ width: `calc(${journeyProgress}% * (100% - 48px) / 100)` }}
            ></div>

            {/* Level nodes */}
            <div className="relative flex items-start justify-between">
              {LEVELS.map((level, idx) => {
                const isUnlocked = currentPoints >= level.points
                const isCurrent = idx === currentLevelIdx

                return (
                  <div key={level.name} className="flex flex-col items-center text-center" style={{ width: `${100 / LEVELS.length}%` }}>
                    {/* Node circle */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 transition-all duration-300 border-2",
                      isUnlocked
                        ? isCurrent
                          ? "bg-primary border-primary shadow-[0_0_20px_rgba(242,51,64,0.4)] scale-110"
                          : "bg-primary/20 border-primary/50"
                        : "bg-bg-dark border-border-dark"
                    )}>
                      {isUnlocked ? (
                        <span>{level.emoji}</span>
                      ) : (
                        <Lock className="w-4 h-4 text-text-muted" />
                      )}
                    </div>

                    {/* Level name */}
                    <h4 className={cn(
                      "text-xs font-bold",
                      isUnlocked ? "text-white" : "text-text-muted"
                    )}>
                      {level.name}
                    </h4>

                    {/* Designation */}
                    <p className="text-[10px] text-text-muted mt-0.5 leading-tight px-1">
                      {level.designation}
                    </p>

                    {/* Status badge */}
                    <div className="mt-2">
                      {isCurrent ? (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0.5">Current</Badge>
                      ) : !isUnlocked ? (
                        <span className="text-[10px] text-text-muted font-medium">
                          {level.points.toLocaleString()} pts
                        </span>
                      ) : (
                        <span className="text-[10px] text-primary font-medium">✓ Done</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/tasks">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-white">View My Tasks</h4>
              <p className="text-text-muted text-sm">Complete tasks to earn points</p>
            </div>
          </Card>
        </Link>
        <Link to="/leaderboard">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white">Leaderboard</h4>
              <p className="text-text-muted text-sm">See how you rank across India</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
