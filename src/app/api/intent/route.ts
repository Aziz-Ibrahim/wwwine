/**
 * wwwine Intent Ingestion + Aggregation API
 *
 * POST /api/intent  — receives anonymous behavioural events from the client
 * GET  /api/intent  — returns aggregated dashboard data (INTELLIGENCE_SECRET gated)
 *
 * Env vars (auto-injected by Vercel × Supabase integration):
 *   SUPABASE_URL          — your project URL
 *   SUPABASE_ANON_KEY     — used server-side only (never exposed to browser)
 *   INTELLIGENCE_SECRET   — gates the dashboard GET endpoint
 */

import { NextResponse }  from 'next/server'
import { createClient }  from '@supabase/supabase-js'
import type { IntentEvent } from '@/lib/intent'

// ── Supabase client (server-side only) ──────────────────────────
function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  return createClient(url, key)
}

// ── Validation ───────────────────────────────────────────────────
const VALID_CATEGORIES = new Set(['DISCOVERY', 'AFFINITY', 'PURCHASE', 'LEARNING'])
const VALID_ACTIONS    = new Set([
  'view_country', 'view_region', 'view_appellation',
  'search', 'food_search', 'quiz_complete', 'compare',
  'affiliate_click', 'dwell',
])

function validate(body: unknown): body is IntentEvent {
  if (!body || typeof body !== 'object') return false
  const e = body as Record<string, unknown>
  return (
    typeof e.sessionId === 'string' && e.sessionId.length < 64 &&
    typeof e.timestamp === 'number' &&
    typeof e.category  === 'string' && VALID_CATEGORIES.has(e.category) &&
    typeof e.action    === 'string' && VALID_ACTIONS.has(e.action) &&
    // Guard: reject anything that smells like PII
    !JSON.stringify(body).match(/@|phone|email|["\s]name["\s]|address|postcode|zip/i)
  )
}

// ── POST — ingest one event ──────────────────────────────────────
export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!validate(body)) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 422 })
  }

  const clean = {
    session_id:   body.sessionId,
    ts:           new Date(body.timestamp).toISOString(),
    timezone:     body.timezone   ?? 'unknown',
    category:     body.category,
    action:       body.action,
    country:      body.country    ?? null,
    region:       body.region     ?? null,
    appellation:  body.appellation ?? null,
    grape:        body.grape      ?? null,
    style:        body.style      ?? null,
    search_query: body.searchQuery?.slice(0, 100) ?? null,
    food_query:   body.foodQuery?.slice(0, 100)   ?? null,
    quiz_result:  body.quizResult ?? null,
    dwell_bucket: body.dwellBucket ?? null,
  }

  try {
    const sb = getSupabase()
    const { error } = await sb.from('intent_events').insert(clean)
    if (error) {
      console.error('[intent] insert error:', error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }
  } catch (err) {
    console.error('[intent] supabase unavailable:', err)
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}

// ── GET — aggregated dashboard query ────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  if (searchParams.get('secret') !== process.env.INTELLIGENCE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hours = Math.min(parseInt(searchParams.get('hours') ?? '24'), 720)
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  try {
    const sb = getSupabase()

    // All events in window
    const { data: events, error } = await sb
      .from('intent_events')
      .select('session_id, category, action, country, appellation, search_query, food_query, quiz_result, dwell_bucket')
      .gte('ts', since)

    if (error) throw error

    const rows = events ?? []

    // Aggregate in JS (move to DB views / RPC once volume grows)
    const byAppellation: Record<string, number> = {}
    const byCountry:     Record<string, number> = {}
    const byAction:      Record<string, number> = {}
    const searchTerms:   Record<string, number> = {}
    const quizResults:   Record<string, number> = {}
    const breakdown     = { discovery: 0, affinity: 0, purchase: 0, learning: 0 }

    for (const e of rows) {
      if (e.appellation)   byAppellation[e.appellation] = (byAppellation[e.appellation] ?? 0) + 1
      if (e.country)       byCountry[e.country]         = (byCountry[e.country]         ?? 0) + 1
      byAction[e.action]                                 = (byAction[e.action]           ?? 0) + 1
      if (e.search_query)  searchTerms[e.search_query]  = (searchTerms[e.search_query]  ?? 0) + 1
      if (e.quiz_result)   quizResults[e.quiz_result]   = (quizResults[e.quiz_result]   ?? 0) + 1
      const cat = e.category?.toLowerCase() as keyof typeof breakdown
      if (cat in breakdown) breakdown[cat]++
    }

    const sort = (obj: Record<string, number>) =>
      Object.entries(obj).sort((a, b) => b[1] - a[1])

    return NextResponse.json({
      period_hours:     hours,
      total_events:     rows.length,
      unique_sessions:  new Set(rows.map(e => e.session_id)).size,
      top_appellations: sort(byAppellation).slice(0, 20),
      top_countries:    sort(byCountry).slice(0, 10),
      top_searches:     sort(searchTerms).slice(0, 20),
      quiz_results:     sort(quizResults).slice(0, 10),
      actions:          byAction,
      intent_breakdown: breakdown,
    })
  } catch (err) {
    console.error('[intent] dashboard query failed:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }
}
