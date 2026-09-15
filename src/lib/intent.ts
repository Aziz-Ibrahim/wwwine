/**
 * wwwine Intent Engine
 * 
 * Captures anonymous behavioural signals — NO personal data, NO fingerprinting.
 * Session ID is generated fresh each visit (not persisted to localStorage).
 * All events are aggregated server-side; raw events are never sold.
 * 
 * Intent taxonomy:
 *   DISCOVERY  — browsing, exploring, searching
 *   AFFINITY   — repeated views, compare actions, quiz completion
 *   PURCHASE   — affiliate clicks, "find this wine" actions
 *   LEARNING   — food pairing lookups, reading time signals
 */

export type IntentCategory = 'DISCOVERY' | 'AFFINITY' | 'PURCHASE' | 'LEARNING'

export interface IntentEvent {
  // Session context (no PII)
  sessionId:   string           // random UUID, not persisted
  timestamp:   number
  timezone:    string           // e.g. "Europe/London" — regional signal
  
  // Event
  category:    IntentCategory
  action:      string           // e.g. "view_appellation", "run_quiz", "food_search"
  
  // Wine taxonomy (the valuable part)
  country?:    string
  region?:     string
  appellation?: string
  grape?:       string
  style?:       string           // "full-bodied red", "bone-dry white", etc.
  
  // Context
  searchQuery?: string           // what they typed — intent signal gold
  foodQuery?:   string
  quizResult?:  string           // top matched appellation ID
  priceSignal?: 'entry' | 'mid' | 'premium' | 'luxury'  // inferred from browsing
  
  // Engagement depth
  dwellBucket?: 'glance' | 'read' | 'study'  // <5s, 5–30s, 30s+
}

// ── Session management ───────────────────────────────────────────
let _sessionId: string | null = null
const CONSENT_KEY = 'wwwine-cookie-consent'

function hasAnalyticsConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'accepted'
  } catch {
    return false
  }
}

function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = typeof crypto !== 'undefined'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }
  return _sessionId
}

function getTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'unknown' }
}

// ── Fire and forget — non-blocking ──────────────────────────────
export async function trackIntent(event: Omit<IntentEvent, 'sessionId' | 'timestamp' | 'timezone'>): Promise<void> {
  if (typeof window === 'undefined') return   // SSR guard
  if (!hasAnalyticsConsent()) return

  const payload: IntentEvent = {
    sessionId:  getSessionId(),
    timestamp:  Date.now(),
    timezone:   getTimezone(),
    ...event,
  }

  // Use sendBeacon where available so events survive page navigation
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/intent', body)
  } else {
    fetch('/api/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})   // silent — never interrupt the user
  }
}

// ── Convenience helpers ──────────────────────────────────────────
export const intent = {
  viewCountry: (country: string) =>
    trackIntent({ category: 'DISCOVERY', action: 'view_country', country }),

  viewRegion: (country: string, region: string) =>
    trackIntent({ category: 'DISCOVERY', action: 'view_region', country, region }),

  viewAppellation: (country: string, region: string, appellation: string, style?: string) =>
    trackIntent({ category: 'AFFINITY', action: 'view_appellation', country, region, appellation, style }),

  search: (query: string, resultType: string, matched: boolean) =>
    trackIntent({ category: 'DISCOVERY', action: 'search', searchQuery: query,
      appellation: matched ? resultType : undefined }),

  foodSearch: (query: string, topMatchAppellation?: string) =>
    trackIntent({ category: 'LEARNING', action: 'food_search', foodQuery: query,
      appellation: topMatchAppellation }),

  quizComplete: (topMatch: string, country: string, region: string, style: string) =>
    trackIntent({ category: 'AFFINITY', action: 'quiz_complete', appellation: topMatch,
      country, region, style, quizResult: topMatch }),

  compare: (appellationA: string, appellationB: string) => {
    trackIntent({ category: 'AFFINITY', action: 'compare', appellation: appellationA })
    trackIntent({ category: 'AFFINITY', action: 'compare', appellation: appellationB })
  },

  affiliateClick: (appellation: string, country: string, merchant: string) =>
    trackIntent({ category: 'PURCHASE', action: 'affiliate_click', appellation, country,
      searchQuery: merchant }),

  dwellAppellation: (appellation: string, country: string, seconds: number) =>
    trackIntent({ category: 'AFFINITY', action: 'dwell', appellation, country,
      dwellBucket: seconds < 5 ? 'glance' : seconds < 30 ? 'read' : 'study' }),
}
