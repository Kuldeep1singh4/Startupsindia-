import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Badge } from "../components/Badge"
import { Button } from "../components/Button"
import { supabase } from "../lib/supabase"
import { Award, Lock, Download } from "lucide-react"

export const Certificates = () => {
  const [profile, setProfile] = useState<any>(null)
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: amb } = await supabase.from('ambassadors').select('total_points, current_level').eq('user_id', user.id).single()
        setProfile(amb)
        
        const { data: lvls } = await supabase.from('levels_config').select('*').order('min_points', { ascending: true })
        if (lvls) setLevels(lvls)
      }
      setLoading(false)
    }
    fetchCertificates()
  }, [])

  if (loading) return <div className="text-white text-center py-12">Loading certificates...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader title="Certificates" subtitle="Unlock official StartupsIndia certificates as you level up." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map(level => {
          const isUnlocked = profile?.total_points >= level.min_points
          return (
            <Card key={level.id} className={`relative overflow-hidden ${isUnlocked ? 'border-primary/50 bg-bg-dark' : 'border-border-dark/30 bg-bg-dark/50 opacity-75 grayscale'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-primary/20 text-primary' : 'bg-bg-dark border border-border-dark text-text-muted'}`}>
                  {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                {isUnlocked ? <Badge variant="success">Unlocked</Badge> : <Badge variant="default">Requires {level.min_points} Pts</Badge>}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{level.name} Certificate</h3>
              <p className="text-sm text-text-muted mb-6">Awarded for achieving the rank of {level.designation}.</p>
              
              <Button className="w-full" disabled={!isUnlocked} variant={isUnlocked ? 'primary' : 'outline'}>
                {isUnlocked ? <><Download className="w-4 h-4 mr-2" /> Download PDF</> : "Locked"}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
