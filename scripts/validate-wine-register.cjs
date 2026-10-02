const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const { records, sources } = require('../src/data/wine-register.json')

assert.equal(new Set(records.map(r => r.id)).size, records.length)
for (const source of sources) {
  assert.equal(records.filter(r => r.sourceId === source.id).length, source.recordCount)
  assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/)
}
for (const r of records) {
  assert(r.name.trim() && /^[a-z0-9-]+$/.test(r.id), `Invalid entry ${r.id}`)
  assert(sources.some(s => s.id === r.sourceId), `Unknown source ${r.id}`)
  assert(['https:', 'http:'].includes(new URL(r.sourceUrl).protocol))
  assert(!/^(None|Geen)$/i.test(r.name), `Placeholder imported: ${r.id}`)
  if (r.coordinates) {
    assert(r.coordinateSource, `Missing coordinate provenance ${r.id}`)
    assert(Number.isFinite(r.coordinates.lat) && Math.abs(r.coordinates.lat) <= 90)
    assert(Number.isFinite(r.coordinates.lng) && Math.abs(r.coordinates.lng) <= 180)
  }
}
assert.equal(records.filter(r => r.sourceId === 'us').length, 280)
assert.equal(records.filter(r => r.countryCode === 'AU' && r.coordinates).length, 65)
assert.equal(records.filter(r => r.sourceId === 'nz').length, 22)
assert.equal(records.filter(r => r.sourceId === 'ar').length, 121)
assert.equal(records.filter(r => r.sourceId === 'za').length, 150)
for (const [source, count] of Object.entries({ jp: 5, 'ca-bc': 22, 'ca-on': 18, 'ca-qc': 2, ch: 63, 'br-ip': 10, 'br-do': 3, me: 13 })) {
  assert.equal(records.filter(r => r.sourceId === source).length, count, `Unexpected ${source} coverage`)
}
assert.equal(records.filter(r => r.countryCode === 'BR' && r.name === 'Vale dos Vinhedos').length, 2)
assert.equal(records.find(r => r.name === 'Vales da Uva Goethe')?.designation, 'DO')
assert(records.some(r => r.name === 'Sussex' && r.countryCode === 'GB'))
assert(!records.some(r => r.countryCode === 'JP' && /sake|Nihonshu|Ryukyu/i.test(r.name)))
assert(!records.some(r => r.countryCode === 'GE' && /Borjomi|Chacha|Sulguni|Narchvi/i.test(r.name)))
assert.equal(records.find(r => r.name === 'Long Island' && r.countryCode === 'US').sourceUrl, 'https://www.ecfr.gov/current/title-27/section-9.170')
assert.equal(records.filter(r => r.countryCode === 'AR' && r.name === 'San Carlos').length, 2)

// Exercise the application's real search and linking functions without an
// additional test-runner dependency. This hook is scoped to this process.
const resolve = Module._resolveFilename
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args)
}
require.extensions['.ts'] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } })
  module._compile(compiled.outputText, filename)
}
const { search } = require('../src/lib/search.ts')
const { getWineBrowseEntries, getRegisteredRegionGuides, getRegisterGuideCoverage, wineRegister, consolidatedRegions } = require('../src/lib/wine-register.ts')
for (const name of ['Yarra Valley', 'Coonawarra', 'Clare Valley', 'Margaret River']) {
  const result = search(name).find(r => r.label === name && r.countryCode === 'AU')
  assert(result?.href?.startsWith('/regions/au-'), `Missing search destination: ${name}`)
  assert(records.find(r => `/regions/${r.id}` === result.href)?.coordinates, `Missing map point: ${name}`)
}
assert(search('Bannockburn').some(r => r.href === '/regions/nz-central-otago'))
assert(search('Dundee Hills').some(r => r.href === '/regions/us-ava-9-90'))
assert(search('Yarra Valley').length <= 12)
const entries = getWineBrowseEntries()
assert.equal(new Set(entries.map(e => e.id)).size, entries.length)
for (const entry of entries) {
  assert(entry.hasGuide, `Placeholder catalogue entry: ${entry.id}`)
  if (entry.href.startsWith('/regions/')) assert(wineRegister.some(region => entry.href === `/regions/${region.id}` && getRegisteredRegionGuides(region).length))
}
for (const [id, destination] of Object.entries(consolidatedRegions)) {
  assert(!wineRegister.some(region => region.id === id))
  const parent = wineRegister.find(region => region.id === destination)
  assert(parent, `Missing consolidation destination: ${destination}`)
  const child = records.find(region => region.id === id)
  assert.deepEqual(getRegisteredRegionGuides(child).map(wine => wine.id).sort(), getRegisteredRegionGuides(parent).map(wine => wine.id).sort())
}
assert(entries.some(e => e.name === 'Sancerre' && e.hasGuide))
const coonawarra = records.find(region => region.id === 'au-coonawarra')
const coonawarraGuides = getRegisteredRegionGuides(coonawarra)
assert.deepEqual(coonawarraGuides.map(guide => guide.id).sort(), ['coonawarra-cabernet-sauvignon', 'coonawarra-chardonnay', 'coonawarra-shiraz'])
for (const guide of coonawarraGuides) {
  assert(guide.sources?.length, `Missing source provenance: ${guide.id}`)
  for (const source of guide.sources) assert(['https:', 'http:'].includes(new URL(source.url).protocol))
  assert(fs.existsSync(path.join('public', guide.image.replace(/^\//, ''))), `Missing image: ${guide.id}`)
}
const coverage = getRegisterGuideCoverage()
const { getAllAppellations, getAllAppellationDetails } = require('../src/lib/data.ts')
const profiles = require('../src/data/regional-wine-profiles.json')
const details = getAllAppellationDetails()
for (const wine of details) {
  assert(wine.description && wine.grapes.length && wine.foodPairings.length && wine.tastingProfile.fruits.length, `Incomplete guide: ${wine.id}`)
  assert(fs.existsSync(path.join('public', wine.image.replace(/^\//, ''))), `Missing image: ${wine.id}`)
  assert(entries.some(entry => entry.href === `/appellations/${wine.id}` || wineRegister.some(region => entry.id === region.id && getRegisteredRegionGuides(region).some(guide => guide.id === wine.id))), `Unreachable guide: ${wine.id}`)
}
assert.equal(new Set(details.map(wine => wine.id)).size, details.length, 'Duplicate wine guide IDs')
for (const [regionId, profile] of Object.entries(profiles)) {
  const record = records.find(region => region.id === regionId)
  const linked = getRegisteredRegionGuides(record)
  for (const wine of profile.wines) {
    assert(linked.some(guide => guide.id === wine.id), `Unlinked regional wine: ${wine.id}`)
    assert(getAllAppellations().some(guide => guide.id === wine.id), `Missing from compare/food matching: ${wine.id}`)
    assert(fs.existsSync(path.join('public', wine.image.replace(/^\//, ''))), `Missing colour photo: ${wine.id}`)
    assert(wine.foodPairings.length && wine.tastingProfile.fruits.length && wine.sources.length, `Incomplete profile: ${wine.id}`)
    for (const key of ['body', 'tannins', 'acidity', 'sweetness', 'alcohol']) assert(wine.tastingProfile[key] >= 1 && wine.tastingProfile[key] <= 5)
  }
}
assert(!getRegisteredRegionGuides(records.find(r => r.id === 'us-ava-9-23')).some(wine => wine.id === 'santa-barbara'), 'Santa Barbara must not inherit the Napa GI')
console.log(`Validated ${records.length} registered designations and ${entries.length} browse entries. ${coverage.linkedIds.length} designations link to curated guides; ${coverage.unlinked.length} still need guide coverage.`)
