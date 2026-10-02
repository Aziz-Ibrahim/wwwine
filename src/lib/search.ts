import type { WineRegion } from '@/types'
import { allRegions } from '@/lib/data'
import { wineRegister } from '@/lib/wine-register'
import { normalizeWineName } from '@/lib/wine-names'

export type SearchResultType = 'appellation' | 'region' | 'country' | 'grape'

export interface SearchResult {
  type: SearchResultType
  label: string           // what to display in the dropdown
  sublabel: string        // secondary info
  regionId?: string       // to open the panel
  countryCode?: string    // to fly to country
  query: string           // the original term matched
  href?: string          // destination for a published catalogue entry
}

export function search(query: string): SearchResult[] {
  const q = normalizeWineName(query)
  if (!q || q.length < 2) return []

  const results: SearchResult[] = []
  const seen = new Set<string>()

  const add = (r: SearchResult) => {
    const key = `${r.type}:${r.countryCode}:${r.label}:${r.href || ''}`
    if (!seen.has(key)) { seen.add(key); results.push(r) }
  }

  // Build a unique list of countries
  const countries = new Map<string, { name: string; code: string }>()
  for (const r of allRegions) {
    countries.set(r.countryCode, { name: r.country, code: r.countryCode })
  }
  for (const r of wineRegister) {
    countries.set(r.countryCode, { name: r.country, code: r.countryCode })
  }

  // 1. Country matches
  for (const [, c] of countries) {
    if (normalizeWineName(c.name).includes(q) || normalizeWineName(c.code) === q || allRegions.some(r => r.countryCode === c.code && normalizeWineName(r.country).includes(q))) {
      add({ type: 'country', label: c.name, sublabel: 'Browse regions and appellations', countryCode: c.code, query, href: `/appellations?country=${c.code}` })
    }
  }

  // Published catalogue names and consolidated aliases resolve to wine guides.
  for (const r of wineRegister) {
    if ([r.name, ...r.aliases].some(name => normalizeWineName(name).includes(q))) {
      add({ type: 'region', label: r.name, sublabel: `${r.designation} · ${r.area ? `${r.area}, ` : ''}${r.country}`, countryCode: r.countryCode, query, href: `/regions/${r.id}` })
    }
  }

  // 2. Region matches
  for (const r of allRegions) {
    if (normalizeWineName(r.region).includes(q) || normalizeWineName(r.country).includes(q)) {
      add({ type: 'region', label: r.region, sublabel: `${r.country} · ${r.appellations.length} appellations`, regionId: r.id, countryCode: r.countryCode, query })
    }
  }

  // 3. Appellation matches
  for (const r of allRegions) {
    for (const a of r.appellations) {
      if (normalizeWineName(a.name).includes(q) || a.id.includes(q)) {
        add({ type: 'appellation', label: a.name, sublabel: `${a.type} · ${r.region}, ${r.country}`, regionId: r.id, countryCode: r.countryCode, query })
      }
    }
  }

  // 4. Grape variety matches — search across all appellations
  for (const r of allRegions) {
    for (const a of r.appellations) {
      for (const grape of a.grapes) {
        if (normalizeWineName(grape).includes(q)) {
          add({ type: 'grape', label: grape, sublabel: `Grape · found in ${a.name}, ${r.country}`, regionId: r.id, countryCode: r.countryCode, query })
        }
      }
    }
  }

  // Sort: exact matches first, then by type priority
  const typePriority: Record<SearchResultType, number> = { country: 0, region: 1, appellation: 2, grape: 3 }
  results.sort((a, b) => {
    const aExact = normalizeWineName(a.label) === q ? -1 : 0
    const bExact = normalizeWineName(b.label) === q ? -1 : 0
    if (aExact !== bExact) return aExact - bExact
    return typePriority[a.type] - typePriority[b.type]
  })

  return results.slice(0, 12)
}

// Given a search result, find what regions to show
export function resolveRegions(result: SearchResult): WineRegion[] {
  if (result.regionId) {
    const r = allRegions.find(r => r.id === result.regionId)
    return r ? [r] : []
  }
  if (result.countryCode) {
    return allRegions.filter(r => r.countryCode === result.countryCode)
  }
  return []
}
