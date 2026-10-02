import type { Appellation, WineRegion, WineCountry, CompareItem, Deity } from '@/types'
import regionsData from '@/data/regions.json'
import regionalProfiles from '@/data/regional-wine-profiles.json'
import registerData from '@/data/wine-register.json'
import regionOverviews from '@/data/region-overviews.json'

// Editorial profiles extend the atlas without overwriting existing wine guides.
const expandedRegions = (regionsData as unknown as WineRegion[]).map(region => ({ ...region, appellations: [...region.appellations] }))
for (const [registerId, profile] of Object.entries(regionalProfiles)) {
  const record = registerData.records.find(region => region.id === registerId)
  if (!record?.coordinates) throw new Error(`Missing mapped region for wine profiles: ${registerId}`)
  const overview = regionOverviews[registerId as keyof typeof regionOverviews]
  const additions = profile.wines.map(wine => ({ ...wine, type: record.designation, coordinates: record.coordinates, climate: profile.climate, soilTypes: profile.soilTypes, registeredRegionIds: [registerId] })) as WineRegion['appellations']
  const existing = expandedRegions.find(region => region.id === profile.regionId)
  if (existing) existing.appellations.push(...additions.filter(wine => !existing.appellations.some(current => current.id === wine.id)))
  else expandedRegions.push({ id: profile.regionId, region: record.name, country: record.country, countryCode: record.countryCode, continent: 'Oceania', coordinates: record.coordinates, countryCoordinates: { lat: -25, lng: 133 }, color: additions[0].color || '#7B1E24', vintage: profile.history, description: overview.description, mythology: [], appellations: additions })
}
export const allRegions: WineRegion[] = expandedRegions

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
        image: app.image,
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

// ── SEO static pages ─────────────────────────────────────────────

export interface AppellationWithRegion extends Appellation {
  regionId:          string
  regionName:        string
  country:           string
  countryCode:       string
  continent:         string
  regionColor:       string
  regionDescription: string
  regionVintage:     string
  regionMythology:   Deity[]
}

export function getAllAppellationDetails(): AppellationWithRegion[] {
  return allRegions.flatMap(region =>
    region.appellations.map(app => withAppellationRegion(app, region))
  )
}

export function withAppellationRegion(app: Appellation, region: WineRegion): AppellationWithRegion {
  return {
    ...app,
    regionId:          region.id,
    regionName:        region.region,
    country:           region.country,
    countryCode:       region.countryCode,
    continent:         region.continent,
    regionColor:       region.color,
    regionDescription: region.description,
    regionVintage:     region.vintage ?? '',
    regionMythology:   region.mythology ?? [],
  }
}

export function getAppellationById(id: string): AppellationWithRegion | undefined {
  return getAllAppellationDetails().find(app => app.id === id)
}
