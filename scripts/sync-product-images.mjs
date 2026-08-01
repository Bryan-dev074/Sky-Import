import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import https from 'node:https'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST_PATH = join(ROOT, 'public', 'products', 'manifest.json')
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36 SkyImportAssetSync/1.0'

function download(url, referer, redirects = 0) {
  if (redirects > 8) return Promise.reject(new Error(`Demasiadas redirecciones: ${url}`))

  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const transport = parsed.protocol === 'http:' ? http : https
    const request = transport.get(
      parsed,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          Referer: referer,
        },
        timeout: 30_000,
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume()
          resolve(download(new URL(response.headers.location, parsed).href, referer, redirects + 1))
          return
        }

        if (response.statusCode !== 200) {
          response.resume()
          reject(new Error(`HTTP ${response.statusCode ?? 'sin estado'}: ${url}`))
          return
        }

        const chunks = []
        let total = 0
        response.on('data', (chunk) => {
          total += chunk.length
          if (total > 40 * 1024 * 1024) {
            request.destroy(new Error(`Imagen mayor a 40 MB: ${url}`))
            return
          }
          chunks.push(chunk)
        })
        response.on('end', () => resolve(Buffer.concat(chunks)))
        response.on('error', reject)
      },
    )

    request.on('timeout', () => request.destroy(new Error(`Tiempo agotado: ${url}`)))
    request.on('error', reject)
  })
}

async function syncProduct(entry) {
  try {
    const source = await download(entry.imageUrl, entry.sourcePage)
    const output = join(ROOT, 'public', 'products', entry.slug, 'primary.webp')
    await mkdir(dirname(output), { recursive: true })

    await sharp(source, { failOn: 'warning' })
      .rotate()
      .resize({
        width: 1600,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88, alphaQuality: 90, effort: 5 })
      .toFile(output)

    const metadata = await sharp(output).metadata()
    return `${entry.slug}: ${metadata.width}×${metadata.height}`
  } catch (error) {
    throw new Error(`No se pudo procesar ${entry.slug} (${entry.imageUrl}): ${error.message}`, {
      cause: error,
    })
  }
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

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
const results = await mapLimit(manifest, 4, syncProduct)
await writeFile(
  join(ROOT, 'public', 'products', 'SOURCES.md'),
  [
    '# Fuentes de imágenes de producto',
    '',
    'Cada imagen fue optimizada localmente a WebP. Las páginas y créditos de origen se conservan a continuación.',
    '',
    ...manifest.map(
      (entry) =>
        `- \`${entry.slug}\` — [${entry.credit}](${entry.sourcePage}) — [archivo original](${entry.imageUrl})`,
    ),
    '',
  ].join('\n'),
  'utf8',
)

console.log(`Sincronizadas ${results.length} imágenes.`)
console.log(results.join('\n'))
