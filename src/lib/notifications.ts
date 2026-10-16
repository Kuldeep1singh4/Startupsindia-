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
    id: 'e1000000-0000-0000-0000-000000000001',
    title: 'Welcome to StartupsIndia Ambassador Program',
    message: 'Explore your dashboard, complete tasks, and climb the national leaderboard!',
    category: 'announcement',
    target_audience: 'all',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    action_url: '/tasks'
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    title: 'New Campus Tasks Available',
    message: 'Submit your proofs for recently added campus outreach tasks to earn points.',
    category: 'task',
    target_audience: 'approved',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    action_url: '/tasks'
  }
]

// Track Supabase schema availability to avoid spamming 404 network requests in console
let isSupabaseNotificationsAvailable: boolean | null = null

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

export function isNotificationsTableOnline(): boolean {
  return isSupabaseNotificationsAvailable === true
}

export function resetNotificationsTableAvailability(): void {
  isSupabaseNotificationsAvailable = null
}

export async function checkSupabaseNotificationsAvailability(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)

    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
      isSupabaseNotificationsAvailable = false
      return false
    }
    isSupabaseNotificationsAvailable = !error
    return isSupabaseNotificationsAvailable
  } catch {
    isSupabaseNotificationsAvailable = false
    return false
  }
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  // 1. If Supabase is verified available or hasn't been probed yet, try fetching
  if (isSupabaseNotificationsAvailable !== false) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          isSupabaseNotificationsAvailable = false
        }
      } else if (data !== null) {
        isSupabaseNotificationsAvailable = true
        return data as AppNotification[]
      }
    } catch {
      isSupabaseNotificationsAvailable = false
    }
  }

  // 2. Fallback to local broadcast storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn("Failed to read local notifications:", err)
  }

  // 3. Initial defaults (only on fresh storage)
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
  let createdNotif: AppNotification | null = null

  // 1. Persist to Supabase without sending a manual string ID (let PostgreSQL generate the UUID)
  if (isSupabaseNotificationsAvailable !== false) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          title: params.title,
          message: params.message,
          category: params.category,
          target_audience: params.target_audience,
          action_url: params.action_url || null
        }])
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          isSupabaseNotificationsAvailable = false
        } else {
          console.warn("Supabase notification insert warning:", error.message)
        }
      } else if (data) {
        isSupabaseNotificationsAvailable = true
        createdNotif = data as AppNotification
      }
    } catch {
      isSupabaseNotificationsAvailable = false
    }
  }

  // 2. Fallback representation if database insert is not used
  if (!createdNotif) {
    createdNotif = {
      ...params,
      id: generateUUID(),
      created_at: new Date().toISOString()
    }
  }

  // 3. Always update local store for instant UI sync
  try {
    const current = await fetchNotifications()
    const updated = [createdNotif, ...current.filter(n => n.id !== createdNotif!.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('startupsindia:notification_added', { detail: createdNotif }))
  } catch (err) {
    console.warn("Failed to write notification to local store:", err)
  }

  return createdNotif
}

export async function deleteNotification(id: string): Promise<void> {
  // 1. Delete from Supabase if table is online and ID is a valid UUID
  if (isSupabaseNotificationsAvailable !== false && isUUID(id)) {
    try {
      await supabase.from('notifications').delete().eq('id', id)
    } catch {
      // ignore
    }
  }

  // 2. Delete from local store
  try {
    const current = await fetchNotifications()
    const updated = current.filter(n => n.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('startupsindia:notification_added'))
  } catch (err) {
    console.warn("Failed to delete notification from local store:", err)
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
