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
 * encenderse antes de que el puntero llegue, la celda se acerca un poco al
 * cursor y al pulsar nace una chispa donde se tocó.
 *
 * Adaptado de `MagicBento` de React Bits (MIT + Commons Clause), sin GSAP y sin
 * las partículas por celda. La atribución está en `CREDITS.md`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTE ARCHIVO SE REESCRIBIÓ: EL BAJÓN DE CUADROS
 *
 * La primera versión leía `getBoundingClientRect()` de las nueve celdas **en
 * cada cuadro**, y en el mismo bucle escribía sus estilos. Leer geometría
 * después de escribir estilos obliga al navegador a recalcular el layout en el
 * acto: nueve recálculos forzados por cuadro, más los de las fichas de producto
 * que también se movían. Eso es exactamente lo que trababa la página al llegar a
 * esta sección.
 *
 * Ahora:
 *   · Las geometrías se **miden una vez** y se guardan; solo se vuelven a medir
 *     al desplazar o redimensionar, y siempre en un lote de solo lectura.
 *   · El bucle por cuadro **solo escribe**. Nunca lee del DOM.
 *   · Si el puntero está lejos de la retícula, el bucle **se da de baja** en
 *     lugar de seguir corriendo en vacío.
 *   · Se quitó el foco grande que seguía al cursor por toda la pantalla: además
 *     de costar, tapaba la lectura del texto de la celda.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface CellRegistry {
  register: (node: HTMLElement) => () => void
  active: boolean
}

const CellContext = createContext<CellRegistry | null>(null)

/** Radio dentro del cual una celda empieza a encenderse. */
const REACH = 300

interface Medida {
  node: HTMLElement
  x: number
  y: number
  w: number
  h: number
}

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

    let medidas: Medida[] = []
    let hostRect = { top: 0, bottom: 0, left: 0, right: 0 }
    let necesitaMedir = true

    /** Único punto donde se lee geometría, y siempre en lote. */
    const medir = () => {
      const r = host.getBoundingClientRect()
      hostRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right }
      medidas = Array.from(cells.current, (node) => {
        const b = node.getBoundingClientRect()
        return { node, x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height }
      })
      necesitaMedir = false
    }

    const invalidar = () => {
      necesitaMedir = true
    }
    window.addEventListener('scroll', invalidar, { passive: true })
    window.addEventListener('resize', invalidar)
    const ro = new ResizeObserver(invalidar)
    ro.observe(host)

    let px = -9999
    let py = -9999
    let suscrito: (() => void) | null = null
    let apagado = true

    const apagar = () => {
      if (apagado) return
      apagado = true
      for (const cell of cells.current) cell.style.setProperty('--glow', '0')
    }

    const paso = () => {
      if (necesitaMedir) medir()

      const cerca =
        px > hostRect.left - REACH &&
        px < hostRect.right + REACH &&
        py > hostRect.top - REACH &&
        py < hostRect.bottom + REACH

      if (!cerca) {
        apagar()
        // Nadie cerca: el bucle se da de baja hasta que el puntero vuelva.
        suscrito?.()
        suscrito = null
        return
      }

      apagado = false
      for (const m of medidas) {
        const d = Math.max(0, Math.hypot(px - m.x, py - m.y) - Math.max(m.w, m.h) / 2)
        const glow = d <= REACH * 0.35 ? 1 : Math.max(0, 1 - (d - REACH * 0.35) / (REACH * 0.65))
        // Solo escritura: ni una lectura del DOM en todo el bucle.
        m.node.style.setProperty('--glow', glow.toFixed(3))
        m.node.style.setProperty('--glow-x', `${(((px - m.x) / m.w + 0.5) * 100).toFixed(1)}%`)
        m.node.style.setProperty('--glow-y', `${(((py - m.y) / m.h + 0.5) * 100).toFixed(1)}%`)
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      px = event.clientX
      py = event.clientY
      if (!suscrito) suscrito = onFrame(paso)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      suscrito?.()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', invalidar)
      window.removeEventListener('resize', invalidar)
      ro.disconnect()
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

  /**
   * Imán: la celda se acerca un poco al puntero mientras lo tiene encima. El
   * bucle **solo existe mientras hace falta** — se suscribe al entrar el puntero
   * y se da de baja cuando la celda volvió a su sitio. Nueve bucles corriendo en
   * vacío es justamente lo que hay que evitar.
   */
  useEffect(() => {
    const node = ref.current
    if (!node || !registry?.active) return

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let rect: DOMRect | null = null
    let suscrito: (() => void) | null = null

    const paso = (_: number, delta: number) => {
      cx = damp(cx, tx, 12, delta)
      cy = damp(cy, ty, 12, delta)
      if (tx === 0 && ty === 0 && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        node.style.transform = ''
        suscrito?.()
        suscrito = null
        return
      }
      node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
    }

    const arrancar = () => {
      if (!suscrito) suscrito = onFrame(paso)
    }

    const onEnter = () => {
      // Una sola lectura por entrada, no una por cuadro.
      rect = node.getBoundingClientRect()
      arrancar()
    }
    const onMove = (event: PointerEvent) => {
      if (!rect) return
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 9
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 9
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      arrancar()
    }

    node.addEventListener('pointerenter', onEnter)
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)

    return () => {
      suscrito?.()
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
