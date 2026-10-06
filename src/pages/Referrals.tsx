import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { supabase } from "../lib/supabase"
import { Copy, Users, CheckCircle2 } from "lucide-react"

export const Referrals = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referredFriends, setReferredFriends] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: ambData } = await supabase.from('ambassadors').select('*').eq('user_id', user.id).single()
        setProfile(ambData)
        
        if (ambData?.referral_code) {
          const { data: friends } = await supabase
            .from('ambassadors')
            .select('full_name, current_level, created_at, status')
            .eq('referred_by', ambData.referral_code)
          
          if (friends) setReferredFriends(friends)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const inviteLink = profile?.referral_code 
    ? `${window.location.origin}/register?ref=${profile.referral_code}` 
    : ""

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-bg-card rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-bg-card rounded-xl"></div>
        <div className="h-64 bg-bg-card rounded-xl"></div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader title="Refer a Friend" subtitle="Invite your friends to join the Ambassador program and earn rewards!" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col items-center justify-center text-center p-8 border-primary/20 bg-bg-dark">
          <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center text-primary mb-6">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Share Your Link</h3>
          <p className="text-text-muted mb-8">When your friends register using your unique link and get approved, you both earn bonus points.</p>
          
          <div className="w-full relative">
            <div className="bg-bg-card border border-border-dark p-4 rounded-lg flex items-center justify-between gap-4">
              <span className="text-white truncate font-medium flex-1 text-left">{inviteLink || 'Generating your link...'}</span>
              <Button onClick={handleCopy} disabled={!inviteLink} className="shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold text-white mb-6">Your Referrals</h3>
          {referredFriends.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>You haven't referred anyone yet.</p>
              <p className="text-sm mt-1">Share your link to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referredFriends.map((friend, i) => (
                <div key={i} className="bg-bg-dark border border-border-dark p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{friend.full_name}</h4>
                    <p className="text-sm text-text-muted">Joined {new Date(friend.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${friend.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {friend.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
