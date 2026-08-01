import { describe, expect, test } from 'vitest'
import { PRODUCTS } from '@/lib/catalog/products'

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
})
