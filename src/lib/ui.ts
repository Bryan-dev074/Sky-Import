'use client'

import { create } from 'zustand'

export interface Toast {
  id: number
  text: string
  /** Acción opcional — «Deshacer» en vez de pedir confirmación antes de quitar. */
  action?: { label: string; run: () => void }
}

interface UiState {
  cartOpen: boolean
  menuOpen: boolean
  toasts: Toast[]
  openCart: () => void
  closeCart: () => void
  toggleMenu: (open?: boolean) => void
  toast: (text: string, action?: Toast['action']) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useUi = create<UiState>()((set, get) => ({
  cartOpen: false,
  menuOpen: false,
  toasts: [],

  openCart: () => set({ cartOpen: true, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  toggleMenu: (open) => set((s) => ({ menuOpen: open ?? !s.menuOpen, cartOpen: false })),

  toast: (text, action) => {
    seq += 1
    const id = seq
    set({ toasts: [...get().toasts, { id, text, action }].slice(-3) })
    window.setTimeout(() => get().dismiss(id), action ? 6000 : 3600)
  },

  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
