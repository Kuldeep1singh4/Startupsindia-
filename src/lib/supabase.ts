import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// B6 Security Compliance: Ensure zero auth tokens are stored in browser localStorage.
// Purge any legacy auth tokens previously stored in localStorage by Supabase defaults.
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.includes('supabase.auth'))) {
        localStorage.removeItem(key)
      }
    }
  } catch (e) {
    // Ignore storage access errors in restricted sandboxes
  }
}

// Configure Supabase Auth to use sessionStorage instead of persistent localStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})
