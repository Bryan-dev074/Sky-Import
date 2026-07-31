import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductView } from '@/components/views/ProductView'
import { PRODUCTS, PRODUCT_BY_SLUG } from '@/lib/catalog/products'
import { makeT } from '@/lib/i18n/dictionary'
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/locales'

/**
 * Solo existen las rutas del catálogo. Un slug que no está en la lista no es una
 * ruta de la aplicación, así que responde el 404 global de la casa.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PRODUCTS.map((product) => ({ locale, slug: product.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'es'
  const product = PRODUCT_BY_SLUG.get(slug)
  if (!product) return { title: makeT(locale)('product.notFound') }
  return { title: `${product.name} — ${product.brand}`, description: product.blurb[locale] }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  if (!PRODUCT_BY_SLUG.has(slug)) notFound()
  return <ProductView slug={slug} />
}
