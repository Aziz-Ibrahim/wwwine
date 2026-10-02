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

// Imported records remain an archive; only entries with guides are published.
const registerRecords: RegisteredWineRegion[] = data.records

const explicitGuideLinks: Record<string, string[]> = {
  'au-barossa-valley': ['barossa-valley-shiraz'],
  'au-eden-valley': ['eden-valley'],
  'au-mclaren-vale': ['mclaren-shiraz'],
  'au-coonawarra': ['coonawarra-chardonnay', 'coonawarra-cabernet-sauvignon'],
  'nz-marlborough': ['wairau-valley', 'awatere-valley'],
  'nz-central-otago': ['bannockburn'],
  'nz-bannockburn': ['bannockburn'],
  'jp-yamanashi': ['koshu'],
  'jp-nagano': ['nagano-wine'],
  'ca-bc-okanagan-valley': ['okanagan-riesling'],
  'za-elgin-district': ['elgin-pinot'],
  'za-stellenbosch-district': ['helderberg', 'simonsberg'],
  'za-swartland-district': ['swartland-chenin'],
  'cl-valle-de-casablanca': ['casablanca-chard'],
  'cl-valle-de-colchagua': ['carmenere'],
  'us-ava-9-23': ['rutherford', 'oakville', 'stags-leap'],
  'us-ava-9-90': ['dundee-hills'],
  'us-ava-9-180': ['dundee-hills'],
  'us-ava-9-91': ['walla-walla-cab'],
  'us-ava-9-128': ['seneca-lake-riesling'],
  'us-ava-9-116': ['sonoma-pinot'],
  'eu-eugi00000003801-at': ['spitz-gruner'],
}
const guides = getAllAppellationDetails()

export function getRegisteredRegionGuides(region: RegisteredWineRegion) {
  const names = [region.name, ...region.aliases].map(normalizeWineName)
  const explicitGuideIds = new Set(explicitGuideLinks[region.id] ?? [])
  return guides.filter(guide => guide.countryCode === region.countryCode && (
    guide.registeredRegionIds?.includes(region.id) || explicitGuideIds.has(guide.id) || names.includes(normalizeWineName(guide.name))
  ))
}

export const consolidatedRegions: Record<string, string> = {
  'nz-bannockburn': 'nz-central-otago',
  'us-ava-9-180': 'us-ava-9-90',
  'ar-lujan-de-cuyo-mendoza-ig': 'ar-lujan-de-cuyo-mendoza-doc',
}

export const wineRegister = registerRecords
  .filter(region => !consolidatedRegions[region.id] && getRegisteredRegionGuides(region).length > 0)
  .map(region => ({
    ...region,
    aliases: Array.from(new Set([
      ...region.aliases,
      ...registerRecords.filter(record => consolidatedRegions[record.id] === region.id)
        .flatMap(record => [record.name, ...record.aliases]),
    ])),
  }))

export function getRegisterGuideCoverage() {
  const linkedIds = new Set<string>()
  const unlinked = registerRecords.filter(region => {
    const linked = getRegisteredRegionGuides(region).length > 0
    if (linked) linkedIds.add(region.id)
    return !linked
  })
  return { linkedIds: Array.from(linkedIds), unlinked }
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

const browseEntries = getWineBrowseEntries()
export const wineCatalogueCount = browseEntries.length
export const wineCatalogueCountryCount = new Set(browseEntries.map(entry => entry.countryCode)).size
