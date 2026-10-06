import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Badge } from "../components/Badge"
import { Button } from "../components/Button"
import { supabase } from "../lib/supabase"
import { Trophy, Medal, Building2 } from "lucide-react"

type AmbassadorRank = {
  id: string
  full_name: string
  college_name: string
  current_level: string
  total_points?: number
  period_points?: number
  state: string
  district: string
  city: string
}

type CollegeRank = {
  college_name: string
  state: string
  district: string
  city: string
  total_points: number
}

export const Leaderboard = () => {
  const [ambassadors, setAmbassadors] = useState<AmbassadorRank[]>([])
  const [colleges, setColleges] = useState<CollegeRank[]>([])
  const [view, setView] = useState<'individual' | 'college'>('individual')
  const [locationFilter, setLocationFilter] = useState<'India' | 'State' | 'District' | 'City'>('India')
  const [periodFilter, setPeriodFilter] = useState<'All Time' | 'Monthly' | 'Quarterly'>('All Time')
  
  const [myProfile, setMyProfile] = useState<AmbassadorRank | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      let profile = null
      if (user) {
        const { data } = await supabase.from('ambassadors').select('*').eq('user_id', user.id).single()
        profile = data
        setMyProfile(data)
      }

      if (view === 'individual') {
        if (periodFilter === 'All Time') {
          let query = supabase.from('ambassadors').select('id, full_name, college_name, current_level, total_points, state, district, city').eq('status', 'Approved').order('total_points', { ascending: false }).limit(100)
          if (profile && locationFilter !== 'India') {
            if (locationFilter === 'State') query = query.eq('state', profile.state)
            if (locationFilter === 'District') query = query.eq('district', profile.district)
            if (locationFilter === 'City') query = query.eq('city', profile.city)
          }
          const { data } = await query
          if (data) setAmbassadors(data)
        } else {
          // Time-based filtering
          const now = new Date()
          let startDate = new Date()
          if (periodFilter === 'Monthly') {
            startDate.setMonth(now.getMonth() - 1)
          } else if (periodFilter === 'Quarterly') {
            startDate.setMonth(now.getMonth() - 3)
          }
          
          const { data } = await supabase.rpc('get_period_leaderboard', { 
            start_date: startDate.toISOString(), 
            end_date: now.toISOString() 
          })
          
          if (data) {
            let filteredData = data
            if (profile && locationFilter !== 'India') {
              if (locationFilter === 'State') filteredData = data.filter((d: any) => d.state === profile.state)
              if (locationFilter === 'District') filteredData = data.filter((d: any) => d.district === profile.district)
              if (locationFilter === 'City') filteredData = data.filter((d: any) => d.city === profile.city)
            }
            setAmbassadors(filteredData.slice(0, 100))
          }
        }
      } else {
        // College View
        if (periodFilter === 'All Time') {
          let query = supabase.from('college_leaderboard').select('*').limit(100)
          if (profile && locationFilter !== 'India') {
            if (locationFilter === 'State') query = query.eq('state', profile.state)
            if (locationFilter === 'District') query = query.eq('district', profile.district)
            if (locationFilter === 'City') query = query.eq('city', profile.city)
          }
          const { data } = await query
          if (data) setColleges(data)
        } else {
          const now = new Date()
          let startDate = new Date()
          if (periodFilter === 'Monthly') {
            startDate.setMonth(now.getMonth() - 1)
          } else if (periodFilter === 'Quarterly') {
            startDate.setMonth(now.getMonth() - 3)
          }
          const { data } = await supabase.rpc('get_period_college_leaderboard', { 
            start_date: startDate.toISOString(), 
            end_date: now.toISOString() 
          })
          if (data) {
            let filteredData = data
            if (profile && locationFilter !== 'India') {
              if (locationFilter === 'State') filteredData = data.filter((d: any) => d.state === profile.state)
              if (locationFilter === 'District') filteredData = data.filter((d: any) => d.district === profile.district)
              if (locationFilter === 'City') filteredData = data.filter((d: any) => d.city === profile.city)
            }
            setColleges(filteredData.slice(0, 100))
          }
        }
      }

      setLoading(false)
    }

    fetchLeaderboard()
  }, [locationFilter, periodFilter, view])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader title="Leaderboard" subtitle="See how you rank across India." className="mb-0 md:mb-0" />
        <div className="flex gap-2">
          <Button variant={view === 'individual' ? 'primary' : 'outline'} onClick={() => setView('individual')} size="sm">
            <Trophy className="w-4 h-4 mr-2" /> Ambassadors
          </Button>
          <Button variant={view === 'college' ? 'primary' : 'outline'} onClick={() => setView('college')} size="sm">
            <Building2 className="w-4 h-4 mr-2" /> Colleges
          </Button>
        </div>
      </div>

      <Card className="flex flex-col sm:flex-row gap-4 p-4 border-t-4 border-t-primary">
        <div className="flex-1">
          <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1 block">Location Filter</label>
          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value as any)}
            className="w-full bg-bg-dark border border-border-dark rounded-md p-2 text-white focus:outline-none focus:border-primary"
          >
            <option>India</option>
            <option>State</option>
            <option>District</option>
            <option>City</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1 block">Period Filter</label>
          <select 
            value={periodFilter} 
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="w-full bg-bg-dark border border-border-dark rounded-md p-2 text-white focus:outline-none focus:border-primary"
          >
            <option>All Time</option>
            <option>Monthly</option>
            <option>Quarterly</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-bg-card rounded-xl"></div>
          ))}
        </div>
      ) : view === 'individual' ? (
        <div className="bg-bg-card border border-border-dark rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dark bg-bg-dark/50">
                <th className="p-4 text-text-muted font-bold text-sm w-16 text-center">Rank</th>
                <th className="p-4 text-text-muted font-bold text-sm">Ambassador</th>
                <th className="p-4 text-text-muted font-bold text-sm hidden md:table-cell">College</th>
                <th className="p-4 text-text-muted font-bold text-sm hidden sm:table-cell">Level</th>
                <th className="p-4 text-text-muted font-bold text-sm text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {ambassadors.map((amb, index) => (
                <tr key={amb.id} className={`border-b border-border-dark/50 hover:bg-white/5 transition-colors ${myProfile?.id === amb.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                  <td className="p-4 text-center">
                    {index === 0 ? <Medal className="w-6 h-6 text-yellow-400 mx-auto" /> : 
                     index === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> : 
                     index === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> : 
                     <span className="font-bold text-text-muted">{index + 1}</span>}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{amb.full_name}</div>
                    <div className="text-xs text-text-muted md:hidden">{amb.college_name}</div>
                  </td>
                  <td className="p-4 text-text-muted hidden md:table-cell">{amb.college_name}</td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant="outline">{amb.current_level}</Badge>
                  </td>
                  <td className="p-4 text-right font-bold text-primary text-lg">
                    {periodFilter === 'All Time' ? amb.total_points : amb.period_points}
                  </td>
                </tr>
              ))}
              {ambassadors.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-text-muted">No ambassadors found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-bg-card border border-border-dark rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dark bg-bg-dark/50">
                <th className="p-4 text-text-muted font-bold text-sm w-16 text-center">Rank</th>
                <th className="p-4 text-text-muted font-bold text-sm">College</th>
                <th className="p-4 text-text-muted font-bold text-sm text-right">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((college, index) => (
                <tr key={college.college_name} className={`border-b border-border-dark/50 hover:bg-white/5 transition-colors ${myProfile?.college_name === college.college_name ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                  <td className="p-4 text-center">
                    {index === 0 ? <Trophy className="w-6 h-6 text-yellow-400 mx-auto" /> : 
                     index === 1 ? <Trophy className="w-6 h-6 text-gray-400 mx-auto" /> : 
                     index === 2 ? <Trophy className="w-6 h-6 text-amber-600 mx-auto" /> : 
                     <span className="font-bold text-text-muted">{index + 1}</span>}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-lg">{college.college_name}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-primary text-xl">
                    {college.total_points}
                  </td>
                </tr>
              ))}
              {colleges.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-text-muted">No colleges found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
