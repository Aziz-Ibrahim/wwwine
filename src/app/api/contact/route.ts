import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const VALID_REASONS = new Set([
  'Atlas correction', 'Region suggestion', 'Partnership', 'Product feedback',
  'Press enquiry', 'Privacy request', 'Other',
])

const attempts = new Map<string, number[]>()

function getSupabase() {
  const url = process.env.SUPABASE_URL
  // Service role key is ideal but falls back to anon key — both work server-side
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY       ||
    process.env.SUPABASE_ANON_KEY         ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function authorized(req: Request) {
  return req.headers.get('authorization') === `Bearer ${process.env.INTELLIGENCE_SECRET}`
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot — bots fill the website field, humans don't
  if (cleanString(body.website)) return NextResponse.json({ ok: true })

  const name    = cleanString(body.name)
  const email   = cleanString(body.email).toLowerCase()
  const reason  = cleanString(body.reason)
  const message = cleanString(body.message)
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (name.length < 2 || name.length > 80)
    return NextResponse.json({ error: 'Enter a valid name.' }, { status: 422 })
  if (!validEmail || email.length > 254)
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 422 })
  if (!VALID_REASONS.has(reason))
    return NextResponse.json({ error: 'Select a valid reason.' }, { status: 422 })
  if (message.length < 10 || message.length > 250)
    return NextResponse.json({ error: 'Message must be between 10 and 250 characters.' }, { status: 422 })

  // Rate limit: max 5 submissions per IP per hour
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const now = Date.now()
  const recent = (attempts.get(forwarded) ?? []).filter(t => now - t < 60 * 60 * 1000)
  if (recent.length >= 5)
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
  attempts.set(forwarded, [...recent, now])

  try {
    const { error } = await getSupabase()
      .from('contact_messages')
      .insert({ name, email, reason, message })
    if (error) {
      console.error('[contact] insert failed:', error.message, error.code)
      throw error
    }
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('[contact] error:', error)
    return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 503 })
  }
}

export async function GET(req: Request) {
  if (!authorized(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await getSupabase()
      .from('contact_messages')
      .select('id, created_at, name, email, reason, message, read_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return NextResponse.json({ messages: data ?? [] })
  } catch (error) {
    console.error('[contact] query failed:', error)
    return NextResponse.json({ error: 'Unable to load messages.' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!authorized(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null) as { id?: string; read?: boolean } | null
  if (!body?.id || typeof body.read !== 'boolean')
    return NextResponse.json({ error: 'Invalid request.' }, { status: 422 })

  try {
    const { error } = await getSupabase()
      .from('contact_messages')
      .update({ read_at: body.read ? new Date().toISOString() : null })
      .eq('id', body.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact] update failed:', error)
    return NextResponse.json({ error: 'Unable to update message.' }, { status: 500 })
  }
}
