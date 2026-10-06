import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Input } from "../../components/FormControls"
import { Plus, Edit2, Trash2, X } from "lucide-react"

type Level = {
  id: string
  name: string
  designation: string
  min_points: number
}

const BLANK: Omit<Level, 'id'> = { name: '', designation: '', min_points: 0 }

export function LevelMgmtView() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Level> | null>(null)
  const [isNew, setIsNew] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('levels_config').select('*').order('min_points', { ascending: true })
    if (data) setLevels(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: fd.get('name') as string,
      designation: fd.get('designation') as string,
      min_points: parseInt(fd.get('min_points') as string),
    }
    if (isNew) {
      await supabase.from('levels_config').insert([payload])
    } else if (editing.id) {
      await supabase.from('levels_config').update(payload).eq('id', editing.id)
    }
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this level?')) return
    await supabase.from('levels_config').delete().eq('id', id)
    setLevels(prev => prev.filter(l => l.id !== id))
  }

  const EMOJIS: Record<string, string> = {
    'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇',
    'Platinum': '💠', 'Diamond': '💎', 'National': '🏅'
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{levels.length} levels configured</p>
        <Button size="sm" onClick={() => { setIsNew(true); setEditing({ ...BLANK }) }} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Level
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
              <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center text-xl shrink-0">
                {EMOJIS[level.name] || `${idx + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white text-sm">{level.name}</span>
                  <span className="text-primary text-xs font-bold">{level.min_points.toLocaleString()} pts</span>
                </div>
                <p className="text-text-muted text-xs">{level.designation}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setIsNew(false); setEditing({ ...level }) }}
                  className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(level.id)}
                  className="p-2 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/8 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-sm bg-bg-card sm:rounded-2xl rounded-t-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">{isNew ? 'Add Level' : 'Edit Level'}</h3>
              <button onClick={() => setEditing(null)} className="text-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Level Name" name="name" required defaultValue={editing.name} placeholder="e.g. Silver" />
              <Input label="Designation" name="designation" required defaultValue={editing.designation} placeholder="e.g. Senior Campus Ambassador" />
              <Input label="Minimum Points" name="min_points" type="number" required min={0} defaultValue={editing.min_points ?? 0} />
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
