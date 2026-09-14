/**
 * Intent ingestion endpoint
 * 
 * Receives anonymous event stream, validates, and writes to the aggregation store.
 * In production this would fan out to: Postgres (raw events, 90-day TTL) +
 * a time-series DB (ClickHouse / Timescale) for the dashboard queries.
 * 
 * For now: in-memory aggregation + console log (replace with your DB of choice).
 * 
 * Privacy controls:
 *   - No IP address stored (Vercel strips it before this runs if configured)
 *   - No user agent stored
 *   - Session IDs are random UUIDs with no cross-session linkage
 *   - Events older than 90 days are purged
 */

import { NextResponse } from 'next/server'
import type { IntentEvent } from '@/lib/intent'

// ── Validation ───────────────────────────────────────────────────
const VALID_CATEGORIES = new Set(['DISCOVERY', 'AFFINITY', 'PURCHASE', 'LEARNING'])
const VALID_ACTIONS = new Set([
  'view_country', 'view_region', 'view_appellation',
  'search', 'food_search', 'quiz_complete', 'compare',
  'affiliate_click', 'dwell',
])

function validate(body: unknown): body is IntentEvent {
  if (!body || typeof body !== 'object') return false
  const e = body as Record<string, unknown>
  return (
    typeof e.sessionId   === 'string' && e.sessionId.length < 64 &&
    typeof e.timestamp   === 'number' &&
    typeof e.category    === 'string' && VALID_CATEGORIES.has(e.category) &&
    typeof e.action      === 'string' && VALID_ACTIONS.has(e.action) &&
    // Guard: no email, no names, no anything that smells like PII
    !JSON.stringify(body).match(/@|phone|email|name|address|postcode|zip/i)
  )
}

// ── In-memory aggregator (replace with DB writes in production) ──
// Aggregates last 1,000 events per process instance.
// In production: INSERT INTO intent_events (...) VALUES (...)
const eventLog: IntentEvent[] = []
const MAX_IN_MEMORY = 1000

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  if (!validate(body)) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 422 })
  }

  // Scrub anything we don't need before storing
  const clean: IntentEvent = {
    sessionId:    body.sessionId,
    timestamp:    body.timestamp,
    timezone:     body.timezone ?? 'unknown',
    category:     body.category,
    action:       body.action,
    country:      body.country,
    region:       body.region,
    appellation:  body.appellation,
    grape:        body.grape,
    style:        body.style,
    searchQuery:  body.searchQuery?.slice(0, 100),   // cap length
    foodQuery:    body.foodQuery?.slice(0, 100),
    quizResult:   body.quizResult,
    dwellBucket:  body.dwellBucket,
  }

  eventLog.push(clean)
  if (eventLog.length > MAX_IN_MEMORY) eventLog.shift()

  // TODO production: await db.insert('intent_events', clean)
  // e.g. Supabase: await supabase.from('intent_events').insert(clean)
  // e.g. Vercel KV: await kv.lpush('intent:raw', JSON.stringify(clean))

  return NextResponse.json({ ok: true })
}

// ── Internal aggregation query (used by Intelligence Dashboard) ──
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  // Simple secret gate — replace with proper auth in production
  if (secret !== process.env.INTELLIGENCE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hours = parseInt(searchParams.get('hours') ?? '24')
  const since = Date.now() - hours * 60 * 60 * 1000

  const recent = eventLog.filter(e => e.timestamp > since)

  // Aggregate by appellation
  const byAppellation: Record<string, number> = {}
  const byCountry:     Record<string, number> = {}
  const byAction:      Record<string, number> = {}
  const searchTerms:   Record<string, number> = {}
  const quizResults:   Record<string, number> = {}

  for (const e of recent) {
    if (e.appellation) byAppellation[e.appellation] = (byAppellation[e.appellation] ?? 0) + 1
    if (e.country)     byCountry[e.country]         = (byCountry[e.country]         ?? 0) + 1
    byAction[e.action] = (byAction[e.action] ?? 0) + 1
    if (e.searchQuery) searchTerms[e.searchQuery]   = (searchTerms[e.searchQuery]   ?? 0) + 1
    if (e.quizResult)  quizResults[e.quizResult]    = (quizResults[e.quizResult]    ?? 0) + 1
  }

  const topAppellations = Object.entries(byAppellation)
    .sort((a, b) => b[1] - a[1]).slice(0, 20)
  const topSearches = Object.entries(searchTerms)
    .sort((a, b) => b[1] - a[1]).slice(0, 20)

  return NextResponse.json({
    period_hours:     hours,
    total_events:     recent.length,
    unique_sessions:  new Set(recent.map(e => e.sessionId)).size,
    top_appellations: topAppellations,
    top_countries:    Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10),
    top_searches:     topSearches,
    quiz_results:     Object.entries(quizResults).sort((a, b) => b[1] - a[1]).slice(0, 10),
    actions:          byAction,
    intent_breakdown: {
      discovery: recent.filter(e => e.category === 'DISCOVERY').length,
      affinity:  recent.filter(e => e.category === 'AFFINITY').length,
      purchase:  recent.filter(e => e.category === 'PURCHASE').length,
      learning:  recent.filter(e => e.category === 'LEARNING').length,
    },
  })
}
