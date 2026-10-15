import { useState, useEffect } from "react"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { Input, Textarea, Select } from "../../components/FormControls"
import {
  Bell, Plus, Trash2, CheckCircle2, Megaphone,
  AlertCircle, Gift, CheckSquare, Send
} from "lucide-react"
import { ErrorAlert } from "../../components/ErrorAlert"
import { Modal } from "../../components/Modal"
import {
  type AppNotification,
  fetchNotifications,
  createNotification,
  deleteNotification
} from "../../lib/notifications"

export function NotificationMgmtView() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'announcement' as AppNotification['category'],
    target_audience: 'all' as AppNotification['target_audience'],
    action_url: ''
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotifications()
      setNotifications(data)
    } catch (err: any) {
      console.error("Failed to load notifications:", err)
      setError(err.message || "Failed to load notifications.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = () => {
    setFormData({
      title: '',
      message: '',
      category: 'announcement',
      target_audience: 'all',
      action_url: ''
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) return

    setSubmitting(true)
    setFeedbackMsg(null)
    try {
      await createNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        category: formData.category,
        target_audience: formData.target_audience,
        action_url: formData.action_url.trim() || undefined
      })

      setFeedbackMsg({
        type: 'success',
        text: `Notification "${formData.title}" pushed successfully to ambassadors!`
      })
      setTimeout(() => setFeedbackMsg(null), 4000)
      setIsModalOpen(false)
      await loadData()
    } catch (err: any) {
      console.error("Failed to create notification:", err)
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to push notification." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete notification "${title}"?`)) return
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setFeedbackMsg({ type: 'success', text: "Notification removed successfully." })
      setTimeout(() => setFeedbackMsg(null), 3500)
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to delete notification." })
    }
  }

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-amber-400" />
      case 'reward':
        return <Gift className="w-4 h-4 text-emerald-400" />
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-rose-400" />
      default:
        return <Megaphone className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {error && <ErrorAlert message={error} onRetry={loadData} />}

      {/* Success / Error Feedback Alert */}
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
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Push Notifications
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Broadcast platform updates, task alerts, and announcements to ambassadors.
          </p>
        </div>

        <Button onClick={handleOpenModal} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Push New Notification
        </Button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-bg-card rounded-xl border border-border-dark" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-border-dark">
          <Bell className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-white font-semibold">No active notifications</p>
          <p className="text-text-muted text-xs mt-1 mb-4">
            Create your first push notification to broadcast to ambassadors.
          </p>
          <Button size="sm" onClick={handleOpenModal} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Push Notification
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <Card
              key={notif.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-bg-dark border border-border-dark flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {notif.category}
                    </Badge>
                    <Badge variant="default" className="text-[10px]">
                      Audience: {notif.target_audience}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-text-muted/70 mt-2">
                    <span>
                      {new Date(notif.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {notif.action_url && (
                      <span className="text-primary font-mono truncate max-w-xs">
                        Action link: {notif.action_url}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-dark/60">
                <button
                  onClick={() => handleDelete(notif.id, notif.title)}
                  className="p-2 text-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Broadcast New Notification"
        icon={<Send className="w-4 h-4 text-primary" />}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Notification Title"
            placeholder="e.g. New Campus Task Alert"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <Textarea
            label="Message Content"
            placeholder="Write the notification message to display to ambassadors..."
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category / Priority"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
            >
              <option value="announcement">Announcement (General)</option>
              <option value="task">Task Alert</option>
              <option value="reward">Reward Update</option>
              <option value="urgent">Urgent Alert</option>
            </Select>

            <Select
              label="Target Audience"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value as any }))}
            >
              <option value="all">All Ambassadors</option>
              <option value="approved">Approved Ambassadors Only</option>
              <option value="pending">Pending Applicants</option>
              <option value="gold_plus">Gold Tier & Above</option>
            </Select>
          </div>

          <Input
            label="Action URL (Optional)"
            placeholder="e.g. /tasks or /rewards"
            value={formData.action_url}
            onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
          />

          <div className="flex gap-2 justify-end pt-3 border-t border-border-dark">
            <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Pushing..." : "Push Notification"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
