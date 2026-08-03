import { readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectProductCutout } from './lib/product-cutout.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  await readFile(join(ROOT, 'public', 'products', 'manifest.json'), 'utf8'),
)
const productSource = await readFile(join(ROOT, 'src', 'lib', 'catalog', 'products.ts'), 'utf8')
const catalogSlugs = Array.from(productSource.matchAll(/slug:\s*'([^']+)'/g), (match) => match[1])
const manifestSlugs = manifest.map((entry) => entry.slug)
const uniqueManifestSlugs = new Set(manifestSlugs)

if (catalogSlugs.length !== 38) throw new Error(`Se esperaban 38 productos y hay ${catalogSlugs.length}.`)
if (manifest.length !== catalogSlugs.length || uniqueManifestSlugs.size !== manifest.length) {
  throw new Error('El manifiesto no tiene exactamente una entrada única por producto.')
}

const missing = catalogSlugs.filter((slug) => !uniqueManifestSlugs.has(slug))
const extra = manifestSlugs.filter((slug) => !catalogSlugs.includes(slug))
if (missing.length || extra.length) {
  throw new Error(`Desajuste de imágenes. Faltan: ${missing.join(', ')}. Sobran: ${extra.join(', ')}.`)
}

for (const entry of manifest) {
  if (!entry.imageUrl?.startsWith('https://') || !entry.sourcePage?.startsWith('https://')) {
    throw new Error(`Fuente inválida para ${entry.slug}.`)
  }

  const output = join(ROOT, 'public', 'products', entry.slug, 'primary.webp')
  const file = await stat(output)
  const { metadata, cornerAlpha, bounds } = await inspectProductCutout(output)
  const expectedCanvas = entry.slug === 'geforce-rtx-5090-founders-edition-32gb' ? 2048 : 1600

  if (file.size < 8_000) throw new Error(`[${entry.slug}] imagen demasiado liviana: ${file.size} bytes.`)
  if (file.size > 16 * 1024 * 1024) throw new Error(`[${entry.slug}] imagen demasiado pesada: ${file.size} bytes.`)
  if (metadata.format !== 'webp') throw new Error(`[${entry.slug}] formato incorrecto: ${metadata.format ?? 'desconocido'}.`)
  if (metadata.hasAlpha !== true) throw new Error(`[${entry.slug}] falta canal alfa: hasAlpha=${metadata.hasAlpha}.`)
  if ((metadata.width ?? 0) !== expectedCanvas || (metadata.height ?? 0) !== expectedCanvas) {
    throw new Error(
      `[${entry.slug}] dimensiones incorrectas: ${metadata.width}×${metadata.height}; se esperaban ${expectedCanvas}×${expectedCanvas}.`,
    )
  }
  if (!bounds) throw new Error(`[${entry.slug}] no contiene píxeles opacos con alfa mayor a 8.`)
  if (!cornerAlpha.every((alpha) => alpha === 0)) {
    throw new Error(`[${entry.slug}] esquinas sin transparencia total: alfa=${cornerAlpha.join(', ')}.`)
  }
  if (bounds.safeMarginRatio < 0.06) {
    const ratios = Object.entries(bounds.marginRatios)
      .map(([side, ratio]) => `${side}=${(ratio * 100).toFixed(2)}%`)
      .join(', ')
    throw new Error(`[${entry.slug}] margen transparente insuficiente: ${ratios}.`)
  }
}

console.log(`OK: ${manifest.length} productos tienen imagen WebP local, fuente y crédito.`)
