import { supabase } from "./supabase"

export interface AppNotification {
  id: string
  title: string
  message: string
  category: 'announcement' | 'task' | 'reward' | 'urgent'
  target_audience: 'all' | 'approved' | 'pending' | 'gold_plus'
  created_at: string
  created_by?: string
  action_url?: string
}

const STORAGE_KEY = 'startupsindia_broadcast_notifications_v1'
const READ_STORAGE_KEY = 'startupsindia_read_notifications_v1'

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_welcome',
    title: 'Welcome to StartupsIndia Ambassador Program',
    message: 'Explore your dashboard, complete tasks, and climb the national leaderboard!',
    category: 'announcement',
    target_audience: 'all',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    action_url: '/tasks'
  },
  {
    id: 'notif_tasks',
    title: 'New Campus Tasks Available',
    message: 'Submit your proofs for recently added campus outreach tasks to earn points.',
    category: 'task',
    target_audience: 'approved',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    action_url: '/tasks'
  }
]

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    // Attempt fetch from Supabase if table exists
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data as AppNotification[]
    }
  } catch {
    // Table not present in schema; fall back to local store
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.error("Failed to read local notifications:", err)
  }

  // Initial defaults
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS))
  } catch {
    // ignore
  }
  return DEFAULT_NOTIFICATIONS
}

export async function createNotification(
  params: Omit<AppNotification, 'id' | 'created_at'>
): Promise<AppNotification> {
  const newNotif: AppNotification = {
    ...params,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  }

  // 1. Try to persist to Supabase
  try {
    const { error } = await supabase.from('notifications').insert([newNotif])
    if (error) {
      console.warn("Supabase notifications table not ready; using persistent local broadcast store.")
    }
  } catch (err) {
    console.warn("Supabase notifications insert error:", err)
  }

  // 2. Persist to local broadcast store
  try {
    const current = await fetchNotifications()
    const updated = [newNotif, ...current.filter(n => n.id !== newNotif.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('startupsindia:notification_added', { detail: newNotif }))
  } catch (err) {
    console.error("Failed to write notification to local store:", err)
  }

  return newNotif
}

export async function deleteNotification(id: string): Promise<void> {
  // Try Supabase delete
  try {
    await supabase.from('notifications').delete().eq('id', id)
  } catch {
    // ignore
  }

  // Local store delete
  try {
    const current = await fetchNotifications()
    const updated = current.filter(n => n.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('startupsindia:notification_added'))
  } catch (err) {
    console.error("Failed to delete notification:", err)
  }
}

export function getReadNotificationIds(): string[] {
  try {
    const raw = sessionStorage.getItem(READ_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function markNotificationAsRead(id: string): void {
  try {
    const read = getReadNotificationIds()
    if (!read.includes(id)) {
      sessionStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...read, id]))
    }
  } catch {
    // ignore
  }
}

export function markAllNotificationsAsRead(notifications: AppNotification[]): void {
  try {
    const ids = notifications.map(n => n.id)
    sessionStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}
