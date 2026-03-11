import type { WineRegion, WineCountry, CompareItem } from '@/types'
import regionsData from '@/data/regions.json'

export const allRegions: WineRegion[] = regionsData as unknown as WineRegion[]

// Build flat list of all appellations for compare engine
export function getAllAppellations(): CompareItem[] {
  const items: CompareItem[] = []
  for (const region of allRegions) {
    for (const app of region.appellations) {
      items.push({
        id: app.id,
        label: `${app.name} (${app.type})`,
        regionId: region.id,
        regionName: region.region,
        country: region.country,
        countryCode: region.countryCode,
        grapes: app.grapes,
        tastingProfile: app.tastingProfile,
        servingTemp: app.servingTemp,
        foodPairings: app.foodPairings,
        agingPotential: app.agingPotential,
        color: app.color ?? region.color,
        type: app.type,
        description: app.description,
      })
    }
  }
  return items
}

export function buildCountries(): WineCountry[] {
  const map = new Map<string, WineCountry>()
  for (const r of allRegions) {
    if (!map.has(r.countryCode)) {
      map.set(r.countryCode, {
        code: r.countryCode,
        name: r.country,
        coordinates: r.countryCoordinates,
        regionCount: 0,
        color: r.color,
        continent: r.continent,
      })
    }
    map.get(r.countryCode)!.regionCount += r.appellations.length
  }
  return Array.from(map.values())
}

export function getRegionsByCountry(code: string): WineRegion[] {
  return allRegions.filter(r => r.countryCode === code)
}

export function getSommelierNote(a: CompareItem, b: CompareItem): string {
  const tpA = a.tastingProfile, tpB = b.tastingProfile
  const bolder = tpA.body >= tpB.body ? a : b
  const fresher = tpA.acidity >= tpB.acidity ? a : b
  const older = a.agingPotential > b.agingPotential ? a : b
  return (
    `${a.label} and ${b.label} tell different stories in the glass. ` +
    `${bolder.label} delivers the more full-bodied experience — ${bolder.tastingProfile.style.toLowerCase()}. ` +
    `${fresher.label} shows greater acidity and freshness. ` +
    `${older.label} has the longer ageing potential of the two. ` +
    `Both share ${a.grapes.filter(g => b.grapes.includes(g)).join(', ') || 'distinct variety'} — yet express their terroir in wholly different ways. ` +
    `Let the occasion decide which pours first.`
  )
}
