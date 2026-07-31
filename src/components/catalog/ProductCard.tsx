import Link from 'next/link'
import { ComponentDims, ComponentRender } from '@/components/render/ComponentRender'
import { Price } from '@/components/ui/Price'
import { AddToCart } from '@/components/product/AddToCart'
import { availabilityOf, type Product } from '@/lib/catalog/types'
import { headlineSpec, renderDims } from '@/lib/catalog/derive'
import { makeT } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locales'
import { discountPercent } from '@/lib/money'
import { RULES } from '@/config/site'

/**
 * LA FICHA COMO MANIFIESTO
 *
 * Sin borde de tarjeta: solo un filete arriba, como una fila de un muestrario
 * impreso. En hover cruza la vista anotada en 400 ms y el filete bajo el nombre
 * se dibuja de izquierda a derecha. El render desborda su celda: la pieza flota
 * sobre la superficie en lugar de estar encajonada.
 *
 * Funciona igual en servidor y en cliente (no usa contexto), porque la grilla del
 * catálogo es un componente de cliente y las secciones de la home no lo son.
 */
export function ProductCard({
  product,
  locale,
  index = 0,
}: {
  product: Product
  locale: Locale
  index?: number
}) {
  const t = makeT(locale)
  const availability = availabilityOf(product, RULES.lowStockAt)
  const off = discountPercent(product.priceUsd, product.listPriceUsd)
  const soldOut = availability === 'agotado'

  return (
    <article className="group relative flex flex-col border-t border-rule pt-5">
      <Link
        href={`/${locale}/producto/${product.slug}`}
        // Sin prefetch: con 37 fichas en pantalla, Next se traería 37 cargas de
        // ruta que casi nadie va a usar. En datos móviles eso es medio mega.
        prefetch={false}
        data-cursor="product"
        data-cursor-label={t('cta.view')}
        className="flex flex-1 flex-col outline-offset-8"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunk rounded-part">
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <ComponentRender
              {...product.render}
              className="w-[112%] max-w-none"
              title={`${product.name} — ${t('product.gallery.front')}`}
            />
          </div>
          {/* La vista anotada NO redibuja la pieza: solo superpone las cotas. */}
          <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0 transition-opacity duration-[400ms] ease-rail group-hover:opacity-100 group-focus-within:opacity-100">
            <ComponentDims dims={renderDims(product, locale)} className="w-[112%] max-w-none" />
          </div>

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {off ? (
              <span className="u-tag bg-surface text-amber">
                −{off}% {t('product.tag.off')}
              </span>
            ) : null}
            {product.arrivedRecently && !off ? (
              <span className="u-tag bg-surface text-fg-mid">{t('product.tag.new')}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <p className="u-label flex items-center gap-2">
            <span className="text-accent tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.brand}</span>
          </p>

          <h3 className="mt-2 text-[0.9375rem] font-medium leading-snug text-fg">
            <span className="relative inline">
              {product.name}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-[320ms] ease-rail group-hover:scale-x-100 group-focus-within:scale-x-100" />
            </span>
          </h3>

          <p className="mt-2 font-mono text-[0.6875rem] leading-relaxed tabular-nums text-fg-low">
            {headlineSpec(product, locale)}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <span className="flex flex-col">
              {off ? (
                <Price
                  usd={product.listPriceUsd ?? product.priceUsd}
                  strike
                  className="font-mono text-[0.6875rem] text-fg-low"
                />
              ) : null}
              <Price usd={product.priceUsd} className="font-mono text-base font-medium text-fg" />
            </span>
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
        </div>
      </Link>

      <div className="pt-4">
        <AddToCart product={product} disabled={soldOut} variant="line" />
      </div>
    </article>
  )
}
