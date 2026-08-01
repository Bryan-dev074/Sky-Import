'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { useFinePointer, useInView, usePrefersReducedMotion } from '@/lib/motion'

/**
 * PARCHE DE CAMPO — el campo de vías dentro de una sección.
 *
 * El fondo vivo de la casa es un lienzo fijo a pantalla completa que vive en
 * `z-index: -1`, detrás de todo. Funciona mientras la sección deja pasar el
 * color de la página; en cuanto una superficie se pinta opaca —el bloque de
 * aluminio, por ejemplo— lo tapa y ese tramo se queda como un plano de color
 * liso y muerto.
 *
 * Este componente lleva el mismo campo DENTRO de esa sección, con su propia
 * densidad y su propia intensidad. Dos reglas que lo hacen barato:
 *
 *   · **Solo existe mientras se ve.** No es que se pause: se desmonta. Fuera de
 *     pantalla no hay lienzo, ni bucle, ni memoria.
 *   · Hereda los mismos porteros que el fondo global: puntero fino y sin
 *     movimiento reducido, o no se descarga siquiera.
 */
const CircuitField = dynamic(() => import('@/components/background/CircuitField'), { ssr: false })

export function FieldPatch({
  className,
  spacing = 32,
  reach = 230,
  bulge = 13,
  intensity = 0.8,
}: {
  className?: string
  spacing?: number
  reach?: number
  bulge?: number
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, threshold: 0, rootMargin: '15% 0px' })
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
      aria-hidden="true"
    >
      {fine && !reduced && inView ? (
        <CircuitField
          className="h-full w-full"
          spacing={spacing}
          reach={reach}
          bulge={bulge}
          intensity={intensity}
        />
      ) : null}
    </div>
  )
}
