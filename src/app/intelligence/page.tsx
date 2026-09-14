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

export default function IntelligencePage() {
  const [secret,  setSecret]  = useState('')
  const [hours,   setHours]   = useState(24)
  const [data,    setData]    = useState<IntentSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [authed,  setAuthed]  = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/intent?secret=${encodeURIComponent(secret)}&hours=${hours}`)
      if (res.status === 401) { setError('Invalid access key'); setLoading(false); return }
      const json = await res.json()
      setData(json)
      setAuthed(true)
    } catch {
      setError('Failed to load — try again')
    }
    setLoading(false)
  }

  useEffect(() => { if (authed) load() }, [hours]) // eslint-disable-line

  const maxApp  = data ? Math.max(...data.top_appellations.map(([, n]) => n), 1) : 1
  const maxSrch = data ? Math.max(...data.top_searches.map(([, n]) => n), 1) : 1
  const total   = data ? Object.values(data.intent_breakdown).reduce((a, b) => a + b, 0) : 0
  const pct     = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

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
          Don't have access? <a href="mailto:hello@wwwine.com">Request a demo</a>
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
          {HOURS_OPTIONS.map(o => (
            <button key={o.value}
              className={`${styles.periodBtn} ${hours === o.value ? styles.periodActive : ''}`}
              onClick={() => setHours(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </header>

      {data && (
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
    </div>
  )
}
