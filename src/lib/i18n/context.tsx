'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { makeT, type Translate } from './dictionary'
import { LOCALE_META, LOCALES, type L10n, type Locale } from './locales'

/**
 * IDIOMA SIN RECARGA
 *
 * El idioma sigue viviendo en la ruta —para que las dos versiones se generen
 * estáticamente y el primer pintado llegue ya traducido— pero **cambiarlo no
 * navega**. Es estado de cliente:
 *
 *   1. Se inicializa con el segmento de la URL, así que el HTML del servidor y
 *      el primer render del cliente coinciden y no hay parpadeo.
 *   2. Al cambiarlo, todo el texto se vuelve a leer del diccionario, que ya está
 *      en el paquete del cliente. No hay viaje al servidor ni remontaje de la
 *      página: el scroll, el carrito y el armado se quedan donde estaban.
 *   3. La URL se corrige con `replaceState` para que siga siendo compartible, y
 *      se guarda una cookie para que la próxima visita entre directo al idioma
 *      elegido.
 *
 * Consecuencia de diseño: todo componente que muestre texto traducible es de
 * cliente y lo lee de este contexto. Ninguno recibe `locale` por prop.
 */

interface I18nValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: Translate
  /** Resuelve un texto de datos que existe en los dos idiomas. */
  l: (value: L10n | string) => string
  /** Prefija una ruta interna con el idioma actual. */
  path: (route: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

const COOKIE = 'sky-import:locale'

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState((current) => {
      if (current === next) return current

      const html = document.documentElement
      html.lang = LOCALE_META[next].htmlLang

      // La URL acompaña al cambio sin provocar una navegación.
      const { pathname, search, hash } = window.location
      const rest = pathname.replace(/^\/(es|pt)(?=\/|$)/, '') || ''
      window.history.replaceState(null, '', `/${next}${rest}${search}${hash}`)

      try {
        document.cookie = `${COOKIE}=${next};path=/;max-age=31536000;samesite=lax`
      } catch {
        // Sin cookies: la elección vale para esta visita.
      }

      return next
    })
  }, [])

  const value = useMemo<I18nValue>(() => {
    const t = makeT(locale)
    return {
      locale,
      setLocale,
      t,
      l: (input) => (typeof input === 'string' ? input : input[locale]),
      path: (route) => `/${locale}${route === '/' ? '' : route}`,
    }
  }, [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  return value
}

export const LOCALE_LIST = LOCALES
