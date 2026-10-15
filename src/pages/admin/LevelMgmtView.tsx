import { useEffect, useState, useRef } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Input } from "../../components/FormControls"
import {
  Plus, Edit2, Trash2, X, CheckCircle2, Upload,
  Award, Layers, ShieldCheck, TrendingUp
} from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"
import { compressImageToDataUrl } from "../../lib/imageCompression"
import { Modal } from "../../components/Modal"

type Level = {
  id: string
  name: string
  designation: string
  min_points: number
  badge?: string | null
  certificate?: string | null
}

const BLANK: Omit<Level, 'id'> = {
  name: '',
  designation: '',
  min_points: 0,
  badge: '',
  certificate: ''
}

const DEFAULT_EMOJIS: Record<string, string> = {
  'Bronze': '🥉',
  'Silver': '🥈',
  'Gold': '🥇',
  'Platinum': '💠',
  'Diamond': '💎',
  'National': '🏅'
}

export function LevelMgmtView() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Level> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [badgePreview, setBadgePreview] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchLevels = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('levels_config')
        .select('*')
        .order('min_points', { ascending: true })
      if (fetchErr) throw fetchErr
      if (data) setLevels(data)
    } catch (err: any) {
      console.error("Failed to load levels config:", err)
      setError(err.message || "Failed to load levels configuration.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  const openNew = () => {
    setIsNew(true)
    setEditing({ ...BLANK })
    setBadgePreview(null)
  }

  const openEdit = (lvl: Level) => {
    setIsNew(false)
    setEditing({ ...lvl })
    setBadgePreview(lvl.badge || lvl.certificate || null)
  }

  const closeForm = () => {
    setEditing(null)
    setIsNew(false)
    setBadgePreview(null)
  }

  // Client-side compressed badge icon upload (Phase 10: 'avatar' profile, max 800px, WebP, <= 100KB)
  const handleBadgeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressing(true)
    try {
      const { dataUrl } = await compressImageToDataUrl(file, 'avatar')
      setBadgePreview(dataUrl)
    } catch (err: any) {
      console.error("Failed to compress badge icon:", err)
      setFeedbackMsg({ type: 'error', text: "Failed to process badge image. Please try again." })
    } finally {
      setCompressing(false)
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const badgeVal = badgePreview || (fd.get('badge_url') as string) || null

    const payload: any = {
      name: (fd.get('name') as string).trim(),
      designation: (fd.get('designation') as string).trim(),
      min_points: parseInt(fd.get('min_points') as string) || 0,
      badge: badgeVal,
      certificate: badgeVal,
    }

    setFeedbackMsg(null)
    try {
      if (isNew) {
        const { error: insErr } = await supabase.from('levels_config').insert([payload])
        if (insErr) {
          // If badge/certificate column is not defined in older schema, retry with core fields
          delete payload.certificate
          delete payload.badge
          const { error: retryErr } = await supabase.from('levels_config').insert([payload])
          if (retryErr) throw retryErr
        }
        setFeedbackMsg({ type: 'success', text: `Level tier "${payload.name}" created successfully!` })
      } else if (editing.id) {
        const { error: updErr } = await supabase.from('levels_config').update(payload).eq('id', editing.id)
        if (updErr) {
          delete payload.certificate
          delete payload.badge
          const { error: retryErr } = await supabase.from('levels_config').update(payload).eq('id', editing.id)
          if (retryErr) throw retryErr
        }
        setFeedbackMsg({ type: 'success', text: `Level tier "${payload.name}" updated successfully!` })
      }
      setTimeout(() => setFeedbackMsg(null), 3500)
      closeForm()
      await fetchLevels()
    } catch (err: any) {
      console.error("Level save error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to save level." })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" level tier?`)) return
    setFeedbackMsg(null)
    try {
      const { error: delErr } = await supabase.from('levels_config').delete().eq('id', id)
      if (delErr) throw delErr
      setLevels(prev => prev.filter(l => l.id !== id))
      setFeedbackMsg({ type: 'success', text: `Level "${name}" removed.` })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Level delete error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to delete level." })
    }
  }

  const maxPoints = levels.length > 0 ? Math.max(...levels.map(l => l.min_points)) : 50000

  return (
    <div className="w-full max-w-full space-y-6 animate-in fade-in duration-300 pb-20">
      {error && <ErrorAlert message={error} onRetry={fetchLevels} />}

      {/* Success / Error Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Level Tiers Configuration
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Configure ambassador progression milestones, point thresholds, and designations.
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Level Tier
        </Button>
      </div>

      {/* Summary KPI Strip — Spans full screen width */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-border-dark bg-bg-card/70 flex flex-col justify-between">
          <p className="text-text-muted text-xs font-medium">Configured Tiers</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-white">{levels.length}</span>
            <span className="text-xs text-primary font-semibold">Active Levels</span>
          </div>
        </Card>
        <Card className="p-4 border-border-dark bg-bg-card/70 flex flex-col justify-between">
          <p className="text-text-muted text-xs font-medium">Starting Threshold</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-white">0</span>
            <span className="text-xs text-text-muted">Bronze Base</span>
          </div>
        </Card>
        <Card className="p-4 border-border-dark bg-bg-card/70 flex flex-col justify-between">
          <p className="text-text-muted text-xs font-medium">Top Milestone</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-primary">{maxPoints.toLocaleString()}</span>
            <span className="text-xs text-text-muted">pts max</span>
          </div>
        </Card>
        <Card className="p-4 border-border-dark bg-bg-card/70 flex flex-col justify-between">
          <p className="text-text-muted text-xs font-medium">Tier System</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Auto-Promoting
          </div>
        </Card>
      </div>

      {/* Level Tiers Responsive Full-Screen Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-bg-card rounded-2xl border border-border-dark" />
          ))}
        </div>
      ) : levels.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-border-dark">
          <Layers className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
          <p className="text-white font-semibold">No Level Tiers Configured</p>
          <p className="text-xs text-text-muted mt-1 mb-4">Click below to create your first progression level.</p>
          <Button size="sm" onClick={openNew} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Level Tier
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {levels.map((level, idx) => {
            const hasCustomBadge = Boolean(level.badge || level.certificate)
            const badgeSrc = level.badge || level.certificate

            return (
              <Card
                key={level.id}
                className="p-5 flex flex-col justify-between border-border-dark hover:border-primary/40 bg-bg-card/80 transition-all group relative overflow-hidden"
              >
                {/* Top Row: Badge, Name, Points */}
                <div className="flex items-start gap-4">
                  {/* Badge Thumbnail or Tier Emoji */}
                  {hasCustomBadge && badgeSrc ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border-dark bg-bg-dark shrink-0 shadow-md">
                      <img src={badgeSrc} alt={level.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {DEFAULT_EMOJIS[level.name] || `${idx + 1}`}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <h3 className="font-bold text-white text-base truncate">{level.name}</h3>
                      <span className="text-[10px] font-mono uppercase bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                        Tier {idx + 1}
                      </span>
                    </div>

                    <p className="text-primary text-xs font-bold mt-0.5">
                      {level.min_points.toLocaleString()} Points Threshold
                    </p>

                    <p className="text-text-muted text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {level.designation}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Actions & Milestone Progress Indicator */}
                <div className="pt-4 mt-4 border-t border-border-dark/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Req. {level.min_points} pts</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(level)}
                      className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      title="Edit Level Tier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(level.id, level.name)}
                      className="p-2 text-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Level Tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Level Tier Modal — Guaranteed Centered and Unclipped */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={closeForm}
        title={isNew ? 'Create Level Tier' : `Edit Tier: ${editing?.name || ''}`}
        description="Configure points threshold, designation, and badge icon."
        icon={<Award className="w-4 h-4 text-primary" />}
        maxWidth="max-w-lg"
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Optional Tier Badge / Icon Upload */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Level Badge / Icon (Optional)
              </label>

              {badgePreview ? (
                <div className="relative border border-border-dark rounded-xl overflow-hidden mb-3 bg-bg-dark h-32 flex items-center justify-center group">
                  <img src={badgePreview} alt="Badge preview" className="max-h-full max-w-full object-contain p-2" />
                  <button
                    type="button"
                    onClick={() => setBadgePreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Remove custom icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white">
                    Custom Badge Icon Attached
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border-dark hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-bg-dark/40 mb-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-1.5 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-white mb-0.5">
                    {compressing ? "Compressing WebP badge..." : "Upload Level Badge / Medal Icon"}
                  </p>
                  <p className="text-[11px] text-text-muted">PNG, JPG, or WEBP (Auto-optimized to &le;100KB)</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBadgeFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted shrink-0">or Icon URL:</span>
                <input
                  type="url"
                  name="badge_url"
                  value={badgePreview || ''}
                  onChange={(e) => setBadgePreview(e.target.value)}
                  placeholder="https://example.com/badge-icon.png"
                  className="flex-1 bg-bg-dark border border-border-dark rounded-xl px-3 py-1.5 text-xs text-white placeholder-text-muted/40 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <Input
              label="Level Name"
              name="name"
              required
              defaultValue={editing.name}
              placeholder="e.g. Bronze, Silver, Gold, Platinum"
            />

            <Input
              label="Designation / Title"
              name="designation"
              required
              defaultValue={editing.designation}
              placeholder="e.g. Campus Ambassador, Senior Campus Ambassador"
            />

            <Input
              label="Minimum Points Threshold"
              name="min_points"
              type="number"
              required
              min={0}
              defaultValue={editing.min_points ?? 0}
              placeholder="0"
            />

            <div className="flex gap-2 justify-end pt-3 border-t border-border-dark">
              <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5" disabled={compressing}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isNew ? 'Create Level Tier' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
