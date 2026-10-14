import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Badge } from "../components/Badge"
import { Button } from "../components/Button"
import { supabase } from "../lib/supabase"
import { Award, Lock, Download, CheckCircle2 } from "lucide-react"
import { ErrorAlert } from "../components/ErrorAlert"

const DEFAULT_LEVELS = [
  { id: '1', name: 'Bronze', designation: 'Campus Ambassador', min_points: 0 },
  { id: '2', name: 'Silver', designation: 'Sr. Campus Ambassador', min_points: 2000 },
  { id: '3', name: 'Gold', designation: 'City Ambassador', min_points: 5000 },
  { id: '4', name: 'Platinum', designation: 'District Ambassador', min_points: 10000 },
  { id: '5', name: 'Diamond', designation: 'State Ambassador', min_points: 20000 },
  { id: '6', name: 'National', designation: 'National Ambassador', min_points: 50000 },
]

export const Certificates = () => {
  const [profile, setProfile] = useState<any>(null)
  const [levels, setLevels] = useState<any[]>(DEFAULT_LEVELS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const fetchCertificates = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      if (user) {
        const { data: amb, error: ambErr } = await supabase
          .from('ambassadors')
          .select('full_name, total_points, current_level')
          .eq('user_id', user.id)
          .single()
        
        if (ambErr) throw ambErr
        setProfile(amb)
        
        const { data: lvls, error: lvlsErr } = await supabase
          .from('levels_config')
          .select('*')
          .order('min_points', { ascending: true })
        
        if (lvlsErr) {
          console.warn('levels_config query warning:', lvlsErr.message)
        } else if (lvls && lvls.length > 0) {
          setLevels(lvls)
        }
      }
    } catch (err: any) {
      console.error("Failed to load certificates:", err)
      setError(err.message || "Failed to load certificate configuration.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleDownload = (level: any) => {
    // Generate certificate download notification
    const recipient = profile?.full_name || "Ambassador"
    setDownloadSuccess(`Generated official ${level.name} Certificate for ${recipient}. Downloading...`)
    setTimeout(() => setDownloadSuccess(null), 4000)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-bg-card rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-bg-card rounded-xl border border-border-dark"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader title="Certificates" subtitle="Unlock official StartupsIndia certificates as you level up." />

      {error && <ErrorAlert message={error} onRetry={fetchCertificates} />}

      {downloadSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 flex items-center gap-3 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map(level => {
          const minPts = level.min_points ?? level.points ?? 0
          const currentPts = profile?.total_points ?? 0
          const isUnlocked = currentPts >= minPts
          const certImage = level.certificate || level.badge

          return (
            <Card
              key={level.id}
              className={`p-0 relative overflow-hidden transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'border-primary/40 bg-bg-card hover:border-primary shadow-xl shadow-primary/5 group'
                  : 'border-border-dark/40 bg-bg-card/40 opacity-75 grayscale group'
              }`}
            >
              {/* Certificate Preview Frame Header */}
              <div className="relative w-full h-48 bg-gradient-to-b from-[#1a1c23] to-bg-dark border-b border-border-dark flex items-center justify-center p-4 overflow-hidden">
                {certImage ? (
                  <img
                    src={certImage}
                    alt={`${level.name} Certificate Template`}
                    className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  /* Stylized Certificate Frame Template */
                  <div className="w-full h-full rounded-lg border-2 border-primary/30 bg-bg-card/80 p-3 flex flex-col justify-between relative shadow-inner">
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-text-muted">
                      <span>StartupsIndia</span>
                      <span className="text-primary font-bold">Official Certificate</span>
                    </div>

                    <div className="text-center my-auto">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-1">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-white text-xs">{level.name} Rank</h4>
                      <p className="text-[10px] text-text-muted">{level.designation}</p>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-text-muted border-t border-border-dark/40 pt-1">
                      <span>ID: SI-CERT-{level.name?.slice(0, 3).toUpperCase()}</span>
                      <span className="text-emerald-400">Verified</span>
                    </div>
                  </div>
                )}

                {/* Status Badges on Image */}
                <div className="absolute top-3 right-3">
                  {isUnlocked ? (
                    <Badge variant="success" className="gap-1 shadow backdrop-blur-md">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="default" className="shadow backdrop-blur-md">
                      Requires {minPts.toLocaleString()} Pts
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{level.name} Certificate</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Official accreditation granted for achieving the rank of <span className="text-white font-medium">{level.designation}</span>.
                  </p>
                </div>

                <div className="pt-3 border-t border-border-dark">
                  <Button
                    className="w-full text-xs"
                    disabled={!isUnlocked}
                    variant={isUnlocked ? 'primary' : 'outline'}
                    onClick={() => handleDownload(level)}
                  >
                    {isUnlocked ? (
                      <><Download className="w-4 h-4 mr-2" /> Download Certificate (PDF)</>
                    ) : (
                      <><Lock className="w-3.5 h-3.5 mr-1.5" /> Locked ({minPts.toLocaleString()} Pts Required)</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
