import { useEffect, useState } from "react"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Badge } from "../components/Badge"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { cn } from "../lib/utils"
import {
  Copy, Users, CheckCircle2, Share2, Sparkles, Trophy,
  Clock, MessageSquare, Send, Check
} from "lucide-react"

interface ReferralFriend {
  id?: string
  full_name: string
  college_name?: string
  current_level?: string
  created_at: string
  status: string
}

export const Referrals = () => {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null)
  const [referredFriends, setReferredFriends] = useState<ReferralFriend[]>([])
  const [filter, setFilter] = useState<'all' | 'Approved' | 'Pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!profile?.referral_code) {
        setLoading(false)
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('ambassadors')
        .select('id, full_name, college_name, current_level, created_at, status')
        .eq('referred_by', profile.referral_code)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setReferredFriends(data)
      }
      setLoading(false)
    }

    fetchReferrals()
  }, [profile?.referral_code])

  const referralCode = profile?.referral_code || ""
  const inviteLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : ""

  const handleCopyLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setCopySuccessMsg("Referral link copied to clipboard! Ready to share.")
    setTimeout(() => {
      setCopiedLink(false)
      setCopySuccessMsg(null)
    }, 2500)
  }

  const handleCopyCode = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setCopySuccessMsg(`Referral code "${referralCode}" copied to clipboard!`)
    setTimeout(() => {
      setCopiedCode(false)
      setCopySuccessMsg(null)
    }, 2500)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Apply to become a StartupsIndia Student Ambassador with my referral link and earn national recognition, points & exclusive rewards: ${inviteLink}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Join me as a @StartupsIndia Campus Ambassador! Build your startup network, lead your campus, and earn perks: ${inviteLink}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const approvedCount = referredFriends.filter(f => f.status === 'Approved').length
  const pendingCount = referredFriends.filter(f => f.status === 'Pending').length
  const pointsEarned = approvedCount * 50

  const filteredFriends = referredFriends.filter(f => {
    const matchesFilter = filter === 'all' || f.status === filter
    const matchesSearch = f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.college_name && f.college_name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-bg-card rounded-xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-card rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-bg-card rounded-xl"></div>
          <div className="h-72 bg-bg-card rounded-xl"></div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Referrals',
      value: referredFriends.length.toString(),
      sub: 'Applications submitted',
      icon: Users,
      color: 'text-purple-400',
    },
    {
      label: 'Approved Ambassadors',
      value: approvedCount.toString(),
      sub: 'Active program members',
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
    {
      label: 'Pending Reviews',
      value: pendingCount.toString(),
      sub: 'Awaiting admin verification',
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      label: 'Bonus Points Earned',
      value: `+${pointsEarned.toLocaleString()}`,
      sub: '50 pts per approved peer',
      icon: Trophy,
      color: 'text-primary',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionHeader
        title="Referral Program"
        subtitle="Invite fellow students to join StartupsIndia. Earn bonus points and rank up together."
      />

      {copySuccessMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 flex items-center gap-2.5 text-sm animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{copySuccessMsg}</span>
        </div>
      )}

      {/* Top Stat Row matching Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon
          return (
            <Card key={idx} className="p-4 flex flex-col justify-between border-border-dark bg-bg-card/70">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted">{s.label}</span>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">{s.sub}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main Grid: Referral Link Card & How it works */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Share Center */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-bg-card to-bg-card/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Your Ambassador Invite Center</h3>
                <p className="text-xs text-text-muted">Share your unique code to build your campus network.</p>
              </div>
            </div>

            {/* Referral Code Box */}
            <div className="mt-5 p-4 rounded-xl bg-bg-dark border border-border-dark space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Your Referral Code</span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">50 Points Bonus</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 bg-bg-card/60 px-4 py-2.5 rounded-lg border border-border-dark">
                <span className="font-mono text-base sm:text-lg font-bold text-white tracking-widest">
                  {referralCode || 'NOT_ASSIGNED'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyCode}
                  className="text-xs text-text-muted hover:text-white shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </Button>
              </div>
            </div>

            {/* Invite Link Box */}
            <div className="mt-4 p-4 rounded-xl bg-bg-dark border border-border-dark space-y-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Direct Registration Link</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-bg-card/60 px-3 py-2 rounded-lg border border-border-dark truncate text-xs text-text-muted select-all">
                  {inviteLink || 'Generating unique link...'}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 text-xs"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="mt-5 pt-4 border-t border-border-dark">
              <p className="text-xs font-medium text-text-muted mb-3 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-primary" /> Quick Share to Peers
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShareTwitter}
                  className="text-xs border-sky-500/30 text-sky-400 hover:bg-sky-500/10 gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Twitter / X
                </Button>
              </div>
            </div>
          </Card>

          {/* Gamification 3-Step Guide */}
          <Card className="p-6 border-border-dark bg-bg-card/70">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              How the Referral Reward Works
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-bg-dark border border-border-dark">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mb-2">1</div>
                <p className="text-xs font-bold text-white mb-1">Share Your Link</p>
                <p className="text-[11px] text-text-muted leading-relaxed">Students apply using your referral link or code.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-dark border border-border-dark">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mb-2">2</div>
                <p className="text-xs font-bold text-white mb-1">Admin Approval</p>
                <p className="text-[11px] text-text-muted leading-relaxed">Our team verifies their application and marks it Approved.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-dark border border-border-dark">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mb-2">3</div>
                <p className="text-xs font-bold text-white mb-1">Earn Points</p>
                <p className="text-[11px] text-text-muted leading-relaxed">You unlock +50 points per ambassador towards your next level!</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Referral History Table */}
        <div className="lg:col-span-5">
          <Card className="p-5 border-border-dark bg-bg-card/70 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Your Referred Students</h3>
                <p className="text-xs text-text-muted">Track status of every peer you brought on board.</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {referredFriends.length} Total
              </Badge>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex rounded-lg bg-bg-dark p-1 border border-border-dark">
                {(['all', 'Approved', 'Pending'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={cn(
                      "flex-1 py-1 text-xs font-medium rounded-md transition-colors",
                      filter === tab
                        ? "bg-bg-card text-white shadow-sm font-semibold"
                        : "text-text-muted hover:text-white"
                    )}
                  >
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by student or college..."
                className="w-full bg-bg-dark border border-border-dark rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1 scrollbar-hide">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12 text-text-muted border border-dashed border-border-dark rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-white">No referrals found</p>
                  <p className="text-xs mt-1">
                    {referredFriends.length === 0
                      ? "Share your link above to begin earning referral rewards!"
                      : "No students match the current filter."}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend, i) => (
                  <div
                    key={friend.id || i}
                    className="p-3 rounded-xl bg-bg-dark border border-border-dark flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs sm:text-sm text-white truncate">
                          {friend.full_name}
                        </p>
                        {friend.current_level && (
                          <span className="text-[10px] text-text-muted hidden sm:inline">
                            · {friend.current_level}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {friend.college_name || 'College Student'} · {new Date(friend.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
                          friend.status === 'Approved'
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : friend.status === 'Pending'
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                      >
                        {friend.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
