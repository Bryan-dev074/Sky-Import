'use client'

import dynamic from 'next/dynamic'
import { useFinePointer, usePrefersReducedMotion } from '@/lib/motion'

/**
 * El fondo vivo de la tienda, con su portero.
 *
 * `CircuitField` solo se pide —y solo existe— cuando de verdad aporta: con
 * puntero fino y sin movimiento reducido. En teléfono y con movimiento reducido
 * no se descarga siquiera, y queda la retícula estática de CSS que ya está en la
 * página. Es la misma regla que gobierna el resto de lo caro del proyecto.
 */
const CircuitField = dynamic(() => import('@/components/background/CircuitField'), { ssr: false })

export function LiveBackground() {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  if (!fine || reduced) return null
  return <CircuitField className="u-backdrop" spacing={28} reach={240} bulge={15} intensity={0.9} />
}
