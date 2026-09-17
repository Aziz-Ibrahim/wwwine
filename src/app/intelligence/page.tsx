/**
 * wwwine Intelligence Dashboard
 * 
 * Private route — accessed by paying B2B clients.
 * Shows aggregated, anonymised intent data: what wines users are
 * discovering, searching, comparing, and clicking to buy.
 * 
 * In production: gate with NextAuth + a "client" role,
 * and let clients filter by their own region/variety interests.
 */

'use client'

import { useState, useEffect } from 'react'
import styles from './intelligence.module.css'

interface IntentSummary {
  period_hours:     number
  total_events:     number
  unique_sessions:  number
  top_appellations: [string, number][]
  top_countries:    [string, number][]
  top_searches:     [string, number][]
  quiz_results:     [string, number][]
  actions:          Record<string, number>
  intent_breakdown: { discovery: number; affinity: number; purchase: number; learning: number }
  event_trend:      [string, number][]
}

interface ContactMessage {
  id: string
  created_at: string
  name: string
  email: string
  reason: string
  message: string
  read_at: string | null
}

const EMPTY_SUMMARY: IntentSummary = {
  period_hours: 24,
  total_events: 0,
  unique_sessions: 0,
  top_appellations: [],
  top_countries: [],
  top_searches: [],
  quiz_results: [],
  actions: {},
  intent_breakdown: { discovery: 0, affinity: 0, purchase: 0, learning: 0 },
  event_trend: [],
}

function normalizeSummary(value: unknown): IntentSummary {
  if (!value || typeof value !== 'object') return EMPTY_SUMMARY
  const data = value as Partial<IntentSummary>
  return {
    period_hours: typeof data.period_hours === 'number' ? data.period_hours : 24,
    total_events: typeof data.total_events === 'number' ? data.total_events : 0,
    unique_sessions: typeof data.unique_sessions === 'number' ? data.unique_sessions : 0,
    top_appellations: Array.isArray(data.top_appellations) ? data.top_appellations : [],
    top_countries: Array.isArray(data.top_countries) ? data.top_countries : [],
    top_searches: Array.isArray(data.top_searches) ? data.top_searches : [],
    quiz_results: Array.isArray(data.quiz_results) ? data.quiz_results : [],
    actions: data.actions && typeof data.actions === 'object' ? data.actions : {},
    intent_breakdown: data.intent_breakdown && typeof data.intent_breakdown === 'object'
      ? { ...EMPTY_SUMMARY.intent_breakdown, ...data.intent_breakdown }
      : EMPTY_SUMMARY.intent_breakdown,
    event_trend: Array.isArray(data.event_trend) ? data.event_trend : [],
  }
}

const HOURS_OPTIONS = [
  { label: 'Last 24 hours', value: 24 },
  { label: 'Last 7 days',   value: 168 },
  { label: 'Last 30 days',  value: 720 },
]

function Spark({ value, max }: { value: number; max: number }) {
  return (
    <div className={styles.sparkWrap}>
      <div className={styles.sparkBar} style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
      <span className={styles.sparkVal}>{value.toLocaleString()}</span>
    </div>
  )
}

function TrendChart({ points }: { points: [string, number][] }) {
  const max = Math.max(...points.map(([, value]) => value), 1)
  return (
    <div className={styles.trendChart} aria-label="Intent events over time">
      {points.length === 0 && <p className={styles.empty}>No intent events in this period</p>}
      {points.map(([label, value]) => (
        <div className={styles.trendPoint} key={label} title={`${label}: ${value} events`}>
          <span className={styles.trendValue}>{value}</span>
          <span className={styles.trendBar} style={{ height: `${Math.max(4, (value / max) * 100)}%` }} />
          <span className={styles.trendLabel}>{label.slice(5, 10)}</span>
        </div>
      ))}
    </div>
  )
}

export default function IntelligencePage() {
  const [secret,  setSecret]  = useState('')
  const [hours,   setHours]   = useState(24)
  const [data,    setData]    = useState<IntentSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [authed,  setAuthed]  = useState(false)
  const [tab, setTab] = useState<'analytics' | 'messages'>('analytics')
  const [messages, setMessages] = useState<ContactMessage[]>([])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/intent?hours=${hours}`, {
        headers: { Authorization: `Bearer ${secret}` },
      })
      if (res.status === 401) { setError('Invalid access key'); setLoading(false); return }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard data')
      setData(normalizeSummary(json))
      setAuthed(true)
      const contactRes = await fetch('/api/contact', { headers: { Authorization: `Bearer ${secret}` } })
      if (contactRes.ok) {
        const contactData = await contactRes.json()
        setMessages(Array.isArray(contactData.messages) ? contactData.messages : [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load - try again')
    }
    setLoading(false)
  }

  useEffect(() => { if (authed) load() }, [hours]) // eslint-disable-line

  const maxApp  = data ? Math.max(...data.top_appellations.map(([, n]) => n), 1) : 1
  const maxSrch = data ? Math.max(...data.top_searches.map(([, n]) => n), 1) : 1
  const total   = data ? Object.values(data.intent_breakdown).reduce((a, b) => a + b, 0) : 0
  const pct     = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0
  const unread  = messages.filter(message => !message.read_at).length

  async function toggleRead(message: ContactMessage) {
    const read = !message.read_at
    const response = await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id: message.id, read }),
    })
    if (response.ok) {
      setMessages(current => current.map(item => item.id === message.id
        ? { ...item, read_at: read ? new Date().toISOString() : null }
        : item))
    }
  }

  if (!authed) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateLogo}>🍷</div>
        <h1 className={styles.gateTitle}>wwwine Intelligence</h1>
        <p className={styles.gateSub}>Wine intent data — anonymous, aggregated, actionable</p>
        <div className={styles.gateForm}>
          <input
            className={styles.gateInput}
            type="password"
            placeholder="Access key"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          <button className={styles.gateBtn} onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Enter'}
          </button>
        </div>
        {error && <p className={styles.gateError}>{error}</p>}
        <p className={styles.gateNote}>
          Need access? <a href="/contact">Send a request</a>
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLogo}>🍷</span>
          <div>
            <h1 className={styles.headerTitle}>wwwine Intelligence</h1>
            <p className={styles.headerSub}>Anonymous wine intent data</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {tab === 'analytics' && HOURS_OPTIONS.map(o => (
            <button key={o.value}
              className={`${styles.periodBtn} ${hours === o.value ? styles.periodActive : ''}`}
              onClick={() => setHours(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Dashboard sections">
        <button className={`${styles.tab} ${tab === 'analytics' ? styles.tabActive : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
        <button className={`${styles.tab} ${tab === 'messages' ? styles.tabActive : ''}`} onClick={() => setTab('messages')}>Messages {unread > 0 && <span className={styles.badge}>{unread}</span>}</button>
      </nav>

      {data && tab === 'analytics' && (
        <>
          {/* KPI strip */}
          <div className={styles.kpis}>
            {[
              { label: 'Intent Events',    value: data.total_events.toLocaleString() },
              { label: 'Unique Sessions',  value: data.unique_sessions.toLocaleString() },
              { label: 'Top Country',      value: data.top_countries[0]?.[0] ?? '—' },
              { label: 'Top Search',       value: data.top_searches[0]?.[0] ?? '—' },
            ].map(k => (
              <div key={k.label} className={styles.kpi}>
                <div className={styles.kpiValue}>{k.value}</div>
                <div className={styles.kpiLabel}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Intent funnel */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Intent Funnel</h2>
            <div className={styles.funnel}>
              {([
                { key: 'discovery', label: 'Discovery', icon: '🔍', desc: 'browsing & exploring' },
                { key: 'learning',  label: 'Learning',  icon: '📖', desc: 'food pairing & education' },
                { key: 'affinity',  label: 'Affinity',  icon: '❤️', desc: 'deep reads, compare, quiz' },
                { key: 'purchase',  label: 'Purchase',  icon: '🛒', desc: 'affiliate & buy clicks' },
              ] as const).map(stage => (
                <div key={stage.key} className={styles.funnelStage}>
                  <div className={styles.funnelIcon}>{stage.icon}</div>
                  <div className={styles.funnelBar}>
                    <div className={styles.funnelFill}
                      style={{ width: `${pct(data.intent_breakdown[stage.key])}%` }} />
                  </div>
                  <div className={styles.funnelInfo}>
                    <span className={styles.funnelLabel}>{stage.label}</span>
                    <span className={styles.funnelPct}>{pct(data.intent_breakdown[stage.key])}%</span>
                    <span className={styles.funnelDesc}>{stage.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Intent Activity</h2>
            <TrendChart points={data.event_trend} />
          </div>

          <div className={styles.grid}>
            {/* Top appellations */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🍷 Top Appellations by Interest</h2>
              <p className={styles.cardSub}>Ranked by combined discovery + affinity events</p>
              <div className={styles.list}>
                {data.top_appellations.slice(0, 15).map(([name, count], i) => (
                  <div key={name} className={styles.listRow}>
                    <span className={styles.listRank}>{i + 1}</span>
                    <span className={styles.listName}>{name}</span>
                    <Spark value={count} max={maxApp} />
                  </div>
                ))}
              </div>
            </div>

            {/* Search intelligence */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🔍 Search Intelligence</h2>
              <p className={styles.cardSub}>What users are actively looking for</p>
              <div className={styles.list}>
                {data.top_searches.slice(0, 15).map(([term, count], i) => (
                  <div key={term} className={styles.listRow}>
                    <span className={styles.listRank}>{i + 1}</span>
                    <span className={styles.listName}>{term}</span>
                    <Spark value={count} max={maxSrch} />
                  </div>
                ))}
                {data.top_searches.length === 0 && (
                  <p className={styles.empty}>No search data yet — data accumulates with traffic</p>
                )}
              </div>
            </div>

            {/* Country heat */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🌍 Country Interest</h2>
              <p className={styles.cardSub}>Regional discovery distribution</p>
              <div className={styles.list}>
                {data.top_countries.map(([country, count], i) => (
                  <div key={country} className={styles.listRow}>
                    <span className={styles.listRank}>{i + 1}</span>
                    <span className={styles.listName}>{country}</span>
                    <Spark value={count} max={data.top_countries[0]?.[1] ?? 1} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz taste profiles */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>✨ Quiz Taste Profiles</h2>
              <p className={styles.cardSub}>What users discover they prefer — purchase predictor</p>
              <div className={styles.list}>
                {data.quiz_results.slice(0, 10).map(([appellation, count], i) => (
                  <div key={appellation} className={styles.listRow}>
                    <span className={styles.listRank}>{i + 1}</span>
                    <span className={styles.listName}>{appellation}</span>
                    <Spark value={count} max={data.quiz_results[0]?.[1] ?? 1} />
                  </div>
                ))}
                {data.quiz_results.length === 0 && (
                  <p className={styles.empty}>Accumulates as users complete the taste quiz</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.privacy}>
            🔒 All data is anonymous and aggregated. No personal data, IP addresses, or
            identifying information is stored. Session IDs are random and not linked across visits.
            Data retained for 90 days then purged.
          </div>
        </>
      )}

      {tab === 'messages' && (
        <main className={styles.messages}>
          <div className={styles.messagesHead}>
            <div><h2>Contact messages</h2><p>{messages.length} received · {unread} unread</p></div>
          </div>
          <div className={styles.messageList}>
            {messages.map(message => (
              <article key={message.id} className={`${styles.message} ${!message.read_at ? styles.messageUnread : ''}`}>
                <div className={styles.messageMeta}>
                  <span className={styles.reason}>{message.reason}</span>
                  <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
                </div>
                <div className={styles.messageIdentity}>
                  <strong>{message.name}</strong>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
                <p className={styles.messageBody}>{message.message}</p>
                <button className={styles.readButton} onClick={() => toggleRead(message)}>{message.read_at ? 'Mark unread' : 'Mark read'}</button>
              </article>
            ))}
            {messages.length === 0 && <p className={styles.emptyMessages}>No contact messages yet.</p>}
          </div>
        </main>
      )}
    </div>
  )
}
