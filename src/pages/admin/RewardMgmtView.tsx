import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Input, Textarea } from "../../components/FormControls"
import { Plus, Edit2, Trash2, Gift, X } from "lucide-react"

type Reward = {
  id: string
  name: string
  description: string
  required_points: number
  required_level?: string
  stock: number
  image_url?: string
}

const BLANK: Omit<Reward, 'id'> = {
  name: '', description: '', required_points: 0, required_level: 'Bronze', stock: 0, image_url: ''
}

export function RewardMgmtView() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Reward> | null>(null)
  const [isNew, setIsNew] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('rewards').select('*').order('required_points', { ascending: true })
    if (data) setRewards(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      required_points: parseInt(fd.get('required_points') as string),
      required_level: fd.get('required_level') as string,
      stock: parseInt(fd.get('stock') as string),
      image_url: fd.get('image_url') as string || null,
    }
    if (isNew) {
      await supabase.from('rewards').insert([payload])
    } else if (editing.id) {
      await supabase.from('rewards').update(payload).eq('id', editing.id)
    }
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reward?')) return
    await supabase.from('rewards').delete().eq('id', id)
    setRewards(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{rewards.length} reward{rewards.length !== 1 ? 's' : ''} in catalog</p>
        <Button size="sm" onClick={() => { setIsNew(true); setEditing({ ...BLANK }) }} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Reward
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-bg-card rounded-2xl" />)}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="py-16 text-center">
          <Gift className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
          <p className="text-text-muted text-sm">No rewards yet. Add your first reward.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rewards.map(reward => (
            <Card key={reward.id} className="p-4 flex flex-col gap-3 hover:border-border-dark/60 transition-colors relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-2 relative">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm mb-0.5">{reward.name}</h4>
                  <p className="text-text-muted text-xs line-clamp-2">{reward.description}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setIsNew(false); setEditing({ ...reward }) }}
                    className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/8 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-primary/12 text-primary font-bold px-2.5 py-1 rounded-full">
                  {reward.required_points.toLocaleString()} pts
                </span>
                {reward.required_level && (
                  <span className="text-text-muted">{reward.required_level}+</span>
                )}
                <span className="text-text-muted ml-auto">Stock: {reward.stock}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-bg-card sm:rounded-2xl rounded-t-2xl max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">{isNew ? 'Add Reward' : 'Edit Reward'}</h3>
              <button onClick={() => setEditing(null)} className="text-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Reward Name" name="name" required defaultValue={editing.name} placeholder="e.g. StartupsIndia Hoodie" />
              <Textarea label="Description" name="description" required rows={2} defaultValue={editing.description} placeholder="What does the ambassador receive?" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Required Points" name="required_points" type="number" required min={0} defaultValue={editing.required_points ?? 0} />
                <Input label="Stock Count" name="stock" type="number" required min={0} defaultValue={editing.stock ?? 0} />
              </div>
              <Input label="Required Level" name="required_level" defaultValue={editing.required_level || 'Bronze'} placeholder="e.g. Silver" />
              <Input label="Image URL (optional)" name="image_url" type="url" defaultValue={editing.image_url || ''} placeholder="https://..." />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" size="sm">{isNew ? 'Create' : 'Save'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
