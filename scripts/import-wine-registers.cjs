// Import downloaded public registers. No network access; inputs are retained by the caller.
// Usage: node scripts/import-wine-registers.cjs <directory containing wwwine-* snapshots>
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { parse } = require('next/dist/compiled/node-html-parser')

const input = process.argv[2]
assert(input, 'Supply the directory containing downloaded register snapshots')
const read = name => fs.readFileSync(path.join(input, `wwwine-${name}`), 'utf8')
const clean = text => text.replace(/\s+/g, ' ').trim()
const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
const checkedAt = new Date().toISOString().slice(0, 10)
const records = []
const sources = [
  { id: 'eu', name: 'European Commission — eAmbrosia', url: 'https://webgate.ec.europa.eu/eambrosia-api/api/v1/geographical-indications', scope: 'Registered wine PDOs and PGIs in eAmbrosia. Foreign entries cover EU registration, not the complete domestic register.', checkedAt },
  { id: 'au', name: 'Wine Australia', url: 'https://www.wineaustralia.com/labelling/register-of-protected-gis-and-other-terms/geographical-indications', scope: 'Australian GIs listed in the register, including regions, subregions, zones and broader indications.', checkedAt },
  { id: 'us', name: 'US Alcohol and Tobacco Tax and Trade Bureau', url: 'https://www.ttb.gov/regulated-commodities/beverage-alcohol/wine/established-avas', scope: 'Established AVAs. State and county appellations are not included in this register.', checkedAt },
  { id: 'nz', name: 'Intellectual Property Office of New Zealand', url: 'https://www.iponz.govt.nz/get-ip/geographical-indications/register/?location=nz&sort=north-to-south', scope: 'Domestic registered wine GIs, including enduring indications; pending applications excluded.', checkedAt },
  { id: 'ge', name: 'Sakpatenti — National Intellectual Property Center of Georgia', url: 'https://www.sakpatenti.gov.ge/en/state_registry/', scope: 'Registered wine appellations in the state register. Mineral waters, cheeses, spirits and applications excluded.', checkedAt },
  { id: 'cl', name: 'Chile — Servicio Agrícola y Ganadero', url: 'https://normativa.sag.gob.cl/Publico/Normas/DetalleNorma.aspx?id=13601', scope: 'Regions, subregions, zones and areas named in Article 1 of Decreto 464, plus Secano Interior. Supplementary labels and all Secano Interior commune combinations are not separate entries.', checkedAt },
  { id: 'ar', name: 'Argentina — Instituto Nacional de Vitivinicultura', url: 'https://www.argentina.gob.ar/sites/default/files/2022/04/i.g._y_d.o.c._de_la_republica_argentina.pdf', scope: 'IGs and DOCs in the INV published list. Same-name designations in different provinces and IG/DOC registrations are kept separate.', checkedAt },
  { id: 'za', name: 'South African Wine Industry Information & Systems', url: 'https://www.sawis.co.za/cert/download/Production_areas_-_Eng_%26_Afr_-_Feb26.pdf', scope: 'Wine of Origin production areas in the February 2026 list, including geographical units, regions, subregions, districts and wards. English/Afrikaans aliases retained.', checkedAt },
]

for (const gi of JSON.parse(read('eambrosia.json'))) {
  if (gi.productType !== 'WINE' || gi.status !== 'registered' || gi.removedFlag) continue
  const names = [...gi.protectedNames, ...(gi.transcriptions || [])]
  const name = names.find(n => /^[A-Za-zÀ-ž]/.test(n)) || names[0]
  for (const code of gi.countries) {
    records.push({ id: `eu-${gi.giIdentifier.toLowerCase()}-${code.toLowerCase()}`, name, aliases: names.filter(n => n !== name), countryCode: code, country: countryNames.of(code), designation: gi.giType, level: 'Appellation', sourceId: 'eu', sourceUrl: `https://webgate.ec.europa.eu/eambrosia-api/api/v1/geographical-indications/${gi.giIdentifier}` })
  }
}
assert(records.length > 1500, 'EU import unexpectedly small')

const au = parse(read('au.html')).querySelector('table')
assert(au?.text.includes('State/Zone'), 'Australian register table changed')
const auSeen = new Set()
for (const row of au.querySelectorAll('tbody tr')) {
  const cells = row.querySelectorAll('td')
  cells.forEach((cell, column) => {
    for (const a of cell.querySelectorAll('a')) {
      const href = a.getAttribute('href') || ''
      if (!href.startsWith('/')) continue
      const name = clean(a.text).replace(/ \(Super Zone.*$/, '')
      if (!name || auSeen.has(name)) continue
      auSeen.add(name)
      const level = cells.length === 3 ? ['Zone', 'Region', 'Subregion'][column] : 'Broader GI'
      records.push({ id: `au-${slug(name)}`, name, aliases: name === 'Hunter' ? ['Hunter Valley'] : [], countryCode: 'AU', country: 'Australia', designation: 'GI', level, sourceId: 'au', sourceUrl: new URL(href, 'https://www.wineaustralia.com').href })
    }
  })
}
assert(auSeen.has('Yarra Valley') && auSeen.has('Margaret River') && auSeen.size > 90)

const us = parse(read('us.html'))
const usNames = new Set()
for (const table of us.querySelectorAll('table')) {
  if (!/Single-State AVAs|Multi-State AVAs/.test(table.text)) continue
  let state = ''
  for (const row of table.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td')
    if (cells.length === 1 && row.getAttribute('id')) state = clean(cells[0].text)
    if (cells.length !== 5) continue
    // Link targets take precedence: TTB's Long Island row displays 9.101
    // but correctly links to 9.170 (9.101 is The Hamptons).
    const section = cells[4].querySelector('a')?.getAttribute('href')?.match(/section-(9\.\d+)/)?.[1] || cells[4].text.match(/9\.\d+/)?.[0]
    if (!section) continue
    const name = clean(cells[0].text)
    assert(!usNames.has(name), `Duplicate AVA ${name}`)
    usNames.add(name)
    records.push({ id: `us-ava-${section.replace('.', '-')}`, name, aliases: [], countryCode: 'US', country: 'United States', designation: 'AVA', level: 'Appellation', area: table.text.includes('Table 2:') ? cells[1].querySelectorAll('li').map(li => clean(li.text)).join(', ') || clean(cells[1].text) : state, sourceId: 'us', sourceUrl: `https://www.ecfr.gov/current/title-27/section-${section}` })
  }
}
const expectedAVAs = Number(us.text.match(/there are\s+(\d+)\s+established AVAs/i)?.[1])
assert(expectedAVAs > 0 && usNames.size === expectedAVAs, `Expected ${expectedAVAs} AVAs, parsed ${usNames.size}`)

const nz = parse(read('nz-local.html'))
assert(!nz.querySelectorAll('a').some(a => clean(a.text) === 'Next'), 'NZ register has another page; download all pages before importing')
for (const article of nz.querySelectorAll('article.register-result-item')) {
  if (!article.querySelector('.register-status')?.text.startsWith('Registered') || (!article.querySelector('.tag-glass')?.text.includes('Wine') && !article.text.includes('Registered by statute'))) continue
  const name = clean(article.querySelector('h3').text)
  const a = article.querySelectorAll('a').find(a => a.text.includes('IP Number'))
  assert(a, `Missing source for ${name}`)
  records.push({ id: `nz-${slug(name.split(' / ')[0])}`, name: name.split(' / ')[0], aliases: name.split(' / ').slice(1), countryCode: 'NZ', country: 'New Zealand', designation: 'GI', level: /Registered by statute/.test(article.text) ? 'Broader GI' : 'Geographical indication', sourceId: 'nz', sourceUrl: new URL(a.getAttribute('href'), 'https://www.iponz.govt.nz').href })
}

// Representative map points from the largest polygon's bounding box, not
// vineyard locations or legally authoritative boundaries.
const mapSource = 'https://services6.arcgis.com/s8j6JbJJCqmhNgh7/arcgis/rest/services/Wine_Geographical_Indications_Australia/FeatureServer/1'
const features = JSON.parse(read('au-regions.geojson')).features
features.push(...JSON.parse(read('au-gippsland.geojson')).features)
assert(features.length >= 60, 'Australian map import unexpectedly small')
for (const feature of features) {
  const record = records.find(r => r.countryCode === 'AU' && slug(r.name) === slug(feature.properties.GI_NAME))
  assert(record, `Unmatched Australian map region: ${feature.properties.GI_NAME}`)
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
  const rings = polygons.map(p => p[0])
  const bounds = rings.map(ring => {
    const xs = ring.map(p => p[0]), ys = ring.map(p => p[1])
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
  }).sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0]
  record.coordinates = { lat: Number(((bounds[1] + bounds[3]) / 2).toFixed(4)), lng: Number(((bounds[0] + bounds[2]) / 2).toFixed(4)) }
  record.coordinateSource = feature.properties.GI_NAME === 'Gippsland' ? mapSource.replace(/\/1$/, '/2') : mapSource
  record.area = feature.properties.STATE
  record.registeredYear = feature.properties.YEAR_REGISTERED
  record.level = feature.properties.GI_NAME === 'Gippsland' ? 'Zone' : 'Region'
}

const ge = parse(read('ge.html')).querySelector('table')
// Registration identifiers identify wine records in the mixed-goods register.
const wineIds = new Set([1, 2, 3, 4, 5, ...Array.from({ length: 13 }, (_, i) => 787 + i), ...Array.from({ length: 13 }, (_, i) => 975 + i), 989, 990])
for (const row of ge.querySelectorAll('tr')) {
  const cells = row.querySelectorAll('td')
  if (cells.length < 5 || !wineIds.has(Number(clean(cells[2].text)))) continue
  const rawName = clean(cells[1].text).replace(/ \(wine\)$/i, '')
  const name = rawName === rawName.toUpperCase() ? rawName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : rawName
  const href = cells[4].querySelector('a')?.getAttribute('href')
  records.push({ id: `ge-ao-${clean(cells[2].text)}`, name, aliases: name === rawName ? [] : [rawName], countryCode: 'GE', country: 'Georgia', designation: 'AO', level: 'Appellation', sourceId: 'ge', sourceUrl: href ? new URL(href, 'https://www.sakpatenti.gov.ge').href : sources.find(s => s.id === 'ge').url })
}
assert.equal(records.filter(r => r.sourceId === 'ge').length, wineIds.size, 'Georgian wine records missing')

const chileText = parse(read('cl.html')).text
const article = clean(chileText.slice(chileText.indexOf('Artículo 1º'), chileText.indexOf('Artículo 2º')))
assert(article.includes('Chiloé') && article.includes('Rapa Nui'), 'Chilean source version changed')
const chileGroups = {
  Region: 'Atacama|Coquimbo|Aconcagua|Valle Central|Sur|Austral',
  Subregion: 'Valle de Copiapó|Valle del Huasco|Valle del Elqui|Valle del Limarí|Valle del Choapa|Valle del Aconcagua|Valle de Casablanca|Valle de San Antonio|Valle del Maipo|Valle del Rapel|Valle de Curicó|Valle del Maule|Valle del Itata|Valle del Biobío|Valle del Malleco|Valle del Cautín|Valle de Osorno|Chiloé',
  Zone: 'Valle de Leyda|Valle del Cachapoal|Valle de Colchagua|Valle del Teno|Valle del Lontué|Valle del Claro|Valle del Loncomilla|Valle del Tutuvén',
  Area: 'La Serena|Vicuña|Paiguano|Ovalle|Monte Patria|Punitaqui|Río Hurtado|Salamanca|Illapel|Valle del Marga-Marga|Zapallar|Panquehue|Quillota|Hijuelas|Catemu|Llaillay|San Felipe|Santa María|Calle Larga|San Esteban|Lo Abarca|Cartagena|Algarrobo|San Juan|Santo Domingo|Santiago|Pirque|Puente Alto|Buin|Isla de Maipo|Talagante|Melipilla|Alhué|María Pinto|Colina|Calera de Tango|Til Til|Lampa|Rancagua|Requínoa|Rengo|Peumo|Machalí|Coltauco|San Fernando|Chimbarongo|Nancagua|Santa Cruz|Palmilla|Peralillo|Lolol|Marchigüe|Litueche|La Estrella|Paredones|Pumanque|Los Lingues|Apalta|Rauco|Romeral|Vichuquén|Licantén|Molina|Sagrada Familia|Talca|Pencahue|San Clemente|San Rafael|Empedrado|Curepto|San Javier|Villa Alegre|Parral|Linares|Colbún|Longaví|Retiro|Cauquenes|Chillán|Quillón|Portezuelo|Coelemu|Yumbel|Mulchén|Traiguén|Rapa Nui - Isla de Pascua',
}
for (const [level, names] of Object.entries(chileGroups)) {
  for (const name of names.split('|')) {
    assert(article.toLowerCase().includes(name.toLowerCase()), `Chilean name absent from Article 1: ${name}`)
    records.push({ id: `cl-${slug(name)}`, name, aliases: name.startsWith('Valle ') ? [name.replace(/^Valle (del|de) /, '') + ' Valley'] : [], countryCode: 'CL', country: 'Chile', designation: 'DO', level, sourceId: 'cl', sourceUrl: sources.find(s => s.id === 'cl').url })
  }
}
assert(chileText.includes('Secano Interior'))
records.push({ id: 'cl-secano-interior', name: 'Secano Interior', aliases: [], countryCode: 'CL', country: 'Chile', designation: 'DO', level: 'Special designation', sourceId: 'cl', sourceUrl: sources.find(s => s.id === 'cl').url })

for (const page of JSON.parse(read('ar-tables.json'))) {
  for (const row of page.tables.flat()) {
    if (!['I.G.', 'D.O.C.'].includes(row[1])) continue
    const names = clean(row[0]).split(' o su sinónimo ')
    const area = clean(row[2])
    const designation = row[1].replaceAll('.', '')
    records.push({ id: `ar-${slug(names[0])}-${slug(area)}-${designation.toLowerCase()}`, name: names[0], aliases: names.slice(1), countryCode: 'AR', country: 'Argentina', designation, level: 'Appellation', area, sourceId: 'ar', sourceUrl: sources.find(s => s.id === 'ar').url })
  }
}
assert.equal(records.filter(r => r.sourceId === 'ar').length, 121, 'Argentina table row count changed; review the PDF')

const zaSeen = new Set()
const zaAdd = (value, level) => {
  if (!value || /^(none|geen)$/i.test(value)) return
  const names = value.split('/').map(clean)
  const format = name => name === name.toUpperCase() ? name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : name
  const name = format(names[0])
  const id = `za-${slug(name)}-${slug(level)}`
  if (zaSeen.has(id)) return
  zaSeen.add(id)
  records.push({ id, name, aliases: names.slice(1).map(format), countryCode: 'ZA', country: 'South Africa', designation: 'WO', level, sourceId: 'za', sourceUrl: sources.find(s => s.id === 'za').url })
}
zaAdd('GREATER CAPE/GROTER KAAP', 'Overarching geographical unit')
for (const name of ['WESTERN CAPE/WES-KAAP', 'NORTHERN CAPE/NOORD-KAAP', 'EASTERN CAPE/OOS-KAAP', 'KWAZULU-NATAL', 'FREE STATE/VRYSTAAT', 'LIMPOPO', 'NORTH WEST']) zaAdd(name, 'Geographical unit')
for (const page of JSON.parse(read('za-tables.json'))) {
  for (const table of page.tables) {
    for (const row of table.slice(1)) {
      row.forEach((cell, column) => {
        if (!cell) return
        // A slash followed by a line break continues a bilingual designation.
        // Citrusdal's bilingual line lacks that slash in the source table.
        const joined = cell.replace(/\/\s*\n/g, '/').replace('Citrusdal Valley\nCitrusdal Vallei', 'Citrusdal Valley/Citrusdal Vallei')
        for (const value of joined.split('\n')) zaAdd(clean(value), ['Overarching region', 'Region', 'Subregion', 'District', 'Ward'][column])
      })
    }
  }
}

const addSource = (id, name, url, scope) => sources.push({ id, name, url, scope, checkedAt })
addSource('jp', 'Japan — National Tax Agency', 'https://www.nta.go.jp/english/taxes/liquor_administration/geographical/02.htm', 'Domestic wine GIs in the NTA list. Sake, spirits and foreign indications excluded.')
for (const row of parse(read('jp.html')).querySelector('table').querySelectorAll('tr')) {
  const cells = row.querySelectorAll('td')
  if (cells.length !== 5 || clean(cells[3].text) !== 'Wine') continue
  const [, alias, name] = clean(cells[1].text).match(/^(.+?)\s*\((.+)\)$/)
  records.push({ id: `jp-${slug(name)}`, name, aliases: [alias.trim()], countryCode: 'JP', country: 'Japan', designation: 'GI', level: 'Appellation', area: clean(cells[2].text), sourceId: 'jp', sourceUrl: new URL(cells[4].querySelector('a').getAttribute('href'), 'https://www.nta.go.jp').href })
}
assert.equal(records.filter(r => r.sourceId === 'jp').length, 5)

addSource('ca-bc', 'British Columbia — Wines of Marked Quality Regulation', 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/168_2018/', 'Geographical indications established by section 56, including British Columbia and its regional subdivisions.')
const bcTable = parse(read('ca-bc.html')).querySelectorAll('table').find(t => t.text.includes('Geographical indication') && t.text.includes('Cowichan'))
for (const row of bcTable.querySelectorAll('tr')) {
  const cells = row.querySelectorAll('td')
  if (cells.length !== 3 || !/^\d/.test(clean(cells[0].text))) continue
  const [name, parent] = clean(cells[1].text).split(', a subdivision of ')
  records.push({ id: `ca-bc-${slug(name)}`, name, aliases: [], countryCode: 'CA', country: 'Canada', designation: 'GI', level: parent ? 'Subregion' : name === 'British Columbia' ? 'Provincial indication' : 'Region', area: parent ? parent.replace(/^the /, '') : 'British Columbia', sourceId: 'ca-bc', sourceUrl: sources.find(s => s.id === 'ca-bc').url + '#section56' })
}
assert.equal(records.filter(r => r.sourceId === 'ca-bc').length, 22)
addSource('ca-on', 'Ontario Wine Appellation Authority', 'https://vqaontario.ca/find-a-vqa-wine/', 'Ontario appellations listed by the regulator, including regional appellations and subappellations. This does not establish complete Canadian coverage.')
for (const option of parse(read('ca-on.html')).querySelectorAll('select#appellation option')) {
  const value = option.getAttribute('value')
  if (!value) continue
  const name = clean(option.text).replace(/^–\s*/, '').replace(/^All Ontario$/, 'Ontario')
  const level = value === '0' ? 'Provincial appellation' : value.includes('+parent') ? 'Appellation' : ['Niagara Escarpment', 'Niagara-on-the-Lake', 'West Niagara'].includes(name) ? 'Regional appellation' : 'Subappellation'
  records.push({ id: `ca-on-${slug(name)}`, name, aliases: [], countryCode: 'CA', country: 'Canada', designation: 'VQA', level, area: 'Ontario', sourceId: 'ca-on', sourceUrl: sources.find(s => s.id === 'ca-on').url })
}
assert.equal(records.filter(r => r.sourceId === 'ca-on').length, 18)

addSource('ch', 'Switzerland — Federal Office for Agriculture', 'https://www.blw.admin.ch/dam/de/sd-web/bQQd5jj01Ivw/AOC_KUB-AOC_DOC_1er%20janvier%202026.pdf', 'All 63 AOC/KUB/DOC names in the federal list of 1 January 2026. Intercantonal Vully and Zürichsee counted once; land wines and supplementary place names excluded.')
// The PDF has merged cells and overprinted counts; these columns are transcribed
// from the rendered register, then checked against its extracted text.
const swissGroups = [
  ['Cantonal appellation', '', 'Aargau|Appenzell Innerrhoden|Appenzell Ausserrhoden|Bern / Berne|Basel-Landschaft|Basel-Stadt|Genève|Glarus|Graubünden / Grigioni|Jura|Luzern|Neuchâtel|Nidwalden|Obwalden|St. Gallen|Schaffhausen|Solothurn|Schwyz|Thurgau|Ticino|Rosso del Ticino|Bianco del Ticino|Rosato del Ticino|Uri|Vaud|Valais / Wallis|Zug|Zürich'],
  ['Regional appellation', 'Bern / Berne', 'Bielersee / Lac de Bienne|Thunersee'],
  ['Regional appellation', 'Fribourg / Freiburg', 'Cheyres'],
  ['Regional appellation', 'Fribourg / Freiburg; Vaud', 'Vully'],
  ['Regional appellation', 'Schwyz; Zürich', 'Zürichsee'],
  ['Regional appellation', 'Vaud', "Chablais|Lavaux|La Côte|Côtes-de-l'Orbe|Bonvillars|Dézaley|Dézaley-Marsens|Calamin"],
  ['Local appellation', 'Genève', "Coteau de Chevrens|Côtes de Landecy|Coteau de Lully|Coteau de Choulex|Château de Collex|Coteau de Bossy|Coteau de la vigne blanche|Coteaux de Dardagny|Coteau de Genthod|Château du Crest|Mandement de Jussy|Grand Carraz|Domaine de l'Abbaye|Côtes de Russin|Coteau des Baillets|Coteau de Bourdigny|Coteau de Choully|Coteau de Peissy|Coteaux de Peney|Château de Choully|Rougemont|La Feuillée"],
]
const swissText = JSON.parse(read('ch-tables.json')).map(p => p.text).join('\n')
for (const [level, area, group] of swissGroups) {
  for (const value of group.split('|')) {
    assert(swissText.includes(value), `Swiss name missing: ${value}`)
    const [name, ...aliases] = value.split(' / ')
    records.push({ id: `ch-${slug(name)}`, name, aliases, countryCode: 'CH', country: 'Switzerland', designation: 'AOC / KUB / DOC', level, ...(area ? { area } : {}), sourceId: 'ch', sourceUrl: sources.find(s => s.id === 'ch').url })
  }
}
assert.equal(records.filter(r => r.sourceId === 'ch').length, 63)

addSource('ca-qc', 'Québec — Conseil des appellations réservées et des termes valorisants', 'https://cartv.gouv.qc.ca/appellations-et-termes-valorisants/appellations-reconnues/repertoire/', 'Recognised wine IGPs in Québec. Cider, spirits and non-wine appellations excluded.')
for (const name of ['Vin du Québec', 'Vin de glace du Québec']) {
  const link = parse(read('ca-qc.html')).querySelectorAll('a').find(a => clean(a.text) === name)
  assert(link, `Missing Québec indication: ${name}`)
  records.push({ id: `ca-qc-${slug(name)}`, name, aliases: [], countryCode: 'CA', country: 'Canada', designation: 'IGP', level: 'Appellation', area: 'Québec', sourceId: 'ca-qc', sourceUrl: link.getAttribute('href') })
}

const brazilUrls = {
  'br-ip': 'https://www.gov.br/inpi/pt-br/servicos/indicacoes-geograficas/arquivos/status-pedidos/LISTADASINDICAESDEPROCEDNCIARECONHECIDAS.At29Setembro2026.pdf',
  'br-do': 'https://www.gov.br/inpi/pt-br/servicos/indicacoes-geograficas/arquivos/status-pedidos/LISTACOMASDENOMINAESDEORIGEMRECONHECIDAS.At23Junho2026.pdf',
}
for (const [sourceId, url] of Object.entries(brazilUrls)) {
  const designation = sourceId === 'br-ip' ? 'IP' : 'DO'
  addSource(sourceId, `Brazil — INPI (${designation})`, url, 'Granted Brazilian wine and sparkling-wine indications. Foreign registrations and non-wine products excluded; separate IP and DO registrations retained.')
  for (const [pageIndex, page] of JSON.parse(read(`${sourceId}-tables.json`)).entries()) {
    for (const row of page.tables.flat()) {
      if (!row[0]?.startsWith('Número')) continue
      const lines = (row[1] || '').split('\n').map(clean)
      const countryIndex = lines.findIndex(line => /^BR\//.test(line))
      if (countryIndex < 0 || !/^(Vinho|Espumante)/i.test(lines[countryIndex + 1] || '')) continue
      const name = lines[countryIndex - 1]
      records.push({ id: `br-${slug(lines[0])}`, name, aliases: [], countryCode: 'BR', country: 'Brazil', designation, level: 'Appellation', area: lines[countryIndex].replace(/^BR\//, ''), sourceId, sourceUrl: `${url}#page=${pageIndex + 1}` })
    }
  }
  assert.equal(records.filter(r => r.sourceId === sourceId).length, designation === 'IP' ? 10 : 3)
}

addSource('gb', 'United Kingdom — Defra protected wine names', 'https://www.gov.uk/protected-food-drink-names?register=wines&status=registered', 'Additional UK-registered wine names from the United Kingdom, Albania, Serbia, Moldova, Ukraine and Liechtenstein. Existing EU records retained where names match. Foreign protection is not a complete audit of each domestic register.')
const ukCountries = { 'United Kingdom': 'GB', Albania: 'AL', Serbia: 'RS', Moldova: 'MD', Ukraine: 'UA', Liechtenstein: 'LI' }
const ukPages = JSON.parse(read('gb-pages.json'))
const ukRows = ukPages.flatMap(page => parse(page.search_results).querySelectorAll('.gem-c-document-list__item'))
assert.equal(ukRows.length, ukPages[0].total, 'UK register pagination incomplete')
assert(ukPages.every(page => page.total === ukPages[0].total), 'UK register changed during download')
const normalized = name => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
for (const row of ukRows) {
  const attributes = Object.fromEntries(row.querySelectorAll('.gem-c-document-list__attribute').map(a => {
    const text = clean(a.text), colon = text.indexOf(':')
    return [text.slice(0, colon), text.slice(colon + 1).trim()]
  }))
  const country = attributes['Country of origin'], countryCode = ukCountries[country]
  if (!countryCode) continue
  assert.equal(attributes.Status, 'Registered')
  const rawName = attributes['Registered name']
  const names = rawName.split(/\s*\/\s*/)
  // Two source transliterations begin with a Cyrillic lookalike; preserve the
  // original alias while exposing the readable Latin spelling.
  const latinNames = names.map(name => name.replace(/^К(?=[a-z])/, 'K'))
  const name = latinNames.find(n => /^[A-Za-zÀ-ž]/.test(n)) || rawName
  const aliases = [...new Set([rawName, ...names].filter(n => n !== name))]
  const designation = row.querySelector('.gem-c-document-list__item-description').text.match(/\((PDO|PGI)\)/)?.[1]
  assert(designation, `Unknown UK wine designation: ${rawName}`)
  if (records.some(r => r.countryCode === countryCode && r.designation === designation && [r.name, ...r.aliases].some(n => [name, ...aliases].some(other => normalized(n) === normalized(other))))) continue
  const href = row.querySelector('.gem-c-document-list__item-title a').getAttribute('href')
  records.push({ id: `gb-${href.split('/').at(-1)}`, name, aliases, countryCode, country, designation, level: 'Appellation', sourceId: 'gb', sourceUrl: new URL(href, 'https://www.gov.uk').href })
}

addSource('me', 'Council of the European Union — Montenegro accession document', 'https://data.consilium.europa.eu/doc/document/AD-22-2025-INIT/en/pdf#page=18', 'Thirteen names confirmed as already protected nationally in Montenegro in the December 2025 accession document. This is not a claim of completed EU registration.')
const montenegroText = clean(JSON.parse(read('me-tables.json'))[17].text)
assert(montenegroText.includes('already protected in Montenegro'))
for (const match of montenegroText.matchAll(/(PDO|PGI) “([^”]+)”/g)) {
  const [, designation, name] = match
  records.push({ id: `me-${slug(name)}`, name, aliases: [], countryCode: 'ME', country: 'Montenegro', designation, level: 'Appellation', sourceId: 'me', sourceUrl: sources.find(s => s.id === 'me').url })
}
assert.equal(records.filter(r => r.sourceId === 'me').length, 13)
addSource('in', 'India — Geographical Indications Registry', 'https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/123', 'Nashik Valley Wine, registered GI 123. This individual record is not a complete audit of all Indian wine-producing areas.')
const indiaRows = parse(read('in.html')).querySelectorAll('tr').map(row => clean(row.text))
assert(indiaRows.includes('Status Registered') && indiaRows.includes('Geographical Indications Nashik Valley Wine'))
records.push({ id: 'in-gi-123', name: 'Nashik Valley Wine', aliases: [], countryCode: 'IN', country: 'India', designation: 'GI', level: 'Appellation', area: 'Maharashtra', sourceId: 'in', sourceUrl: sources.find(s => s.id === 'in').url })

// Prefer the domestic record when the same designation is also registered in
// the EU. Brazil's IP remains separate from its DO/PDO registration.
const filtered = records.filter(r => !(r.sourceId === 'eu' && (
  (r.countryCode === 'US' && usNames.has(r.name)) ||
  (r.countryCode === 'BR' && r.designation === 'PDO' && records.some(local => local.sourceId === 'br-do' && local.name === r.name))
)))
assert.equal(new Set(filtered.map(r => r.id)).size, filtered.length, `Duplicate record IDs: ${filtered.filter((r, i) => filtered.findIndex(x => x.id === r.id) !== i).map(r => r.id + ' ' + r.name).join(', ')}`)
filtered.sort((a, b) => a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id))
const sourceFiles = { eu: 'eambrosia.json', au: 'au.html', us: 'us.html', nz: 'nz-local.html', ge: 'ge.html', cl: 'cl.html', ar: 'ar.pdf', za: 'za.pdf', jp: 'jp.html', 'ca-bc': 'ca-bc.html', 'ca-on': 'ca-on.html', 'ca-qc': 'ca-qc.html', ch: 'ch.pdf', 'br-ip': 'br-ip.pdf', 'br-do': 'br-do.pdf', gb: 'gb-pages.json', me: 'me.pdf', in: 'in.html' }
for (const source of sources) {
  source.recordCount = filtered.filter(r => r.sourceId === source.id).length
  const snapshot = path.join(input, `wwwine-${sourceFiles[source.id]}`)
  source.checkedAt = fs.statSync(snapshot).mtime.toISOString().slice(0, 10)
  source.snapshotSha256 = crypto.createHash('sha256').update(fs.readFileSync(snapshot)).digest('hex')
}
fs.writeFileSync('src/data/wine-register.json', JSON.stringify({ sources, records: filtered }, null, 2) + '\n')
console.log(JSON.stringify({ total: filtered.length, sources: sources.map(s => [s.id, s.recordCount]) }))
