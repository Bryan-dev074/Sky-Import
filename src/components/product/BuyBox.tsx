'use client'

import { useState } from 'react'
import { AddToCart } from '@/components/product/AddToCart'
import { useI18n } from '@/lib/i18n/context'
import { availabilityOf, type Product } from '@/lib/catalog/types'
import { RULES, hasWhatsapp, whatsappLink } from '@/config/site'

export function BuyBox({ product }: { product: Product }) {
  const { t } = useI18n()
  const [qty, setQty] = useState(1)
  const availability = availabilityOf(product, RULES.lowStockAt)
  const soldOut = availability === 'agotado'

  return (
    <div className="mt-8">
      {!soldOut ? (
        <div className="flex items-center gap-4">
          <span className="u-label">{t('product.qty')}</span>
          <div className="flex items-center border border-rule rounded-part">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label={t('product.decrease')}
              className="grid size-11 place-items-center text-fg-mid transition-colors hover:text-fg disabled:opacity-35"
            >
              <svg viewBox="0 0 12 12" width="11" height="11" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <line x1="2" y1="6" x2="10" y2="6" />
              </svg>
            </button>
            <span className="w-9 text-center font-mono text-[0.875rem] tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(product.units, q + 1))}
              disabled={qty >= product.units}
              aria-label={t('product.increase')}
              className="grid size-11 place-items-center text-fg-mid transition-colors hover:text-fg disabled:opacity-35"
            >
              <svg viewBox="0 0 12 12" width="11" height="11" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <line x1="2" y1="6" x2="10" y2="6" />
                <line x1="6" y1="2" x2="6" y2="10" />
              </svg>
            </button>
          </div>
          {availability === 'ultimas-unidades' ? (
            <span className="u-tag text-amber" role="status">
              {product.units} {product.units === 1 ? t('product.unit') : t('product.units')}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <AddToCart product={product} qty={qty} disabled={soldOut} testId="agregar" />
        {hasWhatsapp && !soldOut ? (
          <a
            href={whatsappLink(`${t('wa.productMessage')} ${product.name} (${product.ref})`)}
            target="_blank"
            rel="noopener noreferrer"
            className="u-btn u-btn-line"
          >
            {t('cta.whatsapp')}
          </a>
        ) : null}
      </div>
    </div>
  )
}
