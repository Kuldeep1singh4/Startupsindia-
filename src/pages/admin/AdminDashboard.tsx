import { useEffect, useState } from "react"
import { Card } from "../../components/Card"
import { supabase } from "../../lib/supabase"
import { Users, FileText, CheckSquare, Award } from "lucide-react"

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAmbassadors: 0,
    pendingApps: 0,
    tasksCompleted: 0,
    pendingReviews: 0,
    totalPoints: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      const { count: totalAmb } = await supabase.from('ambassadors').select('*', { count: 'exact', head: true }).eq('status', 'Approved')
      const { count: pendingApp } = await supabase.from('ambassadors').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
      const { count: tasksDone } = await supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'Approved')
      const { count: pendingRev } = await supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
      
      const { data: pointsData } = await supabase.from('ambassadors').select('total_points').eq('status', 'Approved')
      const totalPts = pointsData ? pointsData.reduce((acc, curr) => acc + curr.total_points, 0) : 0

      setStats({
        totalAmbassadors: totalAmb || 0,
        pendingApps: pendingApp || 0,
        tasksCompleted: tasksDone || 0,
        pendingReviews: pendingRev || 0,
        totalPoints: totalPts
      })
    }
    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-text-muted"><Users className="w-4 h-4" /> Total Ambassadors</div>
        <div className="text-3xl font-bold text-white">{stats.totalAmbassadors}</div>
      </Card>
      <Card className="flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-text-muted"><FileText className="w-4 h-4" /> Pending Applications</div>
        <div className="text-3xl font-bold text-yellow-500">{stats.pendingApps}</div>
      </Card>
      <Card className="flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-text-muted"><CheckSquare className="w-4 h-4" /> Tasks Completed</div>
        <div className="text-3xl font-bold text-green-500">{stats.tasksCompleted}</div>
      </Card>
      <Card className="flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-text-muted"><Award className="w-4 h-4" /> Pending Task Reviews</div>
        <div className="text-3xl font-bold text-primary">{stats.pendingReviews}</div>
      </Card>
    </div>
  )
}
