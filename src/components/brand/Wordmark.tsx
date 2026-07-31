import { SITE } from '@/config/site'

/**
 * EL SELLO
 *
 * La marca denominativa es intocable: Archivo 700, versalitas, tracking 0.22em,
 * jamás degradada y jamás con sombra.
 *
 * La marca gráfica es el motivo de la casa reducido a su mínima expresión: una
 * pista que sale del canto inferior izquierdo, sube en un codo de 45° y termina
 * en una vía. Es un trazado de placa y es también una línea que asciende — el
 * «sky» del nombre. Legible a 16 px.
 */

export function BrandMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x={1} y={1} width={30} height={30} rx={2} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.42} />
      <path
        d="M5 25 H12 L20 17 H24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="square"
      />
      <path
        d="M5 19 H9 L15 13 H24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.5}
        strokeLinecap="square"
      />
      <circle cx={26} cy={17} r={2.6} fill="none" stroke="currentColor" strokeWidth={1.75} />
      <circle cx={26} cy={13} r={1.2} fill="currentColor" opacity={0.5} />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-display font-bold leading-none tracking-[0.22em] uppercase ${className ?? ''}`}
    >
      {SITE.wordmark[0]}
      <span className="text-accent"> </span>
      {SITE.wordmark[1]}
    </span>
  )
}
