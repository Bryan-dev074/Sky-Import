'use client'

import { useRef } from 'react'
import { CartContents } from '@/components/cart/CartContents'
import { useUi } from '@/lib/ui'
import { useI18n } from '@/lib/i18n/context'
import { useFocusTrap } from '@/lib/useFocusTrap'

/**
 * En escritorio es un cajón lateral. En teléfono ocupa la pantalla completa,
 * porque un cajón de 420 px sobre 360 px de ancho no es un cajón: es un modal
 * mal hecho.
 */
export function CartDrawer() {
  const open = useUi((s) => s.cartOpen)
  const close = useUi((s) => s.closeCart)
  const { t } = useI18n()
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelRef, open, close)

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-carbon-sunk/70 transition-opacity duration-300 ease-rail data-[closed]:pointer-events-none data-[closed]:opacity-0"
        data-closed={open ? undefined : ''}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
        className="u-drawer fixed inset-y-0 right-0 z-[65] flex w-full max-w-[440px] flex-col bg-surface-lift shadow-lift"
        data-closed={open ? undefined : ''}
        {...(open ? {} : { inert: true })}
      >
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 className="u-label text-fg">{t('cart.title')}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('nav.closeCart')}
            data-cursor="link"
            className="grid size-11 place-items-center text-fg-mid transition-colors hover:text-fg"
          >
            <svg viewBox="0 0 14 14" width="12" height="12" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        <CartContents onNavigate={close} compact />
      </div>
    </>
  )
}
