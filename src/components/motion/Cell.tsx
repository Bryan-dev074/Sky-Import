'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { damp, onFrame, useFinePointer, usePrefersReducedMotion } from '@/lib/motion'

/**
 * CELDAS — la retícula viva del índice de categorías.
 *
 * Cada celda reacciona por **proximidad**, no por hover: el canto empieza a
 * encenderse antes de que el puntero llegue, la celda se inclina y se acerca un
 * poco al cursor, y al pulsar nace una chispa donde se tocó. Sobre toda la
 * sección flota un foco que sigue al puntero.
 *
 * Adaptado de `MagicBento` de React Bits (MIT + Commons Clause,
 * <https://reactbits.dev>). Dos diferencias de fondo, ambas deliberadas:
 *
 *   · **Sin GSAP.** El original mueve todo con GSAP; acá va sobre el bucle de
 *     `requestAnimationFrame` compartido del proyecto, que es el mismo que usan
 *     el cursor, el imán y los fondos. Volver a instalar GSAP para esto habría
 *     contradicho la decisión registrada en `docs/decisiones-tecnicas.md`.
 *   · **Sin partículas flotantes.** Doce partículas por celda animadas con
 *     temporizadores encadenados es exactamente el presupuesto de animaciones
 *     que `DESIGN.md` prohíbe reventar. El brillo por proximidad y la chispa al
 *     pulsar dan la misma vida por una fracción del coste.
 *
 * Todo se apaga con `prefers-reduced-motion` y en punteros gruesos.
 */

interface CellRegistry {
  register: (node: HTMLElement) => () => void
  active: boolean
}

const CellContext = createContext<CellRegistry | null>(null)

/** Radio dentro del cual una celda empieza a encenderse. */
const REACH = 280

export function CellGrid({ children, className }: { children: ReactNode; className?: string }) {
  const cells = useRef(new Set<HTMLElement>())
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const fine = useFinePointer()
  const active = !reduced && fine

  const register = useCallback((node: HTMLElement) => {
    cells.current.add(node)
    return () => {
      cells.current.delete(node)
    }
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host || !active) return

    // El foco que sobrevuela la sección cuelga del body: dentro del contenedor
    // quedaría atrapado en su contexto de apilado y no podría mezclarse.
    const spot = document.createElement('div')
    spot.className = 'u-spot'
    document.body.appendChild(spot)

    let px = -9999
    let py = -9999
    let sx = -9999
    let sy = -9999
    let inside = false

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      px = event.clientX
      py = event.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const stop = onFrame((_, delta) => {
      const rect = host.getBoundingClientRect()
      const near =
        px > rect.left - REACH &&
        px < rect.right + REACH &&
        py > rect.top - REACH &&
        py < rect.bottom + REACH

      if (near !== inside) {
        inside = near
        spot.style.opacity = near ? '1' : '0'
      }
      if (!near) {
        for (const cell of cells.current) cell.style.setProperty('--glow', '0')
        return
      }

      sx = damp(sx, px, 26, delta)
      sy = damp(sy, py, 26, delta)
      spot.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`

      for (const cell of cells.current) {
        const r = cell.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const distance = Math.max(
          0,
          Math.hypot(px - cx, py - cy) - Math.max(r.width, r.height) / 2,
        )
        const glow = distance <= REACH * 0.4 ? 1 : Math.max(0, 1 - (distance - REACH * 0.4) / (REACH * 0.6))
        cell.style.setProperty('--glow', glow.toFixed(3))
        cell.style.setProperty('--glow-x', `${(((px - r.left) / r.width) * 100).toFixed(1)}%`)
        cell.style.setProperty('--glow-y', `${(((py - r.top) / r.height) * 100).toFixed(1)}%`)
      }
    })

    return () => {
      stop()
      window.removeEventListener('pointermove', onMove)
      spot.remove()
    }
  }, [active])

  return (
    <CellContext.Provider value={{ register, active }}>
      <div ref={hostRef} className={className}>
        {children}
      </div>
    </CellContext.Provider>
  )
}

export function Cell({
  children,
  className,
  as: Tag = 'div',
  href,
  onClick,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'a'
  href?: string
  onClick?: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const registry = useContext(CellContext)

  useEffect(() => {
    const node = ref.current
    if (!node || !registry) return
    return registry.register(node)
  }, [registry])

  // Imán y roce: la celda se acerca un poco al puntero mientras lo tiene encima.
  useEffect(() => {
    const node = ref.current
    if (!node || !registry?.active) return

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let over = false

    const onEnter = () => {
      over = true
    }
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 9
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 9
    }
    const onLeave = () => {
      over = false
      tx = 0
      ty = 0
    }

    node.addEventListener('pointerenter', onEnter)
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)

    const stop = onFrame((_, delta) => {
      cx = damp(cx, tx, 12, delta)
      cy = damp(cy, ty, 12, delta)
      if (!over && Math.abs(cx) < 0.02 && Math.abs(cy) < 0.02) {
        node.style.transform = ''
        return
      }
      node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
    })

    return () => {
      stop()
      node.removeEventListener('pointerenter', onEnter)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      node.style.transform = ''
    }
  }, [registry])

  /** Chispa donde se tocó. Se limpia sola. */
  const spark = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!registry?.active) return
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const size =
        Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height),
        ) * 2

      const el = document.createElement('span')
      el.className = 'u-spark'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.left = `${x - size / 2}px`
      el.style.top = `${y - size / 2}px`
      node.appendChild(el)
      window.setTimeout(() => el.remove(), 760)
    },
    [registry],
  )

  const props = {
    ref,
    className: `u-cell ${className ?? ''}`,
    onPointerDown: spark,
    onClick,
  }

  if (Tag === 'a') {
    return (
      <a {...(props as React.ComponentProps<'a'>)} href={href}>
        {children}
      </a>
    )
  }
  return <div {...(props as React.ComponentProps<'div'>)}>{children}</div>
}
