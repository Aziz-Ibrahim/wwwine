import data from '@/data/wine-register.json'
import { getAllAppellationDetails } from '@/lib/data'
import type { Coordinates } from '@/types'
import { normalizeWineName } from '@/lib/wine-names'

export interface RegisteredWineRegion {
  id: string
  name: string
  aliases: string[]
  countryCode: string
  country: string
  designation: string
  level: string
  area?: string
  sourceId: string
  sourceUrl: string
  coordinates?: Coordinates
  coordinateSource?: string
  registeredYear?: number
}

export const wineRegister: RegisteredWineRegion[] = data.records
export const registerSources = data.sources
export const wineRegisterCountryCount = new Set(wineRegister.map(region => region.countryCode)).size

const explicitGuideLinks: Record<string, string> = {
  'au-barossa-valley': 'barossa-valley-shiraz',
  'au-eden-valley': 'eden-valley',
  'au-mclaren-vale': 'mclaren-shiraz',
}
const guides = getAllAppellationDetails()

export function getRegisteredRegionGuides(region: RegisteredWineRegion) {
  const names = [region.name, ...region.aliases].map(normalizeWineName)
  return guides.filter(guide => guide.countryCode === region.countryCode && (
    guide.id === explicitGuideLinks[region.id] || names.includes(normalizeWineName(guide.name))
  ))
}

export interface WineBrowseEntry {
  id: string
  name: string
  aliases: string[]
  country: string
  countryCode: string
  designation: string
  level: string
  area?: string
  href: string
  hasGuide: boolean
}

export function getWineBrowseEntries(): WineBrowseEntry[] {
  const linkedGuides = new Set<string>()
  const entries: WineBrowseEntry[] = wineRegister.map(region => {
    const related = getRegisteredRegionGuides(region)
    related.forEach(guide => linkedGuides.add(guide.id))
    return { id: region.id, name: region.name, aliases: region.aliases, country: region.country, countryCode: region.countryCode, designation: region.designation, level: region.level, area: region.area, href: `/regions/${region.id}`, hasGuide: related.length > 0 }
  })
  for (const guide of guides) {
    if (linkedGuides.has(guide.id)) continue
    const country = wineRegister.find(region => region.countryCode === guide.countryCode)?.country || guide.country
    entries.push({ id: `guide-${guide.id}`, name: guide.name, aliases: [], country, countryCode: guide.countryCode, designation: guide.type, level: 'Wine guide', href: `/appellations/${guide.id}`, hasGuide: true })
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name, 'en') || a.country.localeCompare(b.country, 'en'))
}
