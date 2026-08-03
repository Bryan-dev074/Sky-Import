import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { inspectProductCutout } from './product-cutout.mjs'

function productImagePath(root, slug) {
  return join(root, 'public', 'products', slug, 'primary.webp')
}

function fileAccessError(slug, error) {
  if (error?.code === 'ENOENT') return new Error(`[${slug}] falta primary.webp.`, { cause: error })
  return new Error(`[${slug}] no se puede acceder a primary.webp: ${error.message}`, { cause: error })
}

function inspectionError(slug, error) {
  return new Error(`[${slug}] primary.webp no se puede leer como imagen: ${error.message}`, { cause: error })
}

export async function validateProductMedia(root, manifest) {
  for (const entry of manifest) {
    if (!entry.imageUrl?.startsWith('https://') || !entry.sourcePage?.startsWith('https://')) {
      throw new Error(`[${entry.slug}] fuente inválida: imageUrl y sourcePage deben usar https.`)
    }
    if (typeof entry.credit !== 'string' || !entry.credit.trim()) {
      throw new Error(`[${entry.slug}] crédito faltante o vacío.`)
    }

    const output = productImagePath(root, entry.slug)
    let file
    try {
      file = await stat(output)
    } catch (error) {
      throw fileAccessError(entry.slug, error)
    }
    if (!file.isFile()) throw new Error(`[${entry.slug}] primary.webp no es un archivo.`)

    let inspection
    try {
      inspection = await inspectProductCutout(await readFile(output))
    } catch (error) {
      throw inspectionError(entry.slug, error)
    }

    const { metadata, cornerAlpha, bounds } = inspection
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
}
