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
const { getWineBrowseEntries } = require('../src/lib/wine-register.ts')
for (const name of ['Yarra Valley', 'Coonawarra', 'Clare Valley', 'Margaret River']) {
  const result = search(name).find(r => r.label === name && r.countryCode === 'AU')
  assert(result?.href?.startsWith('/regions/au-'), `Missing search destination: ${name}`)
  assert(records.find(r => `/regions/${r.id}` === result.href)?.coordinates, `Missing map point: ${name}`)
}
assert(search('Hawkes Bay').some(r => r.countryCode === 'NZ'))
assert(search('Valle de Cafayate').some(r => r.countryCode === 'AR'))
const sanCarlos = search('San Carlos').filter(r => r.countryCode === 'AR' && r.label === 'San Carlos')
assert.equal(sanCarlos.length, 2)
assert.notEqual(sanCarlos[0].sublabel, sanCarlos[1].sublabel)
assert(search('北海道').some(r => r.label === 'Hokkaido'))
assert(search('Yarra Valley').length <= 12)
const entries = getWineBrowseEntries()
assert.equal(new Set(entries.map(e => e.id)).size, entries.length)
for (const entry of entries) assert(entry.href.startsWith('/regions/') || entry.href.startsWith('/appellations/'))
assert(entries.some(e => e.name === 'Sancerre' && e.hasGuide))
console.log(`Validated ${records.length} registered designations, ${entries.length} browse entries, map coordinates, aliases and search destinations.`)
