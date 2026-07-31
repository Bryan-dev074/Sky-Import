import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Gallery } from '@/components/product/Gallery'
import { BuyBox } from '@/components/product/BuyBox'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Price } from '@/components/ui/Price'
import { PRODUCTS, PRODUCT_BY_SLUG } from '@/lib/catalog/products'
import { CATEGORY_META } from '@/lib/catalog/categories'
import { availabilityOf } from '@/lib/catalog/types'
import { constraintsOf } from '@/lib/catalog/derive'
import { makeT } from '@/lib/i18n/dictionary'
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/locales'
import { discountPercent } from '@/lib/money'
import { RULES } from '@/config/site'

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
  return {
    title: `${product.name} — ${product.brand}`,
    description: product.blurb[locale],
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)
  const product = PRODUCT_BY_SLUG.get(slug)
  if (!product) notFound()

  const category = CATEGORY_META[product.category]
  const availability = availabilityOf(product, RULES.lowStockAt)
  const off = discountPercent(product.priceUsd, product.listPriceUsd)
  const constraints = constraintsOf(product, locale)
  const related = PRODUCTS.filter(
    (item) => item.category === product.category && item.slug !== product.slug,
  ).slice(0, 3)

  return (
    <>
      <div className="u-page pt-24 lg:pt-32">
        <nav aria-label="breadcrumb" className="u-label flex flex-wrap items-center gap-2">
          <Link href={`/${locale}/catalogo`} data-cursor="link" className="u-link hover:text-fg">
            {t('catalog.title')}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/${locale}/catalogo?categoria=${product.category}`}
            data-cursor="link"
            className="u-link hover:text-fg"
          >
            {category.name[locale]}
          </Link>
        </nav>
      </div>

      <article className="u-page grid gap-12 py-10 lg:grid-cols-12 lg:gap-14 lg:py-14">
        <div className="lg:col-span-7">
          <Gallery product={product} />
        </div>

        <div className="lg:col-span-5">
          <p className="u-eyebrow">{product.brand}</p>

          <h1 className="u-display-sm mt-4 text-[clamp(1.75rem,4vw,2.5rem)]">{product.name}</h1>

          <p className="u-label mt-3 tabular-nums">
            {t('product.ref')} {product.ref}
          </p>

          <p className="u-measure mt-6 text-[1rem] leading-relaxed text-fg-mid">
            {product.blurb[locale]}
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2 border-t border-rule pt-6">
            {off ? (
              <>
                <Price
                  usd={product.listPriceUsd ?? product.priceUsd}
                  strike
                  className="font-mono text-[0.875rem] text-fg-low"
                />
                <span className="u-tag text-amber">
                  −{off}% {t('product.tag.off')}
                </span>
              </>
            ) : null}
            <Price
              usd={product.priceUsd}
              className="w-full font-mono text-[clamp(1.5rem,4vw,2rem)] font-medium text-fg"
            />
            <span
              className={`u-tag ${
                availability === 'agotado'
                  ? 'text-rust'
                  : availability === 'ultimas-unidades'
                    ? 'text-amber'
                    : 'text-fg-low'
              }`}
            >
              {t(`product.availability.${availability}`)}
            </span>
          </div>

          <BuyBox product={product} />

          <p className="u-label mt-5 leading-relaxed normal-case tracking-normal">
            {t('product.priceNote')} {t('currency.note')}
          </p>
        </div>
      </article>

      {/* ── ficha técnica y compatibilidad, lado a lado ── */}
      <section className="u-page grid gap-12 border-t border-rule py-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h2 className="u-label text-fg">{t('product.specs')}</h2>
          <dl className="mt-5">
            {product.specs.map((spec) => (
              <div key={spec.label[locale]} className="u-spec">
                <dt>{spec.label[locale]}</dt>
                <dd>{typeof spec.value === 'string' ? spec.value : spec.value[locale]}</dd>
              </div>
            ))}
          </dl>
          <p className="u-label mt-5 leading-relaxed normal-case tracking-normal">
            {t('product.specsNote')}
          </p>
        </div>

        {constraints.length > 0 ? (
          <div className="lg:col-span-5">
            <h2 className="u-label text-fg">{t('product.compat')}</h2>
            <ul className="mt-5">
              {constraints.map((line, i) => (
                <li key={line} className="flex gap-4 border-b border-rule py-4">
                  <span className="font-mono text-[0.625rem] tabular-nums text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-fg-mid">{line}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/armar`} className="u-btn u-btn-line mt-6 w-full">
              {t('cta.build')}
            </Link>
          </div>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section className="u-page border-t border-rule py-16 pb-24">
          <h2 className="u-label text-fg">{t('product.related')}</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <ProductCard key={item.slug} product={item} locale={locale} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
