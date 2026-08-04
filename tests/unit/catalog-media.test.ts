import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, test } from 'vitest'
import { PRODUCTS } from '@/lib/catalog/products'
import { measureOpaqueBounds } from '../../scripts/lib/product-cutout.mjs'

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

  test('identifica la RTX 5080 como Founders Edition con las dimensiones oficiales', () => {
    const product = PRODUCTS.find((candidate) => candidate.slug === 'geforce-rtx-5080-16gb')

    expect(product).toMatchObject({
      name: 'GeForce RTX 5080 Founders Edition 16 GB',
      brand: 'NVIDIA',
      model: 'RTX 5080 Founders Edition',
      compat: {
        kind: 'gpu',
        lengthMm: 304,
        slots: 2,
      },
    })
    expect(product?.blurb.es).toContain('Founders Edition')
    expect(product?.blurb.es).toContain('304 mm')
    expect(product?.blurb.pt).toContain('Founders Edition')
    expect(product?.blurb.pt).toContain('304 mm')
    expect(product?.specs.map((spec) => spec.value)).toEqual(
      expect.arrayContaining(['304 mm', '2']),
    )
  })

  test('mantiene la identidad CL36 del SKU Corsair CMK32GX5M2B6000C36', () => {
    const product = PRODUCTS.find(
      (candidate) => candidate.slug === 'corsair-vengeance-ddr5-32gb-6000',
    )
    const serialized = JSON.stringify(product)

    expect(product).toMatchObject({
      name: 'Vengeance DDR5 32 GB (2×16) 6000 CL36',
      brand: 'Corsair',
      model: 'Vengeance DDR5 6000 CL36',
      compat: {
        kind: 'ram',
        latency: 'CL36',
      },
    })
    expect(product?.blurb.es).toContain('CL36')
    expect(product?.blurb.pt).toContain('CL36')
    expect(product?.specs.map((spec) => spec.value)).toEqual(
      expect.arrayContaining(['CL36', 'CMK32GX5M2B6000C36', '36-38-38-76']),
    )
    expect(serialized).not.toContain('CL30')
  })

  test('sincroniza exactamente fuente y crédito del runtime con el manifiesto', async () => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'public', 'products', 'manifest.json'), 'utf8'),
    ) as { slug: string; sourcePage: string; credit: string }[]
    const expected = manifest
      .map(({ slug, sourcePage, credit }) => ({ slug, sourcePage, credit }))
      .sort((left, right) => left.slug.localeCompare(right.slug))
    const actual = PRODUCTS.map(({ slug, media: { sourcePage, credit } }) => ({
      slug,
      sourcePage,
      credit,
    })).sort((left, right) => left.slug.localeCompare(right.slug))

    expect(actual).toEqual(expected)
  })

  test('atribuye la fotografía de Crucial al listing exacto de Newegg', () => {
    expect(PRODUCTS.find((product) => product.slug === 'crucial-p3-plus-1tb')?.media.credit).toBe(
      'Crucial product image via Newegg',
    )
  })

  test('mantiene la variante H5 Flow 2022 y el pack P12 exactos en sus fuentes oficiales', () => {
    expect(PRODUCTS.find((product) => product.slug === 'nzxt-h5-flow')?.media.sourcePage).toBe(
      'https://nzxt.com/products/h5-flow-2022',
    )
    expect(
      PRODUCTS.find((product) => product.slug === 'arctic-p12-pwm-pst-5-pack')?.media.sourcePage,
    ).toBe('https://www.arctic.de/P12-PWM-PST/ACFAN00137A')
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

  test('los cinco recortes corregidos ocupan exactamente 84% en su eje mayor', async () => {
    const correctedSlugs = [
      'radeon-rx-9070-xt-16gb',
      'asus-tuf-gaming-b650-plus-wifi',
      'asrock-z890-pro-rs',
      'msi-mag-a650bn',
      'cooler-master-masterbox-q300l',
    ]

    for (const slug of correctedSlugs) {
      const imagePath = join(process.cwd(), 'public', 'products', slug, 'primary.webp')
      const bounds = await measureOpaqueBounds(imagePath)
      expect(bounds, slug).not.toBeNull()
      if (!bounds) throw new Error(`El recorte ${slug} debe contener píxeles opacos.`)
      expect(Math.max(bounds.opaqueWidth, bounds.opaqueHeight), slug).toBe(1_344)
    }
  })
})
