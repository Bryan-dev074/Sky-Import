export const LOCALES = ['es', 'pt'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

/** Texto que existe obligatoriamente en los dos idiomas. */
export type L10n = Record<Locale, string>

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export const LOCALE_META: Record<Locale, { htmlLang: string; label: string; short: string }> = {
  es: { htmlLang: 'es-PY', label: 'Español', short: 'ES' },
  pt: { htmlLang: 'pt-BR', label: 'Português', short: 'PT' },
}
