import { createHash, randomUUID } from 'node:crypto'
import { link, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import http from 'node:http'
import https from 'node:https'
import sharp from 'sharp'

const MAX_SOURCE_BYTES = 40 * 1024 * 1024
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36 SkyImportAssetSync/2.0'
const SOURCE_FORMAT_BY_MEDIA_TYPE = Object.freeze({
  'image/jpeg': { extension: 'jpg', sharpFormat: 'jpeg' },
  'image/png': { extension: 'png', sharpFormat: 'png' },
  'image/webp': { extension: 'webp', sharpFormat: 'webp' },
})

function normalizedSha256(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

export function assertPinnedSourceEntry(entry) {
  if (!entry || typeof entry.slug !== 'string' || entry.slug.length === 0) {
    throw new Error('La fuente debe declarar un slug.')
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) {
    throw new Error(`[${entry.slug}] slug seguro requerido: minúsculas, números y guiones.`)
  }
  if (!/^https?:\/\//.test(entry.imageUrl ?? '')) {
    throw new Error(`[${entry.slug}] imageUrl debe ser HTTP(S).`)
  }
  if (!/^https?:\/\//.test(entry.sourcePage ?? '')) {
    throw new Error(`[${entry.slug}] sourcePage debe ser HTTP(S).`)
  }
  if (!SOURCE_FORMAT_BY_MEDIA_TYPE[entry.sourceMediaType]) {
    throw new Error(
      `[${entry.slug}] sourceMediaType debe fijar image/jpeg, image/png o image/webp.`,
    )
  }
  if (!/^[A-F0-9]{64}$/.test(normalizedSha256(entry.sourceSha256))) {
    throw new Error(`[${entry.slug}] sourceSha256 debe fijar 64 dígitos hexadecimales.`)
  }
}

function downloadPinned(url, entry, redirects = 0) {
  if (redirects > 8) return Promise.reject(new Error(`Demasiadas redirecciones: ${url}`))

  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const transport = parsed.protocol === 'http:' ? http : https
    const request = transport.get(
      parsed,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: entry.sourceMediaType,
          'Accept-Encoding': 'identity',
          'Cache-Control': 'no-transform',
          Referer: entry.sourcePage,
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
          resolve(
            downloadPinned(
              new URL(response.headers.location, parsed).href,
              entry,
              redirects + 1,
            ),
          )
          return
        }

        if (response.statusCode !== 200) {
          response.resume()
          reject(new Error(`HTTP ${response.statusCode ?? 'sin estado'}: ${url}`))
          return
        }

        const contentType = String(response.headers['content-type'] ?? '')
          .split(';', 1)[0]
          .trim()
          .toLowerCase()
        if (contentType !== entry.sourceMediaType) {
          response.resume()
          reject(
            new Error(
              `[${entry.slug}] representación inesperada: ${contentType || 'sin Content-Type'}; se pidió ${entry.sourceMediaType}.`,
            ),
          )
          return
        }

        const chunks = []
        let total = 0
        response.on('data', (chunk) => {
          total += chunk.length
          if (total > MAX_SOURCE_BYTES) {
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

async function validateDownloadedSource(entry, source) {
  const expectedHash = normalizedSha256(entry.sourceSha256)
  const actualHash = createHash('sha256').update(source.body).digest('hex').toUpperCase()
  if (actualHash !== expectedHash) {
    throw new Error(
      `[${entry.slug}] SHA-256 inesperado: ${actualHash}; se esperaba ${expectedHash}. No se escribió ningún archivo.`,
    )
  }

  const expectedFormat = SOURCE_FORMAT_BY_MEDIA_TYPE[entry.sourceMediaType].sharpFormat
  const metadata = await sharp(source.body, { failOn: 'warning' }).metadata()
  if (metadata.format !== expectedFormat) {
    throw new Error(
      `[${entry.slug}] los bytes declaran ${metadata.format ?? 'formato desconocido'}; se esperaba ${expectedFormat}.`,
    )
  }

  return { actualHash, metadata }
}

async function publishNewFileAtomically(output, bytes) {
  try {
    const existing = await readFile(output)
    if (existing.equals(bytes)) return 'unchanged'
    throw new Error(`La fuente local existente difiere y no se sobrescribirá: ${output}`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  await mkdir(dirname(output), { recursive: true })
  const temporary = `${output}.tmp-${process.pid}-${randomUUID()}`
  try {
    await writeFile(temporary, bytes, { flag: 'wx' })
    await link(temporary, output)
  } finally {
    await rm(temporary, { force: true })
  }
  return 'created'
}

export async function syncProductSource(entry, options = {}) {
  assertPinnedSourceEntry(entry)
  const outputRoot = options.outputRoot
  if (typeof outputRoot !== 'string' || outputRoot.length === 0) {
    throw new Error('syncProductSource requiere outputRoot explícito.')
  }

  const source = await downloadPinned(entry.imageUrl, entry)
  const { actualHash, metadata } = await validateDownloadedSource(entry, source)
  const extension = SOURCE_FORMAT_BY_MEDIA_TYPE[entry.sourceMediaType].extension
  const output = join(outputRoot, entry.slug, `source.${extension}`)
  const status = await publishNewFileAtomically(output, source.body)

  return {
    slug: entry.slug,
    output,
    extension,
    status,
    sourceUrl: source.url,
    sourceSha256: actualHash,
    width: metadata.width,
    height: metadata.height,
  }
}
