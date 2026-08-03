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
        response.on('end', () =>
          resolve({
            body: Buffer.concat(chunks),
            url: parsed.href,
          }),
        )
        response.on('error', reject)
      },
    )

    request.on('timeout', () => request.destroy(new Error(`Tiempo agotado: ${url}`)))
    request.on('error', reject)
  })
}

async function detectExtension(source) {
  const metadata = await sharp(source.body, { failOn: 'warning' }).metadata()
  if (!metadata.format) throw new Error(`Formato de imagen no reconocido: ${source.url}`)
  return metadata.format
}

async function syncProduct(entry) {
  try {
    const source = await download(entry.imageUrl, entry.sourcePage)
    const extension = await detectExtension(source)
    const output = join(ROOT, 'artifacts', 'product-sources', entry.slug, `source.${extension}`)
    await mkdir(dirname(output), { recursive: true })
    await writeFile(output, source.body)
    return `${entry.slug}: source.${extension}`
  } catch (error) {
    throw new Error(`No se pudo descargar ${entry.slug} (${entry.imageUrl}): ${error.message}`, {
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

export async function writeCredits(manifest) {
  await writeFile(
    join(ROOT, 'public', 'products', 'SOURCES.md'),
    [
      '# Fuentes de imágenes de producto',
      '',
      'Cada imagen conserva su URL y crédito de origen. El flujo de producción está documentado en este archivo.',
      '',
      ...manifest.map(
        (entry) =>
          `- \`${entry.slug}\` — [${entry.credit}](${entry.sourcePage}) — [archivo original](${entry.imageUrl})`,
      ),
      '',
    ].join('\n'),
    'utf8',
  )
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
const results = await mapLimit(manifest, 4, syncProduct)
if (process.argv.slice(2).includes('--write-credits')) await writeCredits(manifest)

console.log(`Descargadas ${results.length} fuentes sin tocar assets curados.`)
console.log(results.join('\n'))
