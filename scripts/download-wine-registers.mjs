import fs from 'node:fs/promises'
import path from 'node:path'

const destination = process.argv[2]
if (!destination) throw new Error('Supply a destination for register snapshots')
const sources = JSON.parse(await fs.readFile(new URL('./wine-register-sources.json', import.meta.url), 'utf8'))
await fs.mkdir(destination, { recursive: true })
for (const [name, url] of Object.entries(sources)) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.length) throw new Error(`${name}: empty response`)
  await fs.writeFile(path.join(destination, `wwwine-${name}`), bytes)
  console.log(`${name}: ${bytes.length} bytes`)
}
