import { readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

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
  const metadata = await sharp(output).metadata()

  if (file.size < 8_000) throw new Error(`Imagen demasiado liviana para ${entry.slug}.`)
  if (metadata.format !== 'webp') throw new Error(`Formato incorrecto para ${entry.slug}.`)
  if ((metadata.width ?? 0) < 400 || (metadata.height ?? 0) < 300) {
    throw new Error(`Resolución insuficiente para ${entry.slug}: ${metadata.width}×${metadata.height}.`)
  }
}

console.log(`OK: ${manifest.length} productos tienen imagen WebP local, fuente y crédito.`)
