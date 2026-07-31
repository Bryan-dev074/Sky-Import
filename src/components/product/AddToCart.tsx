'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useUi } from '@/lib/ui'
import { useI18n } from '@/lib/i18n/context'
import { hasWhatsapp, whatsappLink } from '@/config/site'
import type { Product } from '@/lib/catalog/types'

/**
 * Añadir al carrito con respuesta visible: el botón confirma en su propio sitio
 * durante 1,6 s y además se anuncia por la región `aria-live` del avisador. No
 * abre el cajón de golpe: interrumpir a quien está mirando el catálogo para
 * mostrarle el carrito es una interrupción, no una confirmación.
 *
 * Si la pieza no tiene unidades, el botón cede su lugar al canal que sí puede
 * resolverlo: la consulta por WhatsApp con el modelo ya escrito.
 */
export function AddToCart({
  product,
  qty = 1,
  disabled = false,
  variant = 'solid',
  className,
  testId,
}: {
  product: Product
  qty?: number
  disabled?: boolean
  variant?: 'solid' | 'line'
  className?: string
  /** Marca el botón principal de la ficha para poder apuntarle en las pruebas. */
  testId?: string
}) {
  const { t } = useI18n()
  const add = useCart((s) => s.add)
  const toast = useUi((s) => s.toast)
  const [confirmed, setConfirmed] = useState(false)

  if (disabled) {
    if (!hasWhatsapp) {
      return (
        <button type="button" disabled data-testid={testId} className={`u-btn u-btn-line w-full ${className ?? ''}`}>
          {t('product.availability.agotado')}
        </button>
      )
    }
    return (
      <a
        href={whatsappLink(`${t('wa.productMessage')} ${product.name} (${product.ref})`)}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
        className={`u-btn u-btn-line w-full ${className ?? ''}`}
      >
        {t('product.soldOut')}
      </a>
    )
  }

  return (
    <button
      type="button"
      data-testid={testId}
      className={`u-btn ${variant === 'solid' ? 'u-btn-solid' : 'u-btn-line'} w-full ${className ?? ''}`}
      onClick={() => {
        add(product.slug, qty)
        setConfirmed(true)
        window.setTimeout(() => setConfirmed(false), 1600)
        toast(`${product.name} ${t('product.addedToCart')}`)
      }}
    >
      {confirmed ? (
        <>
          <svg viewBox="0 0 14 14" width="12" height="12" stroke="currentColor" strokeWidth="1.6" fill="none" aria-hidden="true">
            <path d="M2 7.4 L5.4 11 L12 3.4" />
          </svg>
          {t('cta.added')}
        </>
      ) : (
        t('cta.add')
      )}
    </button>
  )
}
