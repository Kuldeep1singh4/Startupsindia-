import { useEffect, useState, useRef } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Input } from "../../components/FormControls"
import { Plus, Edit2, Trash2, X, CheckCircle2, Upload, Award } from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"

type Level = {
  id: string
  name: string
  designation: string
  min_points: number
  certificate?: string | null
  badge?: string | null
}

const BLANK: Omit<Level, 'id'> = { name: '', designation: '', min_points: 0, certificate: '', badge: '' }

export function LevelMgmtView() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Level> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [certPreview, setCertPreview] = useState<string | null>(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetch = async () => {
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

  useEffect(() => { fetch() }, [])

  const openNew = () => {
    setIsNew(true)
    setEditing({ ...BLANK })
    setCertPreview(null)
  }

  const openEdit = (lvl: Level) => {
    setIsNew(false)
    setEditing({ ...lvl })
    setCertPreview(lvl.certificate || lvl.badge || null)
  }

  const closeForm = () => {
    setEditing(null)
    setIsNew(false)
    setCertPreview(null)
  }

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCert(true)
    const reader = new FileReader()
    reader.onload = () => {
      setCertPreview(reader.result as string)
      setUploadingCert(false)
    }
    reader.onerror = () => {
      setFeedbackMsg({ type: 'error', text: "Failed to read certificate image file." })
      setUploadingCert(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const certVal = certPreview || (fd.get('certificate_url') as string) || null

    const payload: any = {
      name: fd.get('name') as string,
      designation: fd.get('designation') as string,
      min_points: parseInt(fd.get('min_points') as string) || 0,
      certificate: certVal,
      badge: certVal,
    }

    setFeedbackMsg(null)
    try {
      if (isNew) {
        const { error: insErr } = await supabase.from('levels_config').insert([payload])
        if (insErr) {
          // If certificate column is not defined, retry with basic fields
          delete payload.certificate
          delete payload.badge
          const { error: retryErr } = await supabase.from('levels_config').insert([payload])
          if (retryErr) throw retryErr
        }
        setFeedbackMsg({ type: 'success', text: `Level tier "${payload.name}" added successfully.` })
      } else if (editing.id) {
        const { error: updErr } = await supabase.from('levels_config').update(payload).eq('id', editing.id)
        if (updErr) {
          delete payload.certificate
          delete payload.badge
          const { error: retryErr } = await supabase.from('levels_config').update(payload).eq('id', editing.id)
          if (retryErr) throw retryErr
        }
        setFeedbackMsg({ type: 'success', text: `Level tier "${payload.name}" updated successfully.` })
      }
      setTimeout(() => setFeedbackMsg(null), 3500)
      closeForm()
      await fetch()
    } catch (err: any) {
      console.error("Level save error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to save level." })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this level?')) return
    setFeedbackMsg(null)
    try {
      const { error: delErr } = await supabase.from('levels_config').delete().eq('id', id)
      if (delErr) throw delErr
      setLevels(prev => prev.filter(l => l.id !== id))
      setFeedbackMsg({ type: 'success', text: "Level deleted successfully." })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Level delete error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to delete level." })
    }
  }

  const EMOJIS: Record<string, string> = {
    'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇',
    'Platinum': '💠', 'Diamond': '💎', 'National': '🏅'
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-16">
      {error && <ErrorAlert message={error} onRetry={fetch} />}

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-bg-card rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {levels.map((level, idx) => (
            <Card key={level.id} className="p-4 flex items-center gap-4 hover:border-border-dark/60 transition-colors">
              {level.certificate ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border-dark bg-bg-dark shrink-0">
                  <img src={level.certificate} alt={level.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {EMOJIS[level.name] || `${idx + 1}`}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white text-sm">{level.name}</span>
                  <span className="text-primary text-xs font-bold">{level.min_points.toLocaleString()} pts</span>
                </div>
                <p className="text-text-muted text-xs">{level.designation}</p>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(level)}
                  className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Edit Level"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(level.id)}
                  className="p-2 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/8 transition-colors"
                  title="Delete Level"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Level Modal with Certificate Image Upload */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-md bg-bg-card rounded-2xl shadow-2xl my-auto max-h-[90dvh] overflow-y-auto border border-border-dark p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">{isNew ? 'Add Level Tier' : 'Edit Level Tier'}</h3>
              </div>
              <button onClick={closeForm} className="text-text-muted hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Certificate Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Certificate Template / Artwork
                </label>

                {certPreview ? (
                  <div className="relative border border-border-dark rounded-xl overflow-hidden mb-3 bg-bg-dark h-36 group">
                    <img src={certPreview} alt="Certificate preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCertPreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 text-xs text-white">
                      Custom Certificate Artwork Attached
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-dark hover:border-primary/50 rounded-xl p-5 text-center cursor-pointer transition-colors bg-bg-dark/50 mb-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-white mb-0.5">
                      {uploadingCert ? "Reading image..." : "Upload Certificate Template Image"}
                    </p>
                    <p className="text-[11px] text-text-muted">PNG, JPG, SVG or WEBP (Max 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCertFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">or URL:</span>
                  <input
                    type="url"
                    name="certificate_url"
                    value={certPreview || ''}
                    onChange={(e) => setCertPreview(e.target.value)}
                    placeholder="https://example.com/certificate-template.png"
                    className="flex-1 bg-bg-dark border border-border-dark rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted/50 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <Input label="Level Name" name="name" required defaultValue={editing.name} placeholder="e.g. Silver" />
              <Input label="Designation" name="designation" required defaultValue={editing.designation} placeholder="e.g. Senior Campus Ambassador" />
              <Input label="Minimum Points" name="min_points" type="number" required min={0} defaultValue={editing.min_points ?? 0} />

              <div className="flex gap-2 justify-end pt-3 border-t border-border-dark">
                <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isNew ? 'Create Level' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
