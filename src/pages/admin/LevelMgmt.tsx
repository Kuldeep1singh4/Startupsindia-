import { useEffect, useState } from "react"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { supabase } from "../../lib/supabase"
import { Edit2, Trash2, Plus } from "lucide-react"

type Level = {
  id: string;
  name: string;
  min_points: number;
  designation: string;
}

export const LevelMgmt = () => {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchLevels = async () => {
    setLoading(true)
    const { data } = await supabase.from('levels_config').select('*').order('min_points', { ascending: true })
    if (data) setLevels(data)
    setLoading(false)
  }

  useEffect(() => { fetchLevels() }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const levelData = {
      name: formData.get('name'),
      designation: formData.get('designation'),
      min_points: parseInt(formData.get('min_points') as string)
    }

    if (editingLevel) {
      await supabase.from('levels_config').update(levelData).eq('id', editingLevel.id)
    } else {
      await supabase.from('levels_config').insert([levelData])
    }

    setIsFormOpen(false)
    setEditingLevel(null)
    fetchLevels()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this level?')) {
      await supabase.from('levels_config').delete().eq('id', id)
      fetchLevels()
    }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Level Management</h3>
        <Button onClick={() => { setEditingLevel(null); setIsFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Level
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6 border border-primary/50 bg-bg-dark/50">
          <h4 className="font-bold text-white mb-4">{editingLevel ? 'Edit Level' : 'Create Level'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required name="name" defaultValue={editingLevel?.name} placeholder="Level Name (e.g. Bronze)" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <input required name="designation" defaultValue={editingLevel?.designation} placeholder="Designation (e.g. Campus Ambassador)" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <input required type="number" name="min_points" defaultValue={editingLevel?.min_points || 0} placeholder="Minimum Points Required" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Level</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? <p className="text-white">Loading...</p> : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-text-muted text-sm border-b border-border-dark">
              <th className="pb-2">Name</th>
              <th className="pb-2">Designation</th>
              <th className="pb-2">Min Points</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map(l => (
              <tr key={l.id} className="border-b border-border-dark/50">
                <td className="py-3 text-white font-bold">{l.name}</td>
                <td className="py-3 text-text-muted">{l.designation}</td>
                <td className="py-3 text-primary">{l.min_points}</td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingLevel(l); setIsFormOpen(true) }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}
