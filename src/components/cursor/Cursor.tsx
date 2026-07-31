'use client'

import { useEffect } from 'react'

/**
 * EL CURSOR DE LA CASA
 *
 * Un punto de 4 px que sigue al instante y un retículo cuadrado que llega con
 * retardo. Cuadrado, no círculo: es un instrumento de medida, no una burbuja.
 *
 * Dos lecciones que este componente respeta y que conviene no deshacer:
 *
 *   1. **El puntero nativo se apaga desde JavaScript, nunca desde CSS suelto.**
 *      La clase que lo oculta la pone este componente cuando ya dibujó sus nodos.
 *      Si el componente no corre —error, bundle que no carga, navegador raro—
 *      el visitante conserva su puntero.
 *   2. **Los nodos cuelgan directos del `body`.** Cualquier contenedor con
 *      `position` y `z-index` crea un contexto de apilado y rompe el modo de
 *      mezcla; además evita que un `overflow` los recorte.
 *
 * Se apaga entero en punteros imprecisos (táctil) y con movimiento reducido no
 * hay retardo: el retículo va pegado al punto.
 *
 * El estado por zona se declara con `data-cursor` en el elemento; no hay una
 * lista de selectores acá dentro que se desincronice del marcado.
 */

const LERP = 0.19

export function Cursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const dot = document.createElement('div')
    dot.className = 'cur-dot'
    const ring = document.createElement('div')
    ring.className = 'cur-ring'
    const label = document.createElement('span')
    label.className = 'cur-label'
    ring.appendChild(label)

    document.body.append(dot, ring)
    document.documentElement.setAttribute('data-cursor', 'on')

    let px = window.innerWidth / 2
    let py = window.innerHeight / 2
    let rx = px
    let ry = py
    let raf = 0
    let visible = false

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

      const target = (event.target as Element | null)?.closest?.('[data-cursor]') ?? null
      const state = target?.getAttribute('data-cursor') ?? ''
      if (ring.dataset.state !== state) {
        ring.dataset.state = state
        label.textContent = target?.getAttribute('data-cursor-label') ?? ''
      }
    }

    const onLeave = () => {
      visible = false
      dot.removeAttribute('data-on')
      ring.removeAttribute('data-on')
    }

    const onDown = () => ring.setAttribute('data-press', '')
    const onUp = () => ring.removeAttribute('data-press')

    const frame = () => {
      if (reduced.matches) {
        rx = px
        ry = py
      } else {
        rx += (px - rx) * LERP
        ry += (py - ry) * LERP
      }
      dot.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%)`
      raf = window.requestAnimationFrame(frame)
    }
    raf = window.requestAnimationFrame(frame)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    // Si aparece un puntero grueso (tableta con lápiz retirado, modo tacto), se retira.
    const onPointerChange = () => {
      if (!fine.matches) teardown()
    }
    fine.addEventListener('change', onPointerChange)

    function teardown() {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      fine.removeEventListener('change', onPointerChange)
      dot.remove()
      ring.remove()
      document.documentElement.removeAttribute('data-cursor')
    }

    return teardown
  }, [])

  return null
}
