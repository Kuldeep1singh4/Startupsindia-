/**
 * Client-Side Rate Limiter & Abuse Prevention Engine
 * Implements sliding-window and token bucket algorithms in-memory
 * to prevent brute-force attacks, rapid bot submissions, and API spamming.
 */

interface RateLimitRecord {
  timestamps: number[]
  lockedUntil?: number
}

// In-memory store (keyed by action identifier + user/ip proxy)
const rateLimitStore = new Map<string, RateLimitRecord>()

export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  retryAfterSeconds: number
  message?: string
}

/**
 * Checks and records an attempt against a specific rate limit bucket.
 * 
 * @param action - Unique name of the action (e.g. 'login', 'register', 'submit_task')
 * @param maxAttempts - Maximum attempts allowed within the window
 * @param windowMs - Time window in milliseconds (e.g. 60_000 for 1 minute)
 * @param lockoutMs - Lockout duration if limit exceeded (defaults to windowMs)
 */
export function checkRateLimit(
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000,
  lockoutMs: number = 60_000
): RateLimitResult {
  const now = Date.now()
  let record = rateLimitStore.get(action)

  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(action, record)
  }

  // 1. Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      message: `Too many attempts. For security reasons, please wait ${retryAfterSeconds} second${retryAfterSeconds > 1 ? 's' : ''} before trying again.`
    }
  }

  // 2. Filter timestamps outside the sliding window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs)

  // 3. Check if threshold exceeded
  if (record.timestamps.length >= maxAttempts) {
    record.lockedUntil = now + lockoutMs
    const retryAfterSeconds = Math.ceil(lockoutMs / 1000)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      message: `Rate limit reached. Please wait ${retryAfterSeconds} seconds before trying again.`
    }
  }

  // 4. Record new attempt
  record.timestamps.push(now)
  const remainingAttempts = maxAttempts - record.timestamps.length

  return {
    allowed: true,
    remainingAttempts,
    retryAfterSeconds: 0
  }
}

/**
 * Resets a rate limit bucket (e.g. after a successful login).
 */
export function resetRateLimit(action: string): void {
  rateLimitStore.delete(action)
}
