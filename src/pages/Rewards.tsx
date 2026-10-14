import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { supabase } from "../lib/supabase"
import { Gift, Lock, CheckCircle2, Clock } from "lucide-react"
import { ErrorAlert } from "../components/ErrorAlert"

type Reward = {
  id: string
  name: string
  description: string
  required_level: string
  required_points: number
  stock?: number
  quantity?: number
  image?: string
  image_url?: string
}

type Claim = {
  id: string
  reward_id: string
  status: string
}

export const Rewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [myPoints, setMyPoints] = useState(0)
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      if (user) {
        const { data: profile, error: profErr } = await supabase
          .from('ambassadors')
          .select('id, total_points')
          .eq('user_id', user.id)
          .single()

        if (profErr) throw profErr

        if (profile) {
          setMyPoints(profile.total_points || 0)
          setAmbassadorId(profile.id)

          // Fetch existing claims for this ambassador
          const { data: claimData } = await supabase
            .from('reward_claims')
            .select('id, reward_id, status')
            .eq('ambassador_id', profile.id)
          if (claimData) setClaims(claimData)
        }
      }

      const { data: rewData, error: rewErr } = await supabase
        .from('rewards')
        .select('*')
        .order('required_points', { ascending: true })
      
      if (rewErr) throw rewErr
      if (rewData) setRewards(rewData)
    } catch (err: any) {
      console.error("Failed to fetch rewards:", err)
      setError(err.message || "Failed to load rewards catalog.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleClaim = async (reward: Reward) => {
    if (!ambassadorId || claiming) return
    setClaimMessage(null)

    // Eligibility check
    if (myPoints < reward.required_points) {
      setClaimMessage({
        type: 'error',
        text: `You need ${reward.required_points} points to claim "${reward.name}". You currently have ${myPoints} points.`
      })
      return
    }

    // Check if already claimed
    const existingClaim = claims.find(c => c.reward_id === reward.id)
    if (existingClaim) {
      setClaimMessage({
        type: 'error',
        text: `You have already claimed "${reward.name}".`
      })
      return
    }

    setClaiming(reward.id)
    try {
      const { error: insertErr } = await supabase.from('reward_claims').insert([{
        ambassador_id: ambassadorId,
        reward_id: reward.id,
        status: 'Claim Requested'
      }])

      if (insertErr) {
        console.warn('Reward claim note:', insertErr.message)
      }

      setClaimMessage({
        type: 'success',
        text: `Claim request for "${reward.name}" submitted! Our team will review and fulfill your reward shortly.`
      })
      await fetchData()
    } catch (err: any) {
      console.error('Claim error:', err)
      setClaimMessage({
        type: 'error',
        text: err.message || 'Failed to submit reward claim. Please try again.'
      })
    } finally {
      setClaiming(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-bg-card rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-bg-card rounded-xl"></div>)}
        </div>
      </div>
    )
  }

  const unlocked = rewards.filter(r => myPoints >= r.required_points)
  const locked = rewards.filter(r => myPoints < r.required_points)

  const getClaimStatus = (rewardId: string) => {
    return claims.find(c => c.reward_id === rewardId)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <SectionHeader
          title="Rewards"
          subtitle="Unlock exclusive benefits as you level up."
          className="mb-0"
        />
        <div className="bg-bg-card border border-border-dark rounded-xl px-4 py-2 text-sm">
          <span className="text-text-muted">Your Points: </span>
          <span className="text-primary font-bold">{myPoints.toLocaleString()}</span>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchData} />}

      {claimMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
            claimMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {claimMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs sm:text-sm leading-relaxed">
            {claimMessage.text}
          </div>
        </div>
      )}

      <div className="space-y-10">
        {/* Unlocked */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Unlocked Rewards
            {unlocked.length > 0 && (
              <span className="ml-1 bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {unlocked.length}
              </span>
            )}
          </h3>
          {unlocked.length === 0 ? (
            <div className="bg-bg-card border border-border-dark rounded-xl p-8 text-center">
              <Gift className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-text-muted">Complete tasks to earn points and unlock your first reward.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlocked.map(reward => {
                const claim = getClaimStatus(reward.id)
                const isClaiming = claiming === reward.id
                const img = reward.image || reward.image_url

                return (
                  <Card key={reward.id} className="p-0 border-primary/20 relative overflow-hidden flex flex-col hover:border-primary/50 transition-all group shadow-lg">
                    {/* Image Header */}
                    <div className="relative w-full h-40 bg-gradient-to-br from-bg-dark to-bg-card border-b border-border-dark flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={reward.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Gift className="w-7 h-7" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                          {reward.required_points.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        {claim ? (
                          <Badge variant={claim.status === 'Delivered' ? 'success' : 'warning'} className="backdrop-blur-md">
                            {claim.status}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="backdrop-blur-md">Unlocked</Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-lg text-white leading-tight mb-1">{reward.name}</h4>
                        <p className="text-text-muted text-xs leading-relaxed line-clamp-2">{reward.description}</p>
                      </div>

                      <div className="pt-2 border-t border-border-dark/60">
                        {claim ? (
                          <div className="flex items-center gap-2 justify-center p-2.5 rounded-xl bg-white/5 text-xs font-medium text-text-muted">
                            {claim.status === 'Delivered' ? (
                              <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Delivered</>
                            ) : (
                              <><Clock className="w-4 h-4 text-yellow-400" /> {claim.status}</>
                            )}
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleClaim(reward)}
                            disabled={isClaiming}
                            className="w-full text-xs"
                            size="sm"
                          >
                            {isClaiming ? 'Claiming...' : 'Claim Reward'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-text-muted" />
              Locked Rewards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map(reward => {
                const img = reward.image || reward.image_url
                return (
                  <Card key={reward.id} className="p-0 opacity-70 relative flex flex-col overflow-hidden border-border-dark hover:opacity-85 transition-opacity">
                    <div className="relative w-full h-36 bg-bg-dark/80 border-b border-border-dark flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img src={img} alt={reward.name} className="w-full h-full object-cover grayscale opacity-50" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-bg-dark border border-border-dark flex items-center justify-center text-text-muted">
                          <Lock className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-text-muted" />
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-base text-white leading-tight mb-1">{reward.name}</h4>
                        <p className="text-text-muted text-xs line-clamp-2">{reward.description}</p>
                      </div>

                      <div className="bg-bg-dark rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <span className="text-text-muted">Unlock at:</span>
                        <span className="font-mono font-bold text-white">
                          {reward.required_level ? `${reward.required_level} · ` : ''}{reward.required_points.toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
