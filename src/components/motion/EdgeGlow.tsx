'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/lib/motion'

/**
 * BORDE ENERGIZADO
 *
 * Envuelve la acción principal de una vista. El canto se enciende por el lado
 * por el que se acerca el puntero: cuanto más cerca del borde, más fuerte, y el
 * cono de luz sigue el ángulo desde el centro. En reposo late despacio, para
 * invitar sin gritar.
 *
 * Adaptado de `BorderGlow` de React Bits (MIT + Commons Clause,
 * <https://reactbits.dev>) a la paleta y a las reglas de este proyecto: un solo
 * color —el cian de instrumento—, radio de 3 px en vez de 28 (la casa no tiene
 * píldoras) y el degradado de malla multicolor sustituido por el canto de una
 * pieza recibiendo corriente. La atribución está en `CREDITS.md`.
 *
 * Es la ÚNICA excepción a la prohibición de brillo del sistema, y vive en una
 * sola acción por vista.
 */
export function EdgeGlow({
  children,
  className,
  /** Cuánto hay que acercarse al borde para que encienda, 0–100. */
  sensitivity = 22,
  /** Latido permanente en reposo. */
  idle = true,
}: {
  children: ReactNode
  className?: string
  sensitivity?: number
  idle?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLSpanElement>) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const dx = event.clientX - rect.left - cx
    const dy = event.clientY - rect.top - cy

    // Proximidad al borde: 0 en el centro, 100 justo sobre el canto.
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx)
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy)
    const proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360

    node.style.setProperty('--edge-proximity', proximity.toFixed(2))
    node.style.setProperty('--cursor-angle', `${angle.toFixed(2)}deg`)
  }, [])

  const onPointerLeave = useCallback(() => {
    ref.current?.style.setProperty('--edge-proximity', '0')
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--edge-sensitivity', String(sensitivity))
  }, [sensitivity])

  return (
    <span
      ref={ref}
      className={`u-edge ${className ?? ''}`}
      data-idle={idle && !reduced ? '' : undefined}
      onPointerMove={reduced ? undefined : onPointerMove}
      onPointerLeave={reduced ? undefined : onPointerLeave}
    >
      <span className="u-edge__light" aria-hidden="true" />
      {children}
    </span>
  )
}
