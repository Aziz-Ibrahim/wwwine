import type { WineRegion } from '@/types'
import { allRegions } from '@/lib/data'

export type SearchResultType = 'appellation' | 'region' | 'country' | 'grape'

export interface SearchResult {
  type: SearchResultType
  label: string           // what to display in the dropdown
  sublabel: string        // secondary info
  regionId?: string       // to open the panel
  countryCode?: string    // to fly to country
  query: string           // the original term matched
}

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) return []

  const results: SearchResult[] = []
  const seen = new Set<string>()

  const add = (r: SearchResult) => {
    const key = `${r.type}:${r.label}`
    if (!seen.has(key)) { seen.add(key); results.push(r) }
  }

  // Build a unique list of countries
  const countries = new Map<string, { name: string; code: string }>()
  for (const r of allRegions) {
    countries.set(r.countryCode, { name: r.country, code: r.countryCode })
  }

  // 1. Country matches
  for (const [, c] of countries) {
    if (c.name.toLowerCase().includes(q)) {
      add({ type: 'country', label: c.name, sublabel: 'Country', countryCode: c.code, query })
    }
  }

  // 2. Region matches
  for (const r of allRegions) {
    if (r.region.toLowerCase().includes(q) || r.country.toLowerCase().includes(q)) {
      add({ type: 'region', label: r.region, sublabel: `${r.country} · ${r.appellations.length} appellations`, regionId: r.id, countryCode: r.countryCode, query })
    }
  }

  // 3. Appellation matches
  for (const r of allRegions) {
    for (const a of r.appellations) {
      if (a.name.toLowerCase().includes(q) || a.id.includes(q)) {
        add({ type: 'appellation', label: a.name, sublabel: `${a.type} · ${r.region}, ${r.country}`, regionId: r.id, countryCode: r.countryCode, query })
      }
    }
  }

  // 4. Grape variety matches — search across all appellations
  for (const r of allRegions) {
    for (const a of r.appellations) {
      for (const grape of a.grapes) {
        if (grape.toLowerCase().includes(q)) {
          add({ type: 'grape', label: grape, sublabel: `Grape · found in ${a.name}, ${r.country}`, regionId: r.id, countryCode: r.countryCode, query })
        }
      }
    }
  }

  // Sort: exact matches first, then by type priority
  const typePriority: Record<SearchResultType, number> = { country: 0, region: 1, appellation: 2, grape: 3 }
  results.sort((a, b) => {
    const aExact = a.label.toLowerCase() === q ? -1 : 0
    const bExact = b.label.toLowerCase() === q ? -1 : 0
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
