'use client'

import { useEffect } from 'react'
import { damp, onFrame } from '@/lib/motion'

/**
 * EL CURSOR DE LA CASA
 *
 * Un punto que va pegado al puntero y un retículo que llega con retardo y **se
 * acopla al objetivo**: al pasar sobre algo pulsable, adopta su rectángulo como
 * una mira que engancha, y al salir vuelve a su tamaño de reposo.
 *
 * Ese acoplamiento es lo que arregla la sensación de «cursor raro» de la primera
 * versión: antes solo reaccionaba a los pocos elementos con `data-cursor`
 * escrito a mano, así que la mayor parte de la interfaz —botones, campos,
 * enlaces del pie— no le decía nada y el retículo flotaba sin sentido. Ahora el
 * estado se **deduce del elemento**: cualquier control interactivo lo engancha,
 * y `data-cursor` queda solo para los casos con vocabulario propio (ver una
 * ficha, arrastrar una vista).
 *
 * Dos lecciones que este componente respeta y conviene no deshacer:
 *
 *   1. **El puntero nativo se apaga desde JavaScript, nunca desde CSS suelto.**
 *      La clase la pone este componente cuando ya dibujó sus nodos. Si no corre,
 *      el visitante conserva su puntero.
 *   2. **Los nodos cuelgan directos del `body`.** Cualquier contenedor con
 *      `position` y `z-index` crea un contexto de apilado que rompería la mezcla
 *      y podría recortarlos.
 */

/** Lo que engancha el retículo aunque nadie haya escrito un atributo. */
const TARGETS =
  'a[href], button:not(:disabled), [role="button"], label, summary, select, [data-cursor]'

/** Lo que convierte el retículo en un cursor de texto. */
const TEXTUAL = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea'

export function Cursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const ring = document.createElement('div')
    ring.className = 'cur-ring'
    const label = document.createElement('span')
    label.className = 'cur-label'
    ring.appendChild(label)

    const dot = document.createElement('div')
    dot.className = 'cur-dot'

    document.body.append(ring, dot)
    document.documentElement.setAttribute('data-cursor', 'on')

    let px = window.innerWidth / 2
    let py = window.innerHeight / 2
    let rx = px
    let ry = py
    let visible = false

    /** Objetivo enganchado, si lo hay. */
    let locked: Element | null = null

    const clearLock = () => {
      locked = null
      ring.removeAttribute('data-lock')
      dot.removeAttribute('data-lock')
      ring.style.width = ''
      ring.style.height = ''
      ring.style.margin = ''
    }

    const applyLock = (element: Element) => {
      const rect = element.getBoundingClientRect()
      const w = Math.round(rect.width + 12)
      const h = Math.round(rect.height + 12)
      ring.style.width = `${w}px`
      ring.style.height = `${h}px`
      ring.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`
      ring.setAttribute('data-lock', '')
      dot.setAttribute('data-lock', '')
    }

    const setState = (state: string, text: string) => {
      if (ring.dataset.state !== state) {
        ring.dataset.state = state
        label.textContent = text
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      px = event.clientX
      py = event.clientY

      if (!visible) {
        visible = true
        rx = px
        ry = py
        dot.setAttribute('data-on', '')
        ring.setAttribute('data-on', '')
      }

      const target = event.target as Element | null
      if (!target?.closest) return

      // Campos de texto: el retículo se vuelve una barra y el puntero nativo
      // reaparece (lo hace el CSS), porque escribir sin cursor de texto es hostil.
      if (target.closest(TEXTUAL)) {
        clearLock()
        setState('text', '')
        return
      }

      const hit = target.closest(TARGETS)
      if (!hit) {
        clearLock()
        setState('', '')
        return
      }

      const declared = hit.getAttribute('data-cursor') ?? ''

      // Los estados con vocabulario propio no se enganchan: tienen su forma.
      if (declared === 'product' || declared === 'drag') {
        clearLock()
        setState(declared, hit.getAttribute('data-cursor-label') ?? '')
        return
      }

      setState('', '')
      if (locked !== hit) {
        locked = hit
        applyLock(hit)
      }
    }

    const onLeave = () => {
      visible = false
      dot.removeAttribute('data-on')
      ring.removeAttribute('data-on')
      clearLock()
    }

    const onDown = () => ring.setAttribute('data-press', '')
    const onUp = () => ring.removeAttribute('data-press')

    // Si el objetivo enganchado se va (navegación, filtro, cierre de panel),
    // el retículo tiene que soltarlo o se quedaría con su tamaño para siempre.
    const onScrollOrResize = () => {
      if (locked && !locked.isConnected) clearLock()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    const stop = onFrame((_, delta) => {
      if (locked) {
        // Enganchado: el retículo va al centro del objetivo, no al puntero.
        if (!locked.isConnected) {
          clearLock()
        } else {
          const rect = locked.getBoundingClientRect()
          rx = damp(rx, rect.left + rect.width / 2, 22, delta)
          ry = damp(ry, rect.top + rect.height / 2, 22, delta)
        }
      } else if (reduced.matches) {
        rx = px
        ry = py
      } else {
        rx = damp(rx, px, 17, delta)
        ry = damp(ry, py, 17, delta)
      }

      dot.style.transform = `translate3d(${px}px, ${py}px, 0)`
      const press = ring.hasAttribute('data-press') ? ' scale(0.94)' : ''
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)${press}`
    })

    const onPointerChange = () => {
      if (!fine.matches) teardown()
    }
    fine.addEventListener('change', onPointerChange)

    function teardown() {
      stop()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      fine.removeEventListener('change', onPointerChange)
      ring.remove()
      dot.remove()
      document.documentElement.removeAttribute('data-cursor')
    }

    return teardown
  }, [])

  return null
}
