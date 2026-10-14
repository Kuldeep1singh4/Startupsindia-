import { useEffect, useState, useRef } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Input, Textarea } from "../../components/FormControls"
import { Plus, Edit2, Trash2, Gift, X, CheckCircle2, Upload } from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"

type Reward = {
  id: string
  name: string
  description: string
  required_points: number
  required_level?: string
  stock?: number
  quantity?: number
  image?: string
  image_url?: string
}

const BLANK: Omit<Reward, 'id'> = {
  name: '', description: '', required_points: 0, required_level: 'Bronze', stock: 10, image_url: '', image: ''
}

export function RewardMgmtView() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Reward> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('rewards')
        .select('*')
        .order('required_points', { ascending: true })
      if (fetchErr) throw fetchErr
      if (data) setRewards(data)
    } catch (err: any) {
      console.error("Failed to load rewards:", err)
      setError(err.message || "Failed to load rewards catalog.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const openNew = () => {
    setIsNew(true)
    setEditing({ ...BLANK })
    setImagePreview(null)
  }

  const openEdit = (reward: Reward) => {
    setIsNew(false)
    setEditing({ ...reward })
    setImagePreview(reward.image || reward.image_url || null)
  }

  const closeForm = () => {
    setEditing(null)
    setIsNew(false)
    setImagePreview(null)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImagePreview(result)
      setUploadingImage(false)
    }
    reader.onerror = () => {
      setFeedbackMsg({ type: 'error', text: "Failed to read image file." })
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const imgValue = imagePreview || (fd.get('image_url') as string) || null

    const payload: any = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      required_points: parseInt(fd.get('required_points') as string) || 0,
      required_level: fd.get('required_level') as string,
      image: imgValue,
    }

    // Include stock / quantity
    const stockVal = parseInt(fd.get('stock') as string) || 0
    payload.stock = stockVal
    payload.quantity = stockVal

    setFeedbackMsg(null)
    try {
      if (isNew) {
        const { error: insErr } = await supabase.from('rewards').insert([payload])
        if (insErr) {
          // Fallback if stock column differs
          delete payload.stock
          const { error: retryErr } = await supabase.from('rewards').insert([payload])
          if (retryErr) throw retryErr
        }
        setFeedbackMsg({ type: 'success', text: `Reward "${payload.name}" added successfully.` })
      } else if (editing.id) {
        const { error: updErr } = await supabase.from('rewards').update(payload).eq('id', editing.id)
        if (updErr) {
          delete payload.stock
          const { error: retryErr } = await supabase.from('rewards').update(payload).eq('id', editing.id)
          if (retryErr) throw retryErr
        }
        setFeedbackMsg({ type: 'success', text: `Reward "${payload.name}" updated successfully.` })
      }
      setTimeout(() => setFeedbackMsg(null), 3500)
      closeForm()
      await fetch()
    } catch (err: any) {
      console.error("Reward save error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to save reward." })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reward?')) return
    setFeedbackMsg(null)
    try {
      const { error: delErr } = await supabase.from('rewards').delete().eq('id', id)
      if (delErr) throw delErr
      setRewards(prev => prev.filter(r => r.id !== id))
      setFeedbackMsg({ type: 'success', text: "Reward deleted successfully." })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      console.error("Reward delete error:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to delete reward." })
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{rewards.length} reward{rewards.length !== 1 ? 's' : ''} in catalog</p>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Reward
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-bg-card rounded-2xl border border-border-dark" />)}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="py-16 text-center">
          <Gift className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-20" />
          <p className="text-text-muted text-sm">No rewards yet. Add your first reward.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => {
            const displayImg = reward.image || reward.image_url
            const stockCount = reward.stock ?? reward.quantity ?? 0

            return (
              <Card
                key={reward.id}
                className="p-0 flex flex-col justify-between hover:border-primary/40 transition-all relative overflow-hidden group shadow-lg"
              >
                {/* Reward Image Header */}
                <div className="relative w-full h-44 bg-gradient-to-br from-bg-dark to-bg-card border-b border-border-dark flex items-center justify-center overflow-hidden">
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={reward.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Gift className="w-8 h-8" />
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                      {reward.required_points.toLocaleString()} pts
                    </span>
                    {reward.required_level && (
                      <span className="bg-bg-dark/80 backdrop-blur-md text-text-muted text-xs font-medium px-2 py-1 rounded-lg border border-border-dark">
                        {reward.required_level}
                      </span>
                    )}
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex gap-1 bg-bg-dark/70 backdrop-blur-md p-1 rounded-lg border border-border-dark opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(reward)}
                      className="p-1.5 text-text-muted hover:text-white rounded hover:bg-white/10 transition-colors"
                      title="Edit Reward"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      className="p-1.5 text-text-muted hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                      title="Delete Reward"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-base mb-1 line-clamp-1">{reward.name}</h4>
                    <p className="text-text-muted text-xs leading-relaxed line-clamp-2">{reward.description}</p>
                  </div>

                  <div className="pt-2 border-t border-border-dark/60 flex items-center justify-between text-xs text-text-muted">
                    <span>Stock: <strong className="text-white font-medium">{stockCount >= 0 ? stockCount : 'Unlimited'}</strong></span>
                    <span className="text-[11px] font-mono text-emerald-400">Available</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reward Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-bg-card rounded-2xl shadow-2xl my-auto max-h-[90dvh] overflow-y-auto border border-border-dark p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Gift className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">{isNew ? 'Create New Reward' : 'Edit Reward'}</h3>
              </div>
              <button onClick={closeForm} className="text-text-muted hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Upload / Preview Block */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Reward Card Image
                </label>
                
                {imagePreview ? (
                  <div className="relative border border-border-dark rounded-xl overflow-hidden mb-3 bg-bg-dark h-40 group">
                    <img src={imagePreview} alt="Reward preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 text-xs text-white">
                      Custom Image Attached
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-dark hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-bg-dark/50 mb-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-white mb-0.5">
                      {uploadingImage ? "Processing image..." : "Upload Reward Artwork or Photo"}
                    </p>
                    <p className="text-[11px] text-text-muted">PNG, JPG, SVG or WEBP (Max 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">or image URL:</span>
                  <input
                    type="url"
                    name="image_url"
                    value={imagePreview || ''}
                    onChange={(e) => setImagePreview(e.target.value)}
                    placeholder="https://example.com/reward-image.jpg"
                    className="flex-1 bg-bg-dark border border-border-dark rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted/50 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <Input
                label="Reward Name"
                name="name"
                required
                defaultValue={editing.name}
                placeholder="e.g. StartupsIndia Official Hoodie"
              />

              <Textarea
                label="Description"
                name="description"
                required
                rows={2}
                defaultValue={editing.description}
                placeholder="Details about what the ambassador receives..."
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Required Points"
                  name="required_points"
                  type="number"
                  required
                  min={0}
                  defaultValue={editing.required_points ?? 0}
                />
                <Input
                  label="Stock Count"
                  name="stock"
                  type="number"
                  required
                  min={0}
                  defaultValue={editing.stock ?? editing.quantity ?? 10}
                />
              </div>

              <Input
                label="Required Level"
                name="required_level"
                defaultValue={editing.required_level || 'Bronze'}
                placeholder="e.g. Bronze, Silver, Gold, Platinum, Diamond, National"
              />

              <div className="flex gap-2 justify-end pt-3 border-t border-border-dark">
                <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isNew ? 'Create Reward' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
