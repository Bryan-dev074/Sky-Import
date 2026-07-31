/**
 * EL TRAZADO — el motivo de la casa convertido en sistema.
 *
 * No es una textura de stock: son pistas de placa de circuito con codos a 45° y
 * pads de vía en los quiebres, generadas a partir de una semilla. Aparece en
 * exactamente cuatro lugares (intro, separador de sección, fondo del
 * configurador y pie de página) y siempre con la misma gramática: 1 px, acero en
 * reposo, cian solo en el segmento activo.
 *
 * Toda la geometría se redondea a dos decimales para que servidor y navegador
 * produzcan la misma cadena y no haya error de hidratación.
 */

export interface TraceProps {
  width?: number
  height?: number
  lines?: number
  seed?: number
  className?: string
  /** Ancho del trazo. Siempre 1 salvo que el contexto pida un peso mayor. */
  strokeWidth?: number
  /** Marca los caminos para que un CSS externo pueda dibujarlos. */
  drawable?: boolean
}

/** Generador entero determinista: mismas salidas en servidor y navegador. */
function rng(seed: number) {
  let state = (seed * 1103515245 + 12345) & 0x7fffffff
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

interface Path {
  d: string
  vias: Array<[number, number]>
  length: number
}

function buildPaths(width: number, height: number, lines: number, seed: number): Path[] {
  const next = rng(seed)
  const paths: Path[] = []
  const lane = height / (lines + 1)

  for (let i = 0; i < lines; i += 1) {
    let x = 0
    let y = +(lane * (i + 1)).toFixed(2)
    let d = `M0 ${y}`
    let length = 0
    const vias: Array<[number, number]> = []
    let guard = 0

    while (x < width && guard < 24) {
      guard += 1
      const run = +(width * (0.08 + next() * 0.2)).toFixed(2)
      const nx = +Math.min(width, x + run).toFixed(2)
      d += ` H${nx}`
      length += nx - x
      x = nx
      if (x >= width) break

      // Codo de 45°: el desplazamiento vertical iguala al horizontal.
      const up = next() > 0.5
      const step = +(lane * (0.35 + next() * 0.5)).toFixed(2)
      const ny = +Math.max(4, Math.min(height - 4, y + (up ? -step : step))).toFixed(2)
      const dx = +Math.abs(ny - y).toFixed(2)
      const ex = +Math.min(width, x + dx).toFixed(2)
      d += ` L${ex} ${ny}`
      length += +Math.hypot(ex - x, ny - y).toFixed(2)
      x = ex
      y = ny
      if (next() > 0.55) vias.push([x, y])
    }

    if (x < width) {
      d += ` H${width}`
      length += width - x
    }
    paths.push({ d, vias, length: +length.toFixed(2) })
  }

  return paths
}

export function Trace({
  width = 1200,
  height = 200,
  lines = 5,
  seed = 7,
  className,
  strokeWidth = 1,
  drawable = false,
}: TraceProps) {
  const paths = buildPaths(width, height, lines, seed)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square">
        {paths.map((path, i) => (
          <path
            key={i}
            d={path.d}
            opacity={0.55}
            data-trace={drawable ? '' : undefined}
            style={
              drawable
                ? ({
                    strokeDasharray: path.length,
                    strokeDashoffset: path.length,
                    '--trace-delay': `${i * 60}ms`,
                  } as React.CSSProperties)
                : undefined
            }
          />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
        {paths.flatMap((path, i) =>
          path.vias.map(([cx, cy], k) => (
            <circle key={`${i}-${k}`} cx={cx} cy={cy} r={2.6} opacity={0.75} />
          )),
        )}
      </g>
    </svg>
  )
}
