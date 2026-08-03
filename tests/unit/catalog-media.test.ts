import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, test } from 'vitest'
import { PRODUCTS } from '@/lib/catalog/products'

async function readCornerAlpha(input: string) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const alpha = info.channels - 1
  const lastRow = (info.height - 1) * info.width * info.channels
  const lastPixel = (info.width - 1) * info.channels

  return [data[alpha], data[lastPixel + alpha], data[lastRow + alpha], data[lastRow + lastPixel + alpha]]
}

describe('catálogo premium', () => {
  test('incorpora la RTX 5090 como producto insignia', () => {
    expect(PRODUCTS).toHaveLength(38)
    expect(PRODUCTS[0]?.slug).toBe('geforce-rtx-5090-founders-edition-32gb')
    expect(PRODUCTS[0]?.compat).toMatchObject({
      kind: 'gpu',
      lengthMm: 304,
      tgpW: 575,
      recommendedPsuW: 1000,
      vramGb: 32,
    })
  })

  test('adjunta metadatos de imagen oficial a cada producto', () => {
    for (const product of PRODUCTS) {
      const media = (product as typeof product & {
        media?: {
          primary: string
          sourcePage: string
          credit: string
          alt: { es: string; pt: string }
        }
      }).media

      expect(media, product.slug).toBeDefined()
      expect(media?.primary).toBe(`/products/${product.slug}/primary.webp`)
      expect(media?.sourcePage).toMatch(/^https:\/\//)
      expect(media?.credit.length).toBeGreaterThan(1)
      expect(media?.alt.es).toContain(product.model)
      expect(media?.alt.pt).toContain(product.model)
    }
  })

  test('incluye una imagen local WebP con alfa y esquinas transparentes para cada producto', async () => {
    for (const product of PRODUCTS) {
      const imagePath = join(
        process.cwd(),
        'public',
        product.media.primary.replace(/^\//, ''),
      )

      expect(existsSync(imagePath), product.slug).toBe(true)
      const metadata = await sharp(imagePath).metadata()
      expect(metadata.format, product.slug).toBe('webp')
      expect(metadata.hasAlpha, product.slug).toBe(true)
      expect(await readCornerAlpha(imagePath), product.slug).toEqual([0, 0, 0, 0])
    }
  })
})
