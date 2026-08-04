import productManifest from '../../../public/products/manifest.json'
import type { CatalogProduct, Product, ProductMedia } from './types'

interface ProductSource {
  sourcePage: string
  credit: string
}

const MANIFEST_SOURCE_BY_SLUG: Readonly<Record<string, ProductSource>> = Object.freeze(
  productManifest.reduce<Record<string, ProductSource>>((sources, { slug, sourcePage, credit }) => {
    sources[slug] = { sourcePage, credit }
    return sources
  }, {}),
)

function mediaFor(product: CatalogProduct): ProductMedia {
  const source = MANIFEST_SOURCE_BY_SLUG[product.slug]
  if (!source) throw new Error(`Falta la fuente del manifiesto para ${product.slug}`)

  return {
    primary: `/products/${product.slug}/primary.webp`,
    alt: {
      es: `Fotografía real de ${product.model}`,
      pt: `Fotografia real de ${product.model}`,
    },
    sourcePage: source.sourcePage,
    credit: source.credit,
  }
}

export function attachProductMedia(products: CatalogProduct[]): Product[] {
  const catalogSlugs = new Set(products.map((product) => product.slug))
  const unusedSources = Object.keys(MANIFEST_SOURCE_BY_SLUG).filter(
    (slug) => !catalogSlugs.has(slug),
  )
  if (unusedSources.length > 0) {
    throw new Error(`Fuentes del manifiesto sin producto: ${unusedSources.join(', ')}`)
  }

  return products.map((product) => ({ ...product, media: mediaFor(product) }))
}
