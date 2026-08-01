'use client'

import { useEffect } from 'react'
import { damp, onFrame } from '@/lib/motion'

/**
 * EL CURSOR DE LA CASA
 *
 * Un punto que va pegado al puntero y un retículo que llega con retardo. Sobre
 * algo pulsable **se cierra y se enciende en cian**.
 *
 * Lo que arregla la sensación de «cursor raro» de la primera versión es que el
 * estado se **deduce del elemento** —cualquier control interactivo lo cambia— y
 * no de un atributo escrito a mano en unos pocos sitios. `data-cursor` queda
 * solo para los casos con vocabulario propio (ver una ficha, arrastrar una
 * vista).
 *
 * Se probó que el retículo adoptara el RECTÁNGULO del objetivo, como una mira
 * que engancha. Sobre una ficha de producto o una celda del índice eso convertía
 * el cursor en un marco de media pantalla, así que se quitó: el retículo tiene
 * tamaño fijo y solo cambia de estado.
 *
 * Dos lecciones que este componente respeta y conviene no deshacer:
 *
 *   1. **El puntero nativo se apaga desde JavaScript, nunca desde CSS suelto.**
 *      La marca la pone este componente cuando ya dibujó sus nodos. Si no corre,
 *      el visitante conserva su puntero. Esa marca es `data-pointer`, NO
 *      `data-cursor`: la raíz llevaba antes `data-cursor="on"` y como el
 *      selector de objetivos incluye `[data-cursor]`, `closest()` subía hasta
 *      `<html>` y lo devolvía como objetivo. De ahí el cursor que «agarraba
 *      toda la pantalla». Son dos vocabularios distintos y no deben compartir
 *      nombre.
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
    document.documentElement.setAttribute('data-pointer', 'hidden')

    let px = window.innerWidth / 2
    let py = window.innerHeight / 2
    let rx = px
    let ry = py
    let visible = false

    const setState = (state: string, text: string) => {
      if (ring.dataset.state === state) return
      ring.dataset.state = state
      label.textContent = text
      if (state === '' || state === 'text') dot.removeAttribute('data-engaged')
      else dot.setAttribute('data-engaged', '')
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
        setState('text', '')
        return
      }

      const hit = target.closest(TARGETS)
      if (!hit) {
        setState('', '')
        return
      }

      const declared = hit.getAttribute('data-cursor') ?? ''
      if (declared === 'product' || declared === 'drag') {
        setState(declared, hit.getAttribute('data-cursor-label') ?? '')
        return
      }

      setState('link', '')
    }

    const onLeave = () => {
      visible = false
      dot.removeAttribute('data-on')
      ring.removeAttribute('data-on')
    }

    const onDown = () => ring.setAttribute('data-press', '')
    const onUp = () => ring.removeAttribute('data-press')

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    const stop = onFrame((_, delta) => {
      if (reduced.matches) {
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
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      fine.removeEventListener('change', onPointerChange)
      ring.remove()
      dot.remove()
      document.documentElement.removeAttribute('data-pointer')
    }

    return teardown
  }, [])

  return null
}
