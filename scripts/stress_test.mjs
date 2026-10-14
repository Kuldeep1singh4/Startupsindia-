import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

let SUPABASE_URL = process.env.VITE_SUPABASE_URL
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if ((!SUPABASE_URL || !SUPABASE_KEY) && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8')
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.trim().split('=')
    if (k === 'VITE_SUPABASE_URL') SUPABASE_URL = v.join('=')
    if (k === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = v.join('=')
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function runBenchmark(name, totalRequests, concurrency, fn) {
  console.log(`\n========================================`)
  console.log(`Running Benchmark: ${name}`)
  console.log(`Requests: ${totalRequests} | Concurrency: ${concurrency}`)
  console.log(`========================================`)

  const latencies = []
  let successes = 0
  let failures = 0
  let completed = 0

  const startTime = Date.now()

  async function worker() {
    while (completed < totalRequests) {
      completed++
      const reqStart = Date.now()
      try {
        await fn()
        const duration = Date.now() - reqStart
        latencies.push(duration)
        successes++
      } catch (err) {
        failures++
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker())
  await Promise.all(workers)

  const totalTimeSec = (Date.now() - startTime) / 1000
  latencies.sort((a, b) => a - b)

  const min = latencies[0] || 0
  const max = latencies[latencies.length - 1] || 0
  const avg = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0
  const rps = (totalRequests / totalTimeSec).toFixed(2)

  console.log(`Completed in: ${totalTimeSec.toFixed(2)}s`)
  console.log(`Success rate: ${((successes / totalRequests) * 100).toFixed(1)}% (${successes}/${totalRequests})`)
  console.log(`Failures: ${failures}`)
  console.log(`RPS: ${rps} req/sec`)
  console.log(`Latency: Min=${min}ms | Avg=${avg.toFixed(1)}ms | P50=${p50}ms | P95=${p95}ms | Max=${max}ms`)

  return { successes, failures, rps, avg, p95 }
}

async function runSecurityAudit() {
  console.log(`\n========================================`)
  console.log(`Security Baseline Review: Table Access Scope`)
  console.log(`========================================`)

  // 1. Check anonymous access to ambassadors table
  const { data: ambData, error: ambErr } = await supabase.from('ambassadors').select('id, full_name, role').limit(5)
  console.log(`Ambassadors table anon read:`, ambErr ? `Restricted (${ambErr.message})` : `Accessible (${ambData?.length} records returned)`)

  // 2. Check anonymous access to admin_logs table
  const { data: logData, error: logErr } = await supabase.from('admin_logs').select('*').limit(5)
  console.log(`Admin logs anon read:`, logErr ? `Restricted/Protected (${logErr.message})` : `Accessible (${logData?.length} records returned)`)

  // 3. Check tasks table
  const { data: taskData, error: taskErr } = await supabase.from('tasks').select('id, name, points').limit(5)
  console.log(`Tasks catalog anon read:`, taskErr ? `Error (${taskErr.message})` : `Accessible (${taskData?.length} tasks)`)

  // 4. Check rewards table
  const { data: rewData, error: rewErr } = await supabase.from('rewards').select('id, name').limit(5)
  console.log(`Rewards catalog anon read:`, rewErr ? `Error (${rewErr.message})` : `Accessible (${rewData?.length} rewards)`)
}

async function main() {
  console.log("STARTING STRESS TEST & SECURITY AUDIT")
  console.log(`Target: ${SUPABASE_URL}`)

  // Benchmark 1: Tasks query concurrency
  await runBenchmark("Tasks Catalog Read", 50, 10, async () => {
    const { error } = await supabase.from('tasks').select('id, name, points').eq('is_active', true)
    if (error) throw error
  })

  // Benchmark 2: Rewards query concurrency
  await runBenchmark("Rewards Catalog Read", 50, 10, async () => {
    const { error } = await supabase.from('rewards').select('id, name, required_points').order('required_points', { ascending: true })
    if (error) throw error
  })

  // Benchmark 3: Levels config query concurrency
  await runBenchmark("Levels Config Read", 50, 10, async () => {
    const { error } = await supabase.from('levels_config').select('id, name, min_points')
    if (error) throw error
  })

  // Security Audit
  await runSecurityAudit()

  console.log("\nSTRESS TEST AND SECURITY AUDIT COMPLETE.")
}

main().catch(err => {
  console.error("Benchmark failed with error:", err)
  process.exit(1)
})
