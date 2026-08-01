'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Trace } from '@/components/motif/Trace'
import { BrandMark } from '@/components/brand/Wordmark'
import { useI18n } from '@/lib/i18n/context'
import { SITE } from '@/config/site'

/**
 * ENERGIZACIÓN — la intro de marca.
 *
 * Cuatro compases: la placa se enciende, la corriente recorre el trazado, el
 * sello se escribe letra por letra desde sus máscaras, y **la cortina se
 * desarma**: está hecha de lamas verticales que se retiran en secuencia,
 * alternando arriba y abajo, dejando ver la tienda por franjas. Es el gesto de
 * un panel lateral de gabinete saliendo, no un corte.
 *
 * Reglas que se respetan al pie:
 *
 *   · Solo en carga completa o recarga real. Al navegar entre páginas no vuelve
 *     a aparecer, porque vive en el layout del idioma y no se vuelve a montar.
 *   · Entre que el sello termina de escribirse y la cortina arranca hay un
 *     compás de sostén: la corriente recorre el sello y la línea una vez. Sin
 *     él la intro se sentía un parpadeo —era la queja— porque la cortina se
 *     abría encima de la última letra.
 *   · La primera lama se va a los 1,36 s y la última termina a los ~2,3 s: la
 *     tienda empieza a verse mucho antes de que acabe la salida, y desde el
 *     primer movimiento de lama el panel ya no captura el puntero.
 *   · No inventa un porcentaje de carga.
 *   · Con `prefers-reduced-motion` no llega a pintarse.
 *   · Se puede omitir con un clic, con Escape o con el botón.
 *   · **Todo el recorrido es CSS.** El script solo desmonta el nodo al final y
 *     permite adelantarlo. Si la hidratación fallara, las lamas se van igual.
 */

const SLATS = 12
/** Cuándo arranca la primera lama. Debe coincidir con el CSS. */
const CURTAIN_MS = 1360
/** Última lama fuera de pantalla. Debe coincidir con el CSS. */
const OUT_MS = CURTAIN_MS + (SLATS - 1) * 38 + 520 + 60

const skipStore = {
  subscribe: () => () => {},
  get: () => document.documentElement.getAttribute('data-intro') === 'skip',
  server: () => false,
}

export function Intro() {
  const { t } = useI18n()
  const skip = useSyncExternalStore(skipStore.subscribe, skipStore.get, skipStore.server)
  const [phase, setPhase] = useState<'running' | 'leaving' | 'gone'>('running')
  const [skipVisible, setSkipVisible] = useState(false)
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('leaving')
    window.setTimeout(() => setPhase('gone'), 460)
  }, [])

  useEffect(() => {
    if (skip) return

    document.documentElement.setAttribute('data-intro-running', '')

    // Recorrido normal: las lamas se van solas por CSS y el nodo se retira
    // cuando la última terminó.
    const settle = window.setTimeout(() => {
      doneRef.current = true
      setPhase('gone')
    }, OUT_MS)

    const hint = window.setTimeout(() => setSkipVisible(true), 460)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(settle)
      window.clearTimeout(hint)
      window.removeEventListener('keydown', onKey)
      document.documentElement.removeAttribute('data-intro-running')
    }
  }, [finish, skip])

  if (skip || phase === 'gone') return null

  const letters = `${SITE.wordmark[0]} ${SITE.wordmark[1]}`.split('')

  return (
    <div
      className="intro"
      data-leaving={phase === 'leaving' ? '' : undefined}
      onClick={finish}
      role="presentation"
    >
      {/* Las lamas son la cortina. Se retiran alternando arriba y abajo. */}
      <div className="intro__slats" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (
          <span key={i} className="intro__slat" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      <div className="intro__field" aria-hidden="true">
        <Trace width={1400} height={420} lines={7} seed={19} drawable className="intro__trace" />
      </div>

      <div className="intro__center">
        <span className="intro__mark" aria-hidden="true">
          <BrandMark size={34} animate="pulse" />
        </span>
        <span className="intro__seal" aria-label={SITE.name}>
          {letters.map((letter, i) => (
            <span key={i} className="intro__mask" aria-hidden="true">
              <span className="intro__letter" style={{ animationDelay: `${300 + i * 42}ms` }}>
                {letter === ' ' ? ' ' : letter}
              </span>
            </span>
          ))}
        </span>
        <span className="intro__line" aria-hidden="true" />
        <span className="intro__legend" aria-hidden="true">
          {t('brand.role')} · {SITE.city}
        </span>
      </div>

      <button
        type="button"
        className="intro__skip"
        data-visible={skipVisible ? '' : undefined}
        onClick={(event) => {
          event.stopPropagation()
          finish()
        }}
      >
        {t('intro.skip')}
      </button>
    </div>
  )
}
