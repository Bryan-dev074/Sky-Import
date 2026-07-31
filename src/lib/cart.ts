'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { PRODUCT_BY_SLUG } from '@/lib/catalog/products'
import { RULES } from '@/config/site'
import type { Product } from '@/lib/catalog/types'

export interface CartLine {
  slug: string
  qty: number
}

export interface CartLineResolved extends CartLine {
  product: Product
  /** Tope real de unidades: no se puede pedir más de lo configurado. */
  max: number
  lineTotalUsd: number
}

interface CartState {
  lines: CartLine[]
  /** Compuerta de hidratación: primero un marcador neutro, después el dato. */
  hydrated: boolean
  /** Última línea quitada, para poder deshacer sin perder la posición. */
  lastRemoved: { line: CartLine; index: number } | null
  add: (slug: string, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  undoRemove: () => void
  clear: () => void
  markHydrated: () => void
}

function clampQty(slug: string, qty: number): number {
  const product = PRODUCT_BY_SLUG.get(slug)
  const max = product ? Math.max(0, product.units) : 0
  return Math.max(0, Math.min(qty, max))
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      lastRemoved: null,

      add: (slug, qty = 1) => {
        if (!PRODUCT_BY_SLUG.has(slug)) return
        const lines = get().lines
        const existing = lines.find((l) => l.slug === slug)
        const nextQty = clampQty(slug, (existing?.qty ?? 0) + qty)
        if (nextQty === 0) return
        set({
          lines: existing
            ? lines.map((l) => (l.slug === slug ? { ...l, qty: nextQty } : l))
            : [...lines, { slug, qty: nextQty }],
          lastRemoved: null,
        })
      },

      setQty: (slug, qty) => {
        const next = clampQty(slug, qty)
        if (next === 0) {
          get().remove(slug)
          return
        }
        set({ lines: get().lines.map((l) => (l.slug === slug ? { ...l, qty: next } : l)) })
      },

      remove: (slug) => {
        const lines = get().lines
        const index = lines.findIndex((l) => l.slug === slug)
        if (index < 0) return
        const line = lines[index]
        if (!line) return
        set({
          lines: lines.filter((l) => l.slug !== slug),
          lastRemoved: { line, index },
        })
      },

      undoRemove: () => {
        const removed = get().lastRemoved
        if (!removed) return
        const lines = [...get().lines]
        lines.splice(Math.min(removed.index, lines.length), 0, removed.line)
        set({ lines, lastRemoved: null })
      },

      clear: () => set({ lines: [], lastRemoved: null }),

      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'sky-import:cart:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      /**
       * Saneo al rehidratar: si un producto desapareció del catálogo o su cantidad
       * quedó por encima de las unidades configuradas, la línea se corrige en vez
       * de arrastrar un dato imposible.
       */
      merge: (persisted, current) => {
        const raw = (persisted as { lines?: unknown } | undefined)?.lines
        const lines = Array.isArray(raw)
          ? raw
              .filter(
                (l): l is CartLine =>
                  typeof l === 'object' &&
                  l !== null &&
                  typeof (l as CartLine).slug === 'string' &&
                  typeof (l as CartLine).qty === 'number',
              )
              .map((l) => ({ slug: l.slug, qty: clampQty(l.slug, Math.floor(l.qty)) }))
              .filter((l) => l.qty > 0)
          : []
        return { ...current, lines }
      },
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
    },
  ),
)

// ─────────────────────────────────────────────────────── selectores derivados

export function resolveLines(lines: CartLine[]): CartLineResolved[] {
  return lines.flatMap((line) => {
    const product = PRODUCT_BY_SLUG.get(line.slug)
    if (!product) return []
    return [
      {
        ...line,
        product,
        max: product.units,
        lineTotalUsd: product.priceUsd * line.qty,
      },
    ]
  })
}

export interface CartTotals {
  count: number
  subtotalUsd: number
  shippingUsd: number
  totalUsd: number
  /** Cuánto falta en USD para el envío bonificado; `0` si ya aplica. */
  toFreeShippingUsd: number
}

export function totalsOf(resolved: CartLineResolved[]): CartTotals {
  const subtotalUsd = resolved.reduce((sum, l) => sum + l.lineTotalUsd, 0)
  const count = resolved.reduce((sum, l) => sum + l.qty, 0)
  const qualifies = subtotalUsd >= RULES.freeShippingUsd
  const shippingUsd = count === 0 || qualifies ? 0 : RULES.shippingUsd
  return {
    count,
    subtotalUsd,
    shippingUsd,
    totalUsd: subtotalUsd + shippingUsd,
    toFreeShippingUsd: qualifies ? 0 : Math.max(0, RULES.freeShippingUsd - subtotalUsd),
  }
}
