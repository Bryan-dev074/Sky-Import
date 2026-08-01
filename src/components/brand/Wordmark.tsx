'use client'

import type { CSSProperties } from 'react'
import { SITE } from '@/config/site'

/**
 * EL SELLO
 *
 * La marca gráfica es el motivo de la casa reducido a su mínima expresión: una
 * pista que sale del canto inferior izquierdo, sube en un codo de 45° y termina
 * en una vía. Es un trazado de placa y también una línea que asciende — el
 * «sky» del nombre. Legible a 16 px.
 *
 * Y tiene movimiento propio, que es lo que la convierte en una marca viva:
 *
 *   · `draw`  — las pistas se trazan al entrar, como si se imprimieran.
 *   · `pulse` — una carga recorre la pista en bucle y la vía late. Es el modo
 *               de la intro.
 *   · `hover` — en reposo está quieta; al acercarse al sello, la carga sale.
 *               Es el modo del encabezado, para que no compita con la lectura.
 *
 * La marca denominativa es intocable: Archivo 700, versalitas, tracking 0.22em,
 * jamás degradada y jamás con sombra. Lo único que se le permite es que sus
 * letras se levanten escalonadas al acercarse.
 */

export type MarkMotion = 'none' | 'draw' | 'pulse' | 'hover'

export function BrandMark({
  size = 26,
  className,
  animate = 'hover',
}: {
  size?: number
  className?: string
  animate?: MarkMotion
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={`mark ${className ?? ''}`}
      data-motion={animate}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className="mark__case"
        x={1}
        y={1}
        width={30}
        height={30}
        rx={2}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.42}
      />

      {/* Pista principal */}
      <path
        className="mark__trace"
        d="M5 25 H12 L20 17 H24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="square"
      />
      {/* Pista secundaria */}
      <path
        className="mark__trace mark__trace--thin"
        d="M5 19 H9 L15 13 H24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.5}
        strokeLinecap="square"
      />
      {/* La carga que recorre la pista */}
      <path
        className="mark__charge"
        d="M5 25 H12 L20 17 H24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      <circle
        className="mark__via"
        cx={26}
        cy={17}
        r={2.6}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
      />
      <circle className="mark__pad" cx={26} cy={13} r={1.2} fill="currentColor" opacity={0.5} />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  const letters = `${SITE.wordmark[0]} ${SITE.wordmark[1]}`.split('')
  return (
    <span
      className={`wordmark font-display font-bold leading-none tracking-[0.22em] uppercase ${className ?? ''}`}
      // Las letras van partidas para poder levantarlas una a una, así que esto
      // es decoración: el nombre accesible lo pone quien la envuelve (el enlace
      // del encabezado, el `sr-only` del pie). `aria-label` sobre un <span>
      // genérico está prohibido por ARIA y axe lo marca.
      aria-hidden="true"
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          className="wordmark__l"
          style={{ transitionDelay: `${i * 22}ms`, '--wordmark-i': i } as CSSProperties}
        >
          {letter === ' ' ? ' ' : letter}
        </span>
      ))}
    </span>
  )
}
