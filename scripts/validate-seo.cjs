// Reuse the dependency-free TypeScript loader and existing catalogue checks.
require('./validate-wine-register.cjs')
const assert = require('node:assert/strict')
const { getAllAppellationDetails } = require('../src/lib/data.ts')
const { wineRegister, consolidatedRegions, getWineBrowseEntries } = require('../src/lib/wine-register.ts')
const sitemap = require('../src/app/sitemap.ts').default()
const robots = require('../src/app/robots.ts').default()
const origin = 'https://wwwine.co.uk'
const urls = new Set(sitemap.map(entry => entry.url))
assert.equal(urls.size, sitemap.length, 'Duplicate sitemap URLs')
assert.equal(robots.sitemap, `${origin}/sitemap.xml`)
for (const entry of sitemap) {
  assert.equal(new URL(entry.url).origin, origin)
  assert.equal(entry.lastModified, undefined, 'Do not invent modification dates')
}
for (const guide of getAllAppellationDetails()) assert(urls.has(`${origin}/appellations/${guide.id}`))
for (const region of wineRegister) assert(urls.has(`${origin}/regions/${region.id}`))
for (const entry of getWineBrowseEntries()) assert(urls.has(`${origin}${entry.href}`))
for (const [id, target] of Object.entries(consolidatedRegions)) {
  assert(!urls.has(`${origin}/regions/${id}`))
  assert(urls.has(`${origin}/regions/${target}`))
  assert(!consolidatedRegions[target], 'Redirect chain')
}
assert(urls.has(`${origin}/appellations/yarra-valley-shiraz`))
assert(urls.has(`${origin}/regions/us-ava-9-128`))
console.log(`SEO catalogue checks passed: ${urls.size} canonical URLs`)
const redirectConfig = require('../next.config.js').redirects()
redirectConfig.then(rules => {
  assert.deepEqual(rules, Object.entries(consolidatedRegions).map(([id, target]) => ({ source: `/regions/${id}`, destination: `/regions/${target}`, permanent: true })))
}).catch(error => { console.error(error); process.exitCode = 1 })

// Pass a locally running production server to verify real status and initial HTML.
const base = process.argv[2]
if (base) (async () => {
  const sitemapResponse = await fetch(`${base}/sitemap.xml`, { redirect: 'manual' })
  assert.equal(sitemapResponse.status, 200)
  const xml = await sitemapResponse.text()
  assert(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'))
  assert.equal((xml.match(/<loc>/g) || []).length, urls.size)
  for (const url of urls) assert(xml.includes(`<loc>${url}</loc>`))
  const robotsResponse = await fetch(`${base}/robots.txt`)
  assert.equal(robotsResponse.status, 200)
  assert((await robotsResponse.text()).includes(`Sitemap: ${origin}/sitemap.xml`))
  for (const url of urls) {
    const pathname = new URL(url).pathname
    const response = await fetch(`${base}${pathname}`, { redirect: 'manual' })
    assert.equal(response.status, 200, pathname)
    const html = await response.text()
    assert(html.includes(`<link rel="canonical" href="${url}"`), `Canonical: ${pathname}`)
    assert(!/<meta name="robots" content="[^"]*noindex/.test(html), `Indexability: ${pathname}`)
    assert(/<h1[ >]/.test(html), `Initial HTML heading: ${pathname}`)
    if (pathname.startsWith('/appellations/')) {
      const guide = getAllAppellationDetails().find(item => pathname === `/appellations/${item.id}`)
      assert(html.includes('Food Pairings') || html.includes('Food pairings'), `Initial guide content: ${pathname}`)
      assert(html.includes(guide.name.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')), `Guide name: ${pathname}`)
    }
    for (const match of html.matchAll(/href="(\/(?:appellations|regions)\/[^"?#]+)"/g)) {
      assert(urls.has(`${origin}${match[1]}`), `Invalid internal link: ${match[1]}`)
    }
  }
  for (const [id, target] of Object.entries(consolidatedRegions)) {
    const response = await fetch(`${base}/regions/${id}`, { redirect: 'manual' })
    assert.equal(response.status, 308)
    assert.equal(response.headers.get('location'), `/regions/${target}`)
  }
  for (const pathname of ['/appellations/not-a-real-guide', '/regions/not-a-real-region']) {
    assert.equal((await fetch(`${base}${pathname}`, { redirect: 'manual' })).status, 404, pathname)
  }
  const caseVariant = await fetch(`${base}/appellations/YARRA-VALLEY-SHIRAZ`, { redirect: 'manual' })
  if (process.platform === 'win32' && caseVariant.status === 200) {
    // NTFS serves the generated lowercase static file for uppercase requests.
    assert((await caseVariant.text()).includes(`<link rel="canonical" href="${origin}/appellations/yarra-valley-shiraz"`))
    console.log('Windows case variant returns 200 with lowercase canonical; verify case behavior on deployment')
  } else assert.equal(caseVariant.status, 404)
  const slash = await fetch(`${base}/appellations/yarra-valley-shiraz/`, { redirect: 'manual' })
  assert.equal(slash.status, 308)
  assert.equal(slash.headers.get('location'), '/appellations/yarra-valley-shiraz')
  for (const pathname of ['/?view=food', '/appellations?country=AU']) {
    const response = await fetch(`${base}${pathname}`)
    assert.equal(response.status, 200)
    const canonical = pathname.startsWith('/?') ? origin : `${origin}/appellations`
    assert((await response.text()).includes(`<link rel="canonical" href="${canonical}"`))
  }
  const placeholder = await fetch(`${base}/coming-soon?section=journal`)
  assert.equal(placeholder.status, 200)
  assert(/<meta name="robots" content="[^"]*noindex/.test(await placeholder.text()))
  console.log('Production HTTP checks passed: sitemap, canonicals, content, links, redirects, 404s and query variants')
})().catch(error => { console.error(error); process.exitCode = 1 })
