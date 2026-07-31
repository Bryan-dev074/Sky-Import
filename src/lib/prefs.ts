'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { isCurrency, type Currency } from '@/lib/money'
import { CURRENCY_STORAGE_KEY } from '@/lib/prePaint'

/**
 * La moneda visible NO es estado de React: es un atributo en `<html>` que el CSS
 * lee para decidir cuál de los tres importes impresos se muestra. Por eso se
 * suscribe con `useSyncExternalStore` en lugar de copiarla a un `useState` desde
 * un efecto: el DOM es la fuente de verdad y React solo la observa.
 *
 * Consecuencia importante: la página sigue siendo estática y no hay parpadeo,
 * porque el atributo lo fija un script previo al primer pintado (ver
 * `src/lib/prePaint.ts`).
 */

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Currency {
  const attr = document.documentElement.getAttribute('data-currency')
  return attr && isCurrency(attr) ? attr : 'USD'
}

/** En el servidor no hay atributo: se imprime el dólar, que es la fuente. */
function getServerSnapshot(): Currency {
  return 'USD'
}

export function useCurrency(): [Currency, (next: Currency) => void] {
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setCurrency = useCallback((next: Currency) => {
    document.documentElement.setAttribute('data-currency', next)
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, next)
    } catch {
      // Modo privado o almacenamiento lleno: la elección vale para esta visita.
    }
    for (const listener of listeners) listener()
  }, [])

  return [currency, setCurrency]
}
