'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { PRODUCT_BY_SLUG } from '@/lib/catalog/products'
import { BUILD_SLOTS, type Build, type BuildSlot } from '@/lib/compat'

interface BuildState {
  /** Guarda slugs, no productos: el catálogo puede cambiar entre visitas. */
  picks: Partial<Record<BuildSlot, string>>
  hydrated: boolean
  pick: (slot: BuildSlot, slug: string) => void
  unpick: (slot: BuildSlot) => void
  reset: () => void
  markHydrated: () => void
}

export const useBuild = create<BuildState>()(
  persist(
    (set, get) => ({
      picks: {},
      hydrated: false,
      pick: (slot, slug) => set({ picks: { ...get().picks, [slot]: slug } }),
      unpick: (slot) => {
        const next = { ...get().picks }
        delete next[slot]
        set({ picks: next })
      },
      reset: () => set({ picks: {} }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'sky-import:build:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ picks: state.picks }),
      merge: (persisted, current) => {
        const raw = (persisted as { picks?: unknown } | undefined)?.picks
        const picks: Partial<Record<BuildSlot, string>> = {}
        if (raw && typeof raw === 'object') {
          for (const slot of BUILD_SLOTS) {
            const value = (raw as Record<string, unknown>)[slot]
            // Saneo: una pieza que ya no existe en el catálogo se descarta.
            if (typeof value === 'string' && PRODUCT_BY_SLUG.has(value)) picks[slot] = value
          }
        }
        return { ...current, picks }
      },
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
    },
  ),
)

export function resolveBuild(picks: Partial<Record<BuildSlot, string>>): Build {
  const build: Build = {}
  for (const slot of BUILD_SLOTS) {
    const slug = picks[slot]
    if (!slug) continue
    const product = PRODUCT_BY_SLUG.get(slug)
    if (product) build[slot] = product
  }
  return build
}
