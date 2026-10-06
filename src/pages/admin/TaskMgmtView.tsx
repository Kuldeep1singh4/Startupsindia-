import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { Select, Input, Textarea } from "../../components/FormControls"
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react"

type Task = {
  id: string
  name: string
  description: string
  points: number
  required_proof_type: string
  is_active: boolean
  is_repeatable: boolean
  created_at: string
}

const BLANK_TASK: Omit<Task, 'id' | 'created_at'> = {
  name: '', description: '', points: 100,
  required_proof_type: 'Text', is_active: true, is_repeatable: false
}

export function TaskMgmtView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  const openNew = () => { setIsNew(true); setEditingTask({ ...BLANK_TASK }) }
  const openEdit = (task: Task) => { setIsNew(false); setEditingTask({ ...task }) }
  const closeForm = () => { setEditingTask(null); setIsNew(false) }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTask) return
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      points: parseInt(fd.get('points') as string),
      required_proof_type: fd.get('required_proof_type') as string,
      is_active: fd.get('is_active') === 'true',
      is_repeatable: fd.get('is_repeatable') === 'true',
    }

    if (isNew) {
      await supabase.from('tasks').insert([payload])
    } else if (editingTask.id) {
      await supabase.from('tasks').update(payload).eq('id', editingTask.id)
    }
    closeForm()
    fetchTasks()
  }

  const handleToggleActive = async (task: Task) => {
    setActionLoading(task.id)
    await supabase.from('tasks').update({ is_active: !task.is_active }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_active: !t.is_active } : t))
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task? All submissions linked to it will be affected.')) return
    setActionLoading(id)
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setActionLoading(null)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{tasks.length} task{tasks.length !== 1 ? 's' : ''} configured</p>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-bg-card rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <Card key={task.id} className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center hover:border-border-dark/60 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-white text-sm">{task.name}</span>
                  <Badge variant={task.is_active ? 'success' : 'outline'} className="text-[9px]">
                    {task.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {task.is_repeatable && (
                    <Badge variant="warning" className="text-[9px]">Repeatable</Badge>
                  )}
                </div>
                <p className="text-text-muted text-xs line-clamp-1 mb-1">{task.description}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="text-primary font-bold">{task.points} pts</span>
                  <span>·</span>
                  <span>Proof: {task.required_proof_type}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(task)}
                  disabled={actionLoading === task.id}
                  className="text-text-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  title={task.is_active ? 'Deactivate' : 'Activate'}
                >
                  {task.is_active
                    ? <ToggleRight className="w-4.5 h-4.5 text-green-400" />
                    : <ToggleLeft className="w-4.5 h-4.5" />}
                </button>
                <button
                  onClick={() => openEdit(task)}
                  className="text-text-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={actionLoading === task.id}
                  className="text-text-muted hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/8"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit form modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-bg-card sm:rounded-2xl rounded-t-2xl max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">{isNew ? 'Create Task' : 'Edit Task'}</h3>
              <button onClick={closeForm} className="text-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Task Name" name="name" required defaultValue={editingTask.name} placeholder="e.g. Share Event Poster" />
              <Textarea label="Description" name="description" required rows={3} defaultValue={editingTask.description} placeholder="Describe what the ambassador needs to do..." />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Points" name="points" type="number" required min={0} defaultValue={editingTask.points || 100} />
                <Select label="Proof Type" name="required_proof_type" defaultValue={editingTask.required_proof_type}>
                  <option value="Text">Text</option>
                  <option value="URL">URL / Link</option>
                  <option value="Image">Image</option>
                  <option value="Screenshot">Screenshot</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Status" name="is_active" defaultValue={editingTask.is_active ? 'true' : 'false'}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
                <Select label="Repeatable?" name="is_repeatable" defaultValue={editingTask.is_repeatable ? 'true' : 'false'}>
                  <option value="false">No (once only)</option>
                  <option value="true">Yes (unlimited)</option>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
                <Button type="submit" size="sm">{isNew ? 'Create Task' : 'Save Changes'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
