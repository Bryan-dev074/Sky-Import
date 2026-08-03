import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeProductCredits } from './lib/product-credits.mjs'
import { assertPinnedSourceEntry, syncProductSource } from './lib/product-source-sync.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST_PATH = join(ROOT, 'public', 'products', 'manifest.json')
const SOURCE_ROOT = join(ROOT, 'artifacts', 'product-sources')

function readArguments(args) {
  const slugs = []
  let writeCredits = false
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--write-credits') {
      if (writeCredits) throw new Error('No repita --write-credits.')
      writeCredits = true
      continue
    }
    if (argument === '--slug') {
      const slug = args[index + 1]
      if (!slug || slug.startsWith('--')) throw new Error('--slug requiere un valor.')
      slugs.push(slug)
      index += 1
      continue
    }
    throw new Error('Uso: node scripts/sync-product-images.mjs [--slug <slug>] [--write-credits]')
  }
  return { slugs, writeCredits }
}

async function mapLimit(values, limit, worker) {
  const results = new Array(values.length)
  let next = 0

  async function run() {
    while (next < values.length) {
      const index = next
      next += 1
      results[index] = await worker(values[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run))
  return results
}

const { slugs, writeCredits } = readArguments(process.argv.slice(2))
const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
const requested = new Set(slugs)
const selected = requested.size > 0 ? manifest.filter((entry) => requested.has(entry.slug)) : manifest
const missing = [...requested].filter((slug) => !selected.some((entry) => entry.slug === slug))
if (missing.length > 0) throw new Error(`Slugs ausentes del manifiesto: ${missing.join(', ')}`)

// Fallar antes de la primera solicitud/escritura si cualquier representación no está fijada.
for (const entry of selected) assertPinnedSourceEntry(entry)

const results = await mapLimit(selected, 4, async (entry) => {
  try {
    return await syncProductSource(entry, { outputRoot: SOURCE_ROOT })
  } catch (error) {
    throw new Error(`No se pudo sincronizar ${entry.slug} (${entry.imageUrl}): ${error.message}`, {
      cause: error,
    })
  }
})

if (writeCredits) {
  await writeProductCredits(join(ROOT, 'public', 'products', 'SOURCES.md'), manifest)
}

console.log(`Sincronizadas ${results.length} fuentes fijadas sin tocar assets curados.`)
for (const result of results) {
  console.log(
    `${result.slug}: source.${result.extension} ${result.width}x${result.height} ${result.status} ${result.sourceSha256}`,
  )
}
