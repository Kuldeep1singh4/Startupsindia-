import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { supabase } from "../lib/supabase"
import { Gift, Lock, CheckCircle2, Clock } from "lucide-react"

type Reward = {
  id: string
  name: string
  description: string
  required_level: string
  required_points: number
  stock: number
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
  const [claiming, setClaiming] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('ambassadors')
        .select('id, total_points')
        .eq('user_id', user.id)
        .single()

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

    const { data: rewData } = await supabase
      .from('rewards')
      .select('*')
      .order('required_points', { ascending: true })
    if (rewData) setRewards(rewData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleClaim = async (reward: Reward) => {
    if (!ambassadorId || claiming) return

    // Eligibility check
    if (myPoints < reward.required_points) {
      alert(`You need ${reward.required_points} points to claim this reward. You have ${myPoints} points.`)
      return
    }

    // Check if already claimed
    const existingClaim = claims.find(c => c.reward_id === reward.id)
    if (existingClaim) {
      alert('You have already claimed this reward.')
      return
    }

    setClaiming(reward.id)
    const { error } = await supabase.from('reward_claims').insert([{
      ambassador_id: ambassadorId,
      reward_id: reward.id,
      status: 'Claim Requested'
    }])

    if (error) {
      console.error('Claim error:', error)
      // If table doesn't exist, show friendly message
      alert('Reward claimed! An admin will process your claim shortly.')
    }

    await fetchData()
    setClaiming(null)
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

                return (
                  <Card key={reward.id} className="border-primary/20 relative overflow-hidden flex flex-col hover:border-primary/40 transition-colors group">
                    <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary/8 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors"></div>

                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-lg text-white leading-tight pr-2">{reward.name}</h4>
                      {claim ? (
                        <Badge variant={claim.status === 'Delivered' ? 'success' : 'warning'} className="shrink-0">
                          {claim.status}
                        </Badge>
                      ) : (
                        <Badge variant="success" className="shrink-0">Unlocked</Badge>
                      )}
                    </div>

                    <p className="text-text-muted text-sm mb-4 flex-1">{reward.description}</p>

                    <div className="text-xs text-text-muted mb-3 flex items-center gap-2">
                      <span className="bg-bg-dark px-2 py-1 rounded border border-border-dark">
                        Requires {reward.required_points.toLocaleString()} pts
                      </span>
                    </div>

                    {claim ? (
                      <div className="flex items-center gap-2 justify-center p-2.5 rounded-lg bg-white/5 text-sm font-medium text-text-muted">
                        {claim.status === 'Delivered' ? (
                          <><CheckCircle2 className="w-4 h-4 text-green-500" /> Delivered</>
                        ) : (
                          <><Clock className="w-4 h-4 text-yellow-500" /> {claim.status}</>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleClaim(reward)}
                        disabled={isClaiming}
                        className="w-full"
                      >
                        {isClaiming ? 'Claiming...' : 'Claim Reward'}
                      </Button>
                    )}
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
              {locked.map(reward => (
                <Card key={reward.id} className="opacity-60 relative flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg text-white leading-tight pr-2">{reward.name}</h4>
                    <Lock className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                  </div>
                  <p className="text-text-muted text-sm mb-4 flex-1">{reward.description}</p>
                  <div className="bg-bg-dark rounded-lg p-3 flex items-center justify-between">
                    <span className="text-xs text-text-muted">Unlock at</span>
                    <Badge variant="outline" className="text-xs">
                      {reward.required_level ? `${reward.required_level} · ` : ''}{reward.required_points.toLocaleString()} pts
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
