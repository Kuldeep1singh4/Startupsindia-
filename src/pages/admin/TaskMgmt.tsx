import { useEffect, useState } from "react"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { supabase } from "../../lib/supabase"
import { Edit2, Trash2, Plus } from "lucide-react"

type Task = {
  id: string;
  name: string;
  description: string;
  points: number;
  required_proof_type: string;
  is_active: boolean;
  is_repeatable: boolean;
}

export const TaskMgmt = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const taskData = {
      name: formData.get('name'),
      description: formData.get('description'),
      points: parseInt(formData.get('points') as string),
      required_proof_type: formData.get('required_proof_type'),
      is_active: formData.get('is_active') === 'true',
      is_repeatable: formData.get('is_repeatable') === 'true'
    }

    if (editingTask) {
      await supabase.from('tasks').update(taskData).eq('id', editingTask.id)
    } else {
      await supabase.from('tasks').insert([taskData])
    }

    setIsFormOpen(false)
    setEditingTask(null)
    fetchTasks()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await supabase.from('tasks').delete().eq('id', id)
      fetchTasks()
    }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Task Management</h3>
        <Button onClick={() => { setEditingTask(null); setIsFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6 border border-primary/50 bg-bg-dark/50">
          <h4 className="font-bold text-white mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required name="name" defaultValue={editingTask?.name} placeholder="Task Name" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <textarea required name="description" defaultValue={editingTask?.description} placeholder="Description" className="w-full p-2 rounded bg-bg-dark border border-border-dark text-white" />
            <div className="flex gap-4">
              <input required type="number" name="points" defaultValue={editingTask?.points || 0} placeholder="Points" className="flex-1 p-2 rounded bg-bg-dark border border-border-dark text-white" />
              <select name="required_proof_type" defaultValue={editingTask?.required_proof_type || 'URL'} className="flex-1 p-2 rounded bg-bg-dark border border-border-dark text-white">
                <option value="URL">URL</option>
                <option value="Image">Image</option>
                <option value="Screenshot">Screenshot</option>
                <option value="Video URL">Video URL</option>
                <option value="Text">Text</option>
                <option value="Event details">Event details</option>
              </select>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white"><input type="radio" name="is_active" value="true" defaultChecked={editingTask ? editingTask.is_active : true} /> Active</label>
              <label className="flex items-center gap-2 text-white"><input type="radio" name="is_active" value="false" defaultChecked={editingTask ? !editingTask.is_active : false} /> Paused</label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white"><input type="radio" name="is_repeatable" value="true" defaultChecked={editingTask ? editingTask.is_repeatable : false} /> Repeatable</label>
              <label className="flex items-center gap-2 text-white"><input type="radio" name="is_repeatable" value="false" defaultChecked={editingTask ? !editingTask.is_repeatable : true} /> One-time</label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save Task</Button>
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
              <th className="pb-2">Name</th>
              <th className="pb-2">Points</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-b border-border-dark/50">
                <td className="py-3 text-white">{t.name}</td>
                <td className="py-3 text-primary font-bold">{t.points}</td>
                <td className="py-3 text-text-muted text-sm">{t.required_proof_type}</td>
                <td className="py-3">
                  <Badge variant={t.is_active ? 'success' : 'default'}>{t.is_active ? 'Active' : 'Paused'}</Badge>
                </td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingTask(t); setIsFormOpen(true) }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}
