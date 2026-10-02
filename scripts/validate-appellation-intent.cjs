// Reuse the local TypeScript loader and catalogue checks; no network is used.
require('./validate-wine-register.cjs')
const assert = require('node:assert/strict')
const { intent } = require('../src/lib/intent.ts')
const { observeAppellation } = require('../src/lib/appellation-intent.ts')
const events = []
intent.viewAppellation = (...args) => events.push(['view', ...args])
intent.dwellAppellation = (...args) => events.push(['dwell', ...args])
global.document = new EventTarget()
global.window = new EventTarget()
document.hidden = false
const originalNow = Date.now
let now = 0
Date.now = () => now
try {
  const stop = observeAppellation('Australia', 'Yarra Valley', 'Chardonnay', 'White')
  now = 10000
  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  now = 70000
  document.hidden = false
  document.dispatchEvent(new Event('visibilitychange'))
  now = 75000
  window.dispatchEvent(new Event('pagehide'))
  stop()
  stop()
  assert.deepEqual(events, [
    ['view', 'Australia', 'Yarra Valley', 'Chardonnay', 'White'],
    ['dwell', 'Chardonnay', 'Australia', 15],
  ])
  const next = observeAppellation('Australia', 'Yarra Valley', 'Pinot Noir', 'Red')
  now = 77000
  next()
  assert.deepEqual(events.slice(2), [
    ['view', 'Australia', 'Yarra Valley', 'Pinot Noir', 'Red'],
    ['dwell', 'Pinot Noir', 'Australia', 2],
  ])
  window.dispatchEvent(new Event('pagehide'))
  assert.equal(events.length, 4, 'Teardown must remove event listeners')
  const { wineCatalogueCount, wineCatalogueCountryCount } = require('../src/lib/wine-register.ts')
  console.log(`Intent lifecycle passed; ${wineCatalogueCount} catalogue entries across ${wineCatalogueCountryCount} countries.`)
} finally {
  Date.now = originalNow
  delete global.document
  delete global.window
}
