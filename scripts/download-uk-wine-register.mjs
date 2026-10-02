// Follow the official finder pagination; never treat its first 50 results as complete.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { parse } = require('next/dist/compiled/node-html-parser')
const directory = process.argv[2]
if (!directory) throw new Error('Supply a snapshot directory')
await fs.mkdir(directory, { recursive: true })
const pages = []
let url = 'https://www.gov.uk/protected-food-drink-names.json?register=wines&status=registered'
while (url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  const page = await response.json()
  pages.push(page)
  console.log(`UK register page ${pages.length}: ${page.total} total entries`)
  const next = parse(page.next_and_prev_links || '').querySelector('.govuk-pagination__next a')?.getAttribute('href')
  url = next ? new URL(next.replace('/protected-food-drink-names?', '/protected-food-drink-names.json?'), 'https://www.gov.uk').href : ''
  if (pages.length > 100) throw new Error('Unexpected pagination size')
}
await fs.writeFile(path.join(directory, 'wwwine-gb-pages.json'), JSON.stringify(pages))
