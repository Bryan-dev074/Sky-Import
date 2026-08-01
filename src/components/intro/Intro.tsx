'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Trace } from '@/components/motif/Trace'
import { BrandMark } from '@/components/brand/Wordmark'
import { useI18n } from '@/lib/i18n/context'
import { SITE } from '@/config/site'
import { INTRO_TIMING } from '@/lib/introTiming'

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
 *   · La primera lama se va a los 2,7 s y la última termina cerca de los 3,9 s:
 *     antes hay un encendido visible de circuitos y un sostén real de marca.
 *     Desde el primer movimiento de lama el panel ya no captura el puntero.
 *   · No inventa un porcentaje de carga.
 *   · Con `prefers-reduced-motion` no llega a pintarse.
 *   · Se puede omitir con un clic, con Escape o con el botón.
 *   · **Todo el recorrido es CSS.** El script solo desmonta el nodo al final y
 *     permite adelantarlo. Si la hidratación fallara, las lamas se van igual.
 */

const SLATS = INTRO_TIMING.slats
const NODES = [
  [9, 18, 0],
  [18, 72, 280],
  [29, 34, 760],
  [38, 84, 420],
  [52, 13, 980],
  [61, 67, 180],
  [72, 29, 610],
  [83, 79, 850],
  [91, 43, 330],
] as const

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
    }, INTRO_TIMING.totalMs)

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
      style={
        {
          '--intro-curtain': `${INTRO_TIMING.curtainMs}ms`,
          '--intro-stagger': `${INTRO_TIMING.staggerMs}ms`,
          '--intro-slat-duration': `${INTRO_TIMING.slatDurationMs}ms`,
        } as React.CSSProperties
      }
    >
      {/* Las lamas son la cortina. Se retiran alternando arriba y abajo. */}
      <div className="intro__slats" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (
          <span key={i} className="intro__slat" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      <div className="intro__field" aria-hidden="true">
        <Trace width={1400} height={420} lines={7} seed={19} drawable className="intro__trace" />
        <Trace width={1400} height={420} lines={5} seed={73} drawable className="intro__trace intro__trace--echo" />
        <span className="intro__scan" />
        <span className="intro__nodes">
          {NODES.map(([x, y, delay], index) => (
            <span
              key={index}
              className="intro__node"
              style={
                {
                  '--x': `${x}%`,
                  '--y': `${y}%`,
                  '--node-delay': `${delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      </div>

      <div className="intro__center">
        <span className="intro__mark" aria-hidden="true">
          <span className="intro__mark-orbit" />
          <BrandMark size={44} animate="pulse" />
        </span>
        <span className="intro__seal" aria-label={SITE.name}>
          {letters.map((letter, i) => (
            <span key={i} className="intro__mask" aria-hidden="true">
              <span className="intro__letter" style={{ animationDelay: `${520 + i * 62}ms` }}>
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
