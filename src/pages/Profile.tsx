import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card"
import { useAuth } from "../contexts/AuthContext"
import { User, Mail, Building2, MapPin, Phone, Shield, Copy, CheckCircle2, BookOpen, Hash, Camera } from "lucide-react"
import { Badge } from "../components/Badge"
import { compressImageToDataUrl } from "../lib/imageCompression"
import { supabase } from "../lib/supabase"

export const Profile = () => {
  const { profile: authProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [copyMsg, setCopyMsg] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const profile = authProfile
  const loading = authLoading

  useEffect(() => {
    if (profile?.id) {
      const saved = localStorage.getItem(`ambassador_avatar_${profile.id}`)
      if (saved) setAvatarUrl(saved)
    }
  }, [profile?.id])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setUploadingAvatar(true)
    try {
      // Phase 10: Client-side compression for profile avatar (max 800px, WebP, <= 100KB)
      const { dataUrl } = await compressImageToDataUrl(file, 'avatar')
      setAvatarUrl(dataUrl)
      localStorage.setItem(`ambassador_avatar_${profile.id}`, dataUrl)
      try {
        await supabase.from('ambassadors').update({ avatar_url: dataUrl } as any).eq('id', profile.id)
      } catch {
        // ignore schema mismatch
      }
      setCopyMsg("Profile photo updated successfully!")
      setTimeout(() => setCopyMsg(null), 3500)
    } catch (err: any) {
      console.error("Failed to upload avatar:", err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  useEffect(() => {
    if (!loading && profile?.role === 'admin') {
      navigate('/admin?tab=profile', { replace: true })
    }
  }, [profile, loading, navigate])

  const handleCopyCode = () => {
    if (!profile?.referral_code) return
    navigator.clipboard.writeText(profile.referral_code)
    setCopied(true)
    setCopyMsg("Referral code copied to clipboard!")
    setTimeout(() => {
      setCopied(false)
      setCopyMsg(null)
    }, 2500)
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${profile?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setCopyMsg("Referral link copied to clipboard!")
    setTimeout(() => {
      setCopied(false)
      setCopyMsg(null)
    }, 2500)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-bg-card rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-bg-card rounded-xl"></div>
          <div className="md:col-span-2 h-80 bg-bg-card rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!profile) return (
    <div className="text-white text-center py-12">
      <User className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-40" />
      <p>Profile not found.</p>
    </div>
  )

  const initials = profile.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const referralLink = profile.referral_code
    ? `${window.location.origin}/register?ref=${profile.referral_code}`
    : null

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader title="My Profile" subtitle="Your ambassador details and account information." />

      {copyMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 flex items-center gap-2.5 text-sm animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{copyMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <Card className="col-span-1 flex flex-col items-center text-center p-8 border-primary/20 bg-gradient-to-b from-bg-card to-bg-dark">
          {/* Avatar with Compressed Photo Upload */}
          <div className="relative group mb-5">
            <div className="w-24 h-24 bg-primary/15 border-2 border-primary/30 rounded-full flex items-center justify-center text-primary font-bold text-3xl overflow-hidden shadow-[0_0_30px_rgba(242,51,64,0.15)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-md hover:bg-primary-hover hover:scale-105 transition-all cursor-pointer"
              title="Upload profile photo"
              aria-label="Upload profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{profile.full_name}</h2>

          {/* Role / Designation badge */}
          <div className="flex items-center gap-1.5 mb-4">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-sm font-semibold">
              {profile.role === 'admin' ? 'Administrator' : (profile.current_level || 'Bronze Ambassador')}
            </span>
          </div>

          {/* Status badge */}
          <Badge
            variant={profile.status === 'Approved' ? 'success' : profile.status === 'Rejected' ? 'error' : 'warning'}
            className="mb-6"
          >
            {profile.status}
          </Badge>

          {/* Points */}
          <div className="w-full bg-bg-dark border border-border-dark rounded-xl p-4 mb-3">
            <p className="text-xs text-text-muted mb-1">Total Points</p>
            <p className="text-3xl font-bold text-primary">{(profile.total_points || 0).toLocaleString()}</p>
          </div>

          {/* Ambassador ID */}
          {profile.ambassador_id && (
            <div className="w-full bg-bg-dark border border-border-dark rounded-xl p-3">
              <p className="text-xs text-text-muted mb-1 flex items-center gap-1 justify-center">
                <Hash className="w-3 h-3" /> Ambassador ID
              </p>
              <p className="text-sm font-mono font-bold text-white">{profile.ambassador_id}</p>
            </div>
          )}
        </Card>

        {/* Right: Details */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          {/* Personal Info */}
          <Card>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm break-all">{profile.email}</div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Mobile
                </label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">
                  {profile.mobile_number || <span className="text-text-muted italic">Not provided</span>}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Role / Designation
                </label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">
                  {profile.role === 'admin' ? 'Administrator' : (profile.current_level || 'Bronze Ambassador')}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Account Status</label>
                <div className="bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">
                  <Badge variant={profile.status === 'Approved' ? 'success' : profile.status === 'Rejected' ? 'error' : 'warning'}>
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* College Info */}
          <Card>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> College Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> College Name
                </label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">{profile.college_name}</div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Course & Branch
                </label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">
                  {profile.course} — {profile.branch}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Year of Study</label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">{profile.current_year}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </label>
                <div className="text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm">
                  {[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          </Card>

          {/* Referral Info */}
          {profile.referral_code && (
            <Card>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Referral Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 block">Referral Code</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-white bg-bg-dark p-3 rounded-lg border border-border-dark text-sm font-mono font-bold tracking-widest">
                      {profile.referral_code}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-3 rounded-lg border border-border-dark hover:border-primary/50 bg-bg-dark text-text-muted hover:text-white transition-colors"
                      aria-label="Copy referral code"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {referralLink && (
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5 block">Referral Link</label>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex-1 min-w-0 text-text-muted bg-bg-dark p-3 rounded-lg border border-border-dark text-xs truncate">
                        {referralLink}
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className="p-3 rounded-lg border border-border-dark hover:border-primary/50 bg-bg-dark text-text-muted hover:text-white transition-colors shrink-0"
                        aria-label="Copy referral link"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
