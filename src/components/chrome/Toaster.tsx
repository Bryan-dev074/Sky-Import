'use client'

import { useUi } from '@/lib/ui'
import { useI18n } from '@/lib/i18n/context'

/**
 * Avisos apilados con región anunciable. Deshacer en vez de confirmar: quitar
 * del carrito no pregunta, ofrece devolverlo a su posición original.
 *
 * No bloquea los clics de alrededor: solo el aviso recibe puntero.
 */
export function Toaster() {
  const toasts = useUi((s) => s.toasts)
  const dismiss = useUi((s) => s.dismiss)
  const { t } = useI18n()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="u-panel pointer-events-auto flex w-full max-w-[380px] items-center gap-4 px-4 py-3"
        >
          <span className="flex-1 text-[0.8125rem] leading-snug text-fg">{toast.text}</span>
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action?.run()
                dismiss(toast.id)
              }}
              data-cursor="link"
              className="u-link u-tap font-mono text-[0.625rem] font-medium tracking-[0.14em] uppercase text-accent"
            >
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label={t('cta.close')}
            data-cursor="link"
            className="grid size-8 place-items-center text-fg-low transition-colors hover:text-fg"
          >
            <svg viewBox="0 0 14 14" width="11" height="11" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
