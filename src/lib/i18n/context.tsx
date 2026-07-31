'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { makeT, type Translate } from './dictionary'
import type { L10n, Locale } from './locales'

interface I18nValue {
  locale: Locale
  t: Translate
  /** Resuelve un texto de datos que existe en los dos idiomas. */
  l: (value: L10n | string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const t = makeT(locale)
    return {
      locale,
      t,
      l: (value) => (typeof value === 'string' ? value : value[locale]),
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  return value
}

/** Prefija una ruta interna con el idioma actual. */
export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path === '/' ? '' : path}`
}
