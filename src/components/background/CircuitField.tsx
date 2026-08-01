'use client'

import { useEffect, useRef } from 'react'
import { damp, onFrame } from '@/lib/motion'

/**
 * CAMPO DE VÍAS — el fondo vivo de la casa.
 *
 * Una retícula de pads de vía que reacciona al puntero: se abomban hacia afuera
 * como si el cursor fuera un imán bajo la placa, y se encienden en cian dentro
 * de su radio. Cada ~9 s una onda de energía recorre la placa de lado a lado,
 * que es el mismo gesto que hace el trazado en la intro.
 *
 * Es la adaptación al mundo de Sky Import de la idea de campo de puntos
 * reactivo de React Bits (`DotField`): mismo principio, geometría y paleta
 * propias — acá los puntos son **vías de una placa de circuito**, no un campo
 * decorativo.
 *
 * Ingeniería, porque un fondo a pantalla completa es el sitio más fácil para
 * arruinar el rendimiento de toda la página:
 *
 *   · **Un solo `fill()` por nivel de brillo.** Los ~2.500 pads se agrupan en
 *     cuatro cubos de intensidad y cada cubo se pinta con una única llamada. Sin
 *     eso serían 2.500 cambios de estado del contexto por cuadro.
 *   · **Solo se recalcula lo que está cerca del puntero.** Fuera de su radio, el
 *     pad conserva su posición de retícula sin hacer cuentas.
 *   · Comparte el `requestAnimationFrame` del resto de la tienda.
 *   · Se detiene fuera de pantalla y con la pestaña oculta.
 *   · No existe en punteros gruesos ni con movimiento reducido: en su lugar
 *     queda la retícula estática de CSS, que ya está en la página.
 */

interface Props {
  /** Separación de la retícula, en píxeles CSS. */
  spacing?: number
  /** Radio de influencia del puntero. */
  reach?: number
  /** Cuánto se aparta un pad del puntero, como máximo. */
  bulge?: number
  className?: string
  /** Intensidad general, 0–1. El hero la usa más fuerte que el resto. */
  intensity?: number
}

export default function CircuitField({
  spacing = 26,
  reach = 250,
  bulge = 16,
  className,
  intensity = 1,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let dpr = 1

    // Posición del puntero, en píxeles CSS relativos al lienzo.
    let px = -9999
    let py = -9999
    let sx = -9999
    let sy = -9999

    // Onda de energía: avanza de −0.2 a 1.2 y descansa.
    let pulse = -0.25
    let pulseWait = 2200

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / spacing) + 1
      rows = Math.ceil(height / spacing) + 1
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = canvas.getBoundingClientRect()
      px = event.clientX - rect.left
      py = event.clientY - rect.top
    }
    const onLeave = () => {
      px = -9999
      py = -9999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    let visible = true
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(canvas)

    // Cuatro cubos de intensidad: cada uno se pinta con una sola llamada.
    const buckets: Array<Array<number>> = [[], [], [], []]
    // Los dos primeros niveles son el estado de reposo: es lo que se ve en los
    // tramos de color liso, lejos del puntero. Estaban tan bajos que la placa
    // se leía como un plano vacío; subidos, la retícula está presente sin
    // llegar a competir con el texto que va encima.
    const COLORS = [
      `rgba(110, 122, 133, ${(0.34 * intensity).toFixed(3)})`,
      `rgba(154, 165, 175, ${(0.5 * intensity).toFixed(3)})`,
      `rgba(85, 200, 245, ${(0.58 * intensity).toFixed(3)})`,
      `rgba(85, 200, 245, ${(0.95 * intensity).toFixed(3)})`,
    ]

    const stop = onFrame((_, delta) => {
      if (!visible) return

      // El puntero llega con retardo: el campo respira, no salta.
      sx = damp(sx, px, 9, delta)
      sy = damp(sy, py, 9, delta)

      if (pulseWait > 0) {
        pulseWait -= delta
      } else {
        pulse += delta / 1500
        if (pulse > 1.3) {
          pulse = -0.25
          pulseWait = 6500
        }
      }
      const pulseX = pulse * (width + 260) - 130

      ctx.clearRect(0, 0, width, height)
      for (const bucket of buckets) bucket.length = 0

      const reach2 = reach * reach

      for (let row = 0; row < rows; row += 1) {
        const gy = row * spacing
        for (let col = 0; col < cols; col += 1) {
          const gx = col * spacing
          let x = gx
          let y = gy
          let level = 0

          const dx = gx - sx
          const dy = gy - sy
          const d2 = dx * dx + dy * dy

          if (d2 < reach2) {
            const d = Math.sqrt(d2) || 0.0001
            const falloff = 1 - d / reach
            const push = bulge * falloff * falloff
            x = gx + (dx / d) * push
            y = gy + (dy / d) * push
            level = falloff > 0.62 ? 3 : falloff > 0.3 ? 2 : 1
          }

          // La onda de energía enciende una franja vertical estrecha.
          const pd = Math.abs(gx - pulseX)
          if (pd < 90) {
            const glow = 1 - pd / 90
            if (glow > 0.55) level = Math.max(level, 3)
            else if (glow > 0.2) level = Math.max(level, 2)
            else level = Math.max(level, 1)
          }

          const bucket = buckets[level]
          if (bucket) bucket.push(x, y)
        }
      }

      for (let i = 0; i < buckets.length; i += 1) {
        const bucket = buckets[i]
        if (!bucket || bucket.length === 0) continue
        const size = i >= 2 ? 2.6 : i === 1 ? 2.1 : 1.7
        const half = size / 2
        ctx.fillStyle = COLORS[i] as string
        ctx.beginPath()
        for (let k = 0; k < bucket.length; k += 2) {
          ctx.rect((bucket[k] as number) - half, (bucket[k + 1] as number) - half, size, size)
        }
        ctx.fill()
      }
    })

    return () => {
      stop()
      resizeObserver.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [spacing, reach, bulge, intensity])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
