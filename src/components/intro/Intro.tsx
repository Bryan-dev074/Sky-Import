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
 * sello se escribe letra por letra desde sus máscaras, y el paño sube dejando el
 * hero limpio.
 *
 * Reglas que se respetan al pie:
 *
 *   · Solo en carga completa o recarga real. Al navegar entre páginas no vuelve
 *     a aparecer, porque el componente vive en el layout del idioma y no se
 *     vuelve a montar.
 *   · Duración objetivo 1,25 s. TOPE DURO 1,75 s.
 *   · No inventa un porcentaje de carga.
 *   · Con `prefers-reduced-motion` no llega a pintarse: un script previo al
 *     primer pintado marca `<html data-intro="skip">`, el CSS la oculta y este
 *     componente ni siquiera monta el nodo.
 *   · Se puede omitir con un clic, con Escape o con el botón.
 *   · **Todo el movimiento es CSS.** Si la hidratación fallara, el marcado del
 *     servidor seguiría en pantalla; por eso el paño sube por animación y no por
 *     JavaScript. El script solo adelanta la salida y desmonta el nodo.
 */

const HARD_CAP_MS = 1750
const PLANNED_MS = 1250

/** Lee el atributo que escribió el script previo al pintado. */
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
    // El paño tarda 480 ms en salir; después se desmonta de verdad.
    window.setTimeout(() => setPhase('gone'), 520)
  }, [])

  useEffect(() => {
    if (skip) return

    document.documentElement.setAttribute('data-intro-running', '')

    const planned = window.setTimeout(finish, PLANNED_MS)
    // Tope duro: la tienda no queda nunca rehén de la animación.
    const cap = window.setTimeout(finish, HARD_CAP_MS)
    const hint = window.setTimeout(() => setSkipVisible(true), 600)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(planned)
      window.clearTimeout(cap)
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
      <div className="intro__field" aria-hidden="true">
        <Trace width={1400} height={420} lines={7} seed={19} drawable className="intro__trace" />
      </div>

      <div className="intro__center">
        <span className="intro__mark" aria-hidden="true">
          <BrandMark size={34} />
        </span>
        <span className="intro__seal" aria-label={SITE.name}>
          {letters.map((letter, i) => (
            <span key={i} className="intro__mask" aria-hidden="true">
              <span className="intro__letter" style={{ animationDelay: `${260 + i * 42}ms` }}>
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
