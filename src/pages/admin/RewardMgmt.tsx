import { useEffect, useState } from "react"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { supabase } from "../../lib/supabase"
import { Edit2, Trash2, Plus } from "lucide-react"

type Reward = {
  id: string;
  name: string;
  description: string;
  required_points: number;
  stock: number;
  image_url: string;
}

export const RewardMgmt = () => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchRewards = async () => {
    setLoading(true)
    const { data } = await supabase.from('rewards').select('*').order('required_points', { ascending: true })
    if (data) setRewards(data)
    setLoading(false)
  }

  useEffect(() => { fetchRewards() }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const rewardData = {
      name: formData.get('name'),
      description: formData.get('description'),
      required_points: parseInt(formData.get('required_points') as string),
      stock: parseInt(formData.get('stock') as string),
      image_url: formData.get('image_url')
    }

    if (editingReward) {
      await supabase.from('rewards').update(rewardData).eq('id', editingReward.id)
    } else {
      await supabase.from('rewards').insert([rewardData])
    }

    setIsFormOpen(false)
    setEditingReward(null)
    fetchRewards()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      await supabase.from('rewards').delete().eq('id', id)
      fetchRewards()
    }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Reward Management</h3>
        <Button onClick={() => { setEditingReward(null); setIsFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Reward
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6 border border-primary/50 bg-bg-dark/50">
          <h4 className="font-bold text-white mb-4">{editingReward ? 'Edit Reward' : 'Create Reward'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required name="name" defaultValue={editingReward?.name} placeholder="Reward Name" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <textarea required name="description" defaultValue={editingReward?.description} placeholder="Description" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <div className="flex gap-4">
              <input required type="number" name="required_points" defaultValue={editingReward?.required_points || 0} placeholder="Required Points" className="flex-1 p-2 rounded bg-bg-dark border border-border-dark text-white" />
              <input required type="number" name="stock" defaultValue={editingReward?.stock || 0} placeholder="Stock Quantity" className="flex-1 p-2 rounded bg-bg-dark border border-border-dark text-white" />
            </div>
            <input required name="image_url" defaultValue={editingReward?.image_url} placeholder="Image URL (Unsplash link)" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Reward</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-bg-dark rounded"></div>)}
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-text-muted text-sm border-b border-border-dark">
              <th className="pb-2">Reward</th>
              <th className="pb-2">Points</th>
              <th className="pb-2">Stock</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map(r => (
              <tr key={r.id} className="border-b border-border-dark/50">
                <td className="py-3 flex items-center gap-3">
                  <img src={r.image_url} alt={r.name} className="w-10 h-10 rounded object-cover border border-border-dark" />
                  <div>
                    <div className="text-white font-bold">{r.name}</div>
                  </div>
                </td>
                <td className="py-3 text-primary font-bold">{r.required_points}</td>
                <td className="py-3">
                  <Badge variant={r.stock > 0 ? 'success' : 'error'}>{r.stock} left</Badge>
                </td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingReward(r); setIsFormOpen(true) }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}
