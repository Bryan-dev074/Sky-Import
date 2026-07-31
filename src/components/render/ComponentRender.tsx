import type { ReactElement } from 'react'
import type { RenderSpec } from '@/lib/catalog/types'

/**
 * RENDERS DE PRODUCTO
 *
 * Todo el material gráfico de la tienda es autoral. No hay fotografía de
 * producto con derechos, así que **cada pieza tiene su propio dibujo**: no un
 * icono de categoría repetido, sino un render individual que cambia con el
 * modelo — cuántos ventiladores lleva la placa de video, si el disipador es de
 * una torre o de dos, si el gabinete tiene frente de malla o lateral de vidrio,
 * si el SSD viene con disipador o desnudo.
 *
 * Cómo se consigue esa variedad sin dibujar 37 archivos a mano:
 *
 *   · `variant` elige entre diseños genuinamente distintos dentro de la familia
 *     (tres carcasas de placa de video, tres frentes de gabinete, dos
 *     disipadores…).
 *   · `seed` desplaza los detalles menores —grabados, tornillos, giro de las
 *     aspas— de forma determinista, para que dos piezas del mismo diseño no
 *     salgan calcadas. Nunca `Math.random()`: servidor y navegador dibujan lo
 *     mismo.
 *   · `accent` y `fans` vienen de la ficha del producto.
 *
 * El sombreado sale de `RenderDefs`, montado una sola vez en el layout: la luz
 * cae igual en todas las piezas, que es la regla de registro unificado del
 * sistema de imágenes, y el marcado pesa una fracción de lo que pesaría con los
 * peines de aletas dibujados línea por línea.
 *
 * Dos vistas por pieza, como en un muestrario impreso:
 *   · `front`     — la pieza.
 *   · `annotated` — el MISMO negativo con la capa de cotas encima.
 */

const M = {
  dark: '#12171C',
  body: '#232B33',
  light: '#39434D',
  edge: '#6E7A85',
  hi: '#9AA5AF',
  pcb: '#1B2229',
  gold: '#A98A4E',
} as const

const G = {
  metal: 'url(#si-metal)',
  metalLight: 'url(#si-metal-light)',
  metalDark: 'url(#si-metal-dark)',
  pcb: 'url(#si-pcb)',
  copper: 'url(#si-copper)',
  gold: 'url(#si-gold)',
  glass: 'url(#si-glass)',
  edge: 'url(#si-edge)',
  shadow: 'url(#si-shadow)',
  fins: 'url(#si-fins)',
  finsFine: 'url(#si-fins-fine)',
  finsH: 'url(#si-fins-h)',
  mesh: 'url(#si-mesh)',
  hex: 'url(#si-hex)',
  pads: 'url(#si-pads)',
} as const

interface ShapeProps {
  accent: string
  seed: number
  fans?: number
  variant?: number
}

export interface ComponentRenderProps extends RenderSpec {
  view?: 'front' | 'annotated'
  dims?: string[]
  className?: string
  title?: string
}

/** Ruido determinista a partir de la semilla. */
function jitter(seed: number, index: number, amount: number): number {
  const h = (seed * 2654435761 + index * 40503) % 1024
  return +(((h / 1024) * 2 - 1) * amount).toFixed(2)
}

/** Sombra propia bajo la pieza: la despega de la superficie. */
function Shadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={G.shadow} />
}

/** Filete de luz sobre el canto superior de una pieza. */
function EdgeLight({ x, y, w, h = 6 }: { x: number; y: number; w: number; h?: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={G.edge} />
}

function Fan({
  cx,
  cy,
  r,
  seed,
  index,
  blades = 9,
}: {
  cx: number
  cy: number
  r: number
  seed: number
  index: number
  blades?: number
}) {
  const rot = 8 + jitter(seed, index, 16)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={M.dark} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={M.light} strokeWidth={1.2} />
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        {Array.from({ length: blades }, (_, i) => {
          const a = (i / blades) * Math.PI * 2
          const x1 = +(cx + Math.cos(a) * (r * 0.26)).toFixed(2)
          const y1 = +(cy + Math.sin(a) * (r * 0.26)).toFixed(2)
          const x2 = +(cx + Math.cos(a + 0.52) * (r * 0.94)).toFixed(2)
          const y2 = +(cy + Math.sin(a + 0.52) * (r * 0.94)).toFixed(2)
          const mx = +((x1 + x2) / 2 + r * 0.1).toFixed(2)
          const my = +((y1 + y2) / 2 - r * 0.06).toFixed(2)
          return (
            <path
              key={i}
              d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
              stroke={M.edge}
              strokeWidth={+(r * 0.19).toFixed(2)}
              strokeLinecap="round"
              fill="none"
              opacity={0.45}
            />
          )
        })}
      </g>
      <circle cx={cx} cy={cy} r={+(r * 0.28).toFixed(2)} fill={G.metalLight} />
      <circle cx={cx} cy={cy} r={+(r * 0.28).toFixed(2)} fill="none" stroke={M.dark} strokeWidth={0.8} />
      <circle
        cx={+(cx - r * 0.1).toFixed(2)}
        cy={+(cy - r * 0.11).toFixed(2)}
        r={+(r * 0.08).toFixed(2)}
        fill={M.hi}
        opacity={0.55}
      />
    </g>
  )
}

/** Dedos de contacto dorados (PCIe / DIMM / M.2). */
function Contacts({
  x,
  y,
  w,
  h,
  count,
  notchAt,
}: {
  x: number
  y: number
  w: number
  h: number
  count: number
  notchAt?: number
}) {
  const step = w / count
  return (
    <g fill={G.gold}>
      {Array.from({ length: count }, (_, i) =>
        notchAt !== undefined && i === notchAt ? null : (
          <rect
            key={i}
            x={+(x + i * step + step * 0.18).toFixed(2)}
            y={y}
            width={+(step * 0.64).toFixed(2)}
            height={h}
          />
        ),
      )}
    </g>
  )
}

// ══════════════════════════════════════════════════════ placa de video

function Gpu({ accent, seed, fans = 3, variant = 0 }: ShapeProps): ReactElement {
  const count = Math.max(1, Math.min(3, fans))
  const x = 46
  const w = 320
  const fanR = count === 3 ? 41 : count === 2 ? 50 : 60
  const gap = w / count
  const thick = variant === 2 ? 108 : 126

  return (
    <g>
      <Shadow cx={210} cy={236} rx={168} ry={20} />

      {/* peine de aletas asomando por el canto superior */}
      <rect x={x + 8} y={196 - thick - 18} width={w - 16} height={18} fill={G.fins} />

      {/* PCB y contactos */}
      <rect x={x} y={194} width={w} height={16} fill={G.pcb} />
      <rect x={x} y={194} width={w} height={16} fill={G.pads} opacity={0.5} />
      <Contacts x={84} y={210} w={132} h={14} count={23} notchAt={4} />

      {/* carcasa */}
      <rect x={x} y={196 - thick} width={w} height={thick} rx={3} fill={G.metal} />
      <EdgeLight x={x + 1} y={196 - thick + 1} w={w - 2} h={7} />
      <rect x={x} y={196 - thick} width={w} height={thick} rx={3} fill="none" stroke={M.edge} strokeWidth={1.1} />

      {/* la carcasa cambia con el modelo */}
      {variant === 0 ? (
        <>
          {/* corte angular sobre el ventilador central */}
          <path
            d={`M${x + w * 0.3} ${196 - thick} L${x + w * 0.46} ${196 - thick + 26} L${x + w * 0.7} ${196 - thick + 26} L${x + w * 0.86} ${196 - thick}`}
            fill={M.dark}
            opacity={0.55}
          />
          <rect x={x} y={186} width={w} height={5} fill={accent} opacity={0.9} />
        </>
      ) : null}

      {variant === 1 ? (
        <>
          {/* refuerzo en X entre ventiladores */}
          <path
            d={`M${x + 12} ${196 - thick + 12} L${x + w - 12} ${186} M${x + w - 12} ${196 - thick + 12} L${x + 12} ${186}`}
            stroke={M.light}
            strokeWidth={7}
            opacity={0.5}
          />
          <rect x={x + 10} y={196 - thick + 8} width={w - 20} height={4} fill={accent} opacity={0.85} />
        </>
      ) : null}

      {variant === 2 ? (
        <>
          {/* rejillas laterales */}
          <rect x={x + 10} y={196 - thick + 14} width={40} height={thick - 32} fill={G.hex} />
          <rect x={x + w - 50} y={196 - thick + 14} width={40} height={thick - 32} fill={G.hex} />
          <rect x={x} y={190} width={w} height={4} fill={accent} opacity={0.85} />
        </>
      ) : null}

      {Array.from({ length: count }, (_, i) => (
        <Fan
          key={i}
          cx={+(x + gap * (i + 0.5)).toFixed(2)}
          cy={196 - thick / 2}
          r={fanR}
          seed={seed}
          index={i}
          blades={variant === 1 ? 11 : 9}
        />
      ))}

      {/* soporte y salidas de video */}
      <rect x={24} y={196 - thick - 6} width={13} height={thick + 34} fill={G.metalLight} />
      <rect x={24} y={196 - thick - 6} width={13} height={thick + 34} fill="none" stroke={M.dark} strokeWidth={0.8} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={26} y={196 - thick + 16 + i * 26} width={9} height={15} rx={1} fill={M.dark} />
      ))}

      {/* conector de alimentación */}
      <rect x={278} y={196 - thick - 12} width={48} height={12} rx={1.5} fill={M.dark} />
      <rect x={278} y={196 - thick - 12} width={48} height={12} rx={1.5} fill="none" stroke={M.edge} strokeWidth={0.8} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={283 + i * 15} y={196 - thick - 9} width={10} height={6} fill={M.light} />
      ))}
    </g>
  )
}

// ═══════════════════════════════════════════════════════════ procesador

function Cpu({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const x = 124
  const y = 74
  const s = 152
  const bevel = variant === 1 ? 12 : 24
  const ihs = `M${x + bevel} ${y} H${x + s - bevel} L${x + s} ${y + bevel} V${y + s - bevel} L${x + s - bevel} ${y + s} H${x + bevel} L${x} ${y + s - bevel} V${y + bevel} Z`

  return (
    <g>
      <Shadow cx={200} cy={244} rx={112} ry={16} />

      {/* sustrato */}
      <rect x={x - 12} y={y - 12} width={s + 24} height={s + 24} rx={3} fill={G.pcb} />
      <rect x={x - 12} y={y - 12} width={s + 24} height={s + 24} rx={3} fill={G.pads} opacity={0.55} />
      <rect x={x - 12} y={y - 12} width={s + 24} height={s + 24} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />

      {/* triángulo de orientación */}
      <path d={`M${x - 7} ${y + s + 7} l0 -14 l14 14 z`} fill={accent} />

      {/* disipador integrado */}
      <path d={ihs} fill={G.metalLight} />
      <path d={ihs} fill="none" stroke={M.hi} strokeWidth={1.1} opacity={0.5} />
      <path d={`M${x + bevel + 3} ${y + 2.5} H${x + s - bevel - 3}`} stroke="#D6DEE4" strokeWidth={2} opacity={0.5} />

      {/* grabado láser: cambia de disposición según la plataforma */}
      {variant === 0 ? (
        <>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={x + 30}
              y={y + 54 + i * 16}
              width={92 - i * 24 + jitter(seed, i, 7)}
              height={3}
              fill={M.light}
              opacity={0.7}
            />
          ))}
        </>
      ) : (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={x + 26 + jitter(seed, i, 4)}
              y={y + 46 + i * 15}
              width={100 - i * 14}
              height={2.6}
              fill={M.light}
              opacity={0.62}
            />
          ))}
          <circle cx={x + s - 30} cy={y + 30} r={9} fill="none" stroke={M.light} strokeWidth={1.4} opacity={0.6} />
        </>
      )}

      {/* condensadores del sustrato */}
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={x + 6 + i * 22} y={y + s + 6} width={13} height={6} rx={0.6} fill={M.dark} />
      ))}
    </g>
  )
}

// ═══════════════════════════════════════════════════════════ placa madre

function Motherboard({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const compact = variant === 2
  const w = compact ? 250 : 306
  const x = compact ? 74 : 46

  return (
    <g>
      <Shadow cx={200} cy={272} rx={150} ry={16} />

      <rect x={x} y={32} width={w} height={228} rx={3} fill={G.pcb} />
      <rect x={x} y={32} width={w} height={228} rx={3} fill={G.pads} opacity={0.6} />
      <rect x={x} y={32} width={w} height={228} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />

      {/* orificios de anclaje */}
      {[
        [x + 12, 44],
        [x + w - 12, 44],
        [x + 12, 248],
        [x + w - 12, 248],
        [x + w / 2, 44],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.4} fill={M.dark} stroke={M.edge} strokeWidth={0.7} />
      ))}

      {/* cubierta de entradas y salidas */}
      <rect x={x + 8} y={40} width={compact ? 74 : 96} height={40} rx={2} fill={G.metal} />
      <EdgeLight x={x + 9} y={41} w={compact ? 72 : 94} h={5} />
      <rect x={x + 8} y={40} width={compact ? 74 : 96} height={40} rx={2} fill="none" stroke={M.edge} strokeWidth={0.8} />
      <rect x={x + 8} y={40} width={compact ? 74 : 96} height={4} fill={accent} opacity={0.85} />

      {/* zócalo del procesador */}
      <rect x={x + 62} y={92} width={78} height={78} rx={2} fill={M.dark} />
      <rect x={x + 70} y={100} width={62} height={62} fill={G.pads} />
      <rect x={x + 62} y={92} width={78} height={78} rx={2} fill="none" stroke={M.edge} strokeWidth={1.1} />
      <rect x={x + 62} y={92} width={78} height={4} fill={M.light} opacity={0.7} />

      {/* disipadores de alimentación */}
      <rect x={x + 8} y={92} width={44} height={78} rx={2} fill={G.finsH} />
      <rect x={x + 8} y={92} width={44} height={78} rx={2} fill="none" stroke={M.edge} strokeWidth={0.8} />

      {/* ranuras de memoria */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={x + 158 + i * 15} y={88} width={9} height={92} rx={1} fill={M.dark} />
          <rect x={x + 158 + i * 15} y={88} width={9} height={5} fill={i < 2 ? accent : M.light} opacity={0.8} />
          <rect x={x + 158 + i * 15} y={88} width={9} height={92} rx={1} fill="none" stroke={M.edge} strokeWidth={0.5} />
        </g>
      ))}

      {/* ranuras PCIe: la placa grande trae una más */}
      {(compact ? [198] : [198, 224]).map((sy, i) => (
        <g key={sy}>
          <rect x={x + 56} y={sy} width={compact ? 130 : 168 - i * 74} height={9} rx={1} fill={M.dark} />
          <rect x={x + 56} y={sy} width={compact ? 130 : 168 - i * 74} height={9} rx={1} fill="none" stroke={M.edge} strokeWidth={0.5} />
        </g>
      ))}

      {/* cubiertas M.2 */}
      <rect x={x + 56} y={182} width={compact ? 118 : 146} height={9} rx={1} fill={G.metal} />
      <rect x={x + 56} y={182} width={compact ? 118 : 146} height={9} rx={1} fill="none" stroke={M.edge} strokeWidth={0.5} />

      {/* disipador del chipset */}
      <rect x={x + w - 66} y={200} width={56} height={52} rx={2} fill={G.metal} />
      <EdgeLight x={x + w - 65} y={201} w={54} h={5} />
      <rect x={x + w - 66} y={200} width={56} height={52} rx={2} fill="none" stroke={M.edge} strokeWidth={0.8} />
      <path d={`M${x + w - 60} ${246} l44 -36`} stroke={accent} strokeWidth={2.2} opacity={0.75} />

      {/* trazado de pistas */}
      {[0, 1, 2, 3].map((i) => {
        const ty = +(202 + i * 8 + jitter(seed, i, 2)).toFixed(2)
        return (
          <path
            key={i}
            d={`M${x + w - 96} ${ty} h16 l9 -9 h22`}
            stroke={M.edge}
            strokeWidth={0.6}
            fill="none"
            opacity={0.45}
          />
        )
      })}
    </g>
  )
}

// ══════════════════════════════════════════════════════════════════ RAM

function Ram({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const tall = variant === 0 ? 52 : variant === 1 ? 44 : 30
  return (
    <g>
      <Shadow cx={200} cy={250} rx={158} ry={14} />
      {[0, 1].map((i) => {
        const y = 96 + i * 74
        return (
          <g key={i} transform={`translate(0 ${jitter(seed, i, 3)})`}>
            <rect x={50} y={y + tall} width={300} height={17} fill={G.pcb} />
            <Contacts x={68} y={y + tall + 17} w={264} h={11} count={42} notchAt={13} />
            <rect x={50} y={y} width={300} height={tall} rx={2} fill={G.metal} />
            <EdgeLight x={51} y={y + 1} w={298} h={6} />
            <rect x={50} y={y} width={300} height={tall} rx={2} fill="none" stroke={M.edge} strokeWidth={1} />

            {variant === 0 ? (
              /* peine dentado sobre el disipador */
              <rect x={60} y={y + 6} width={280} height={16} fill={G.finsFine} />
            ) : null}
            {variant === 1 ? (
              /* ventana longitudinal */
              <rect x={62} y={y + 12} width={276} height={12} rx={1} fill={M.dark} opacity={0.8} />
            ) : null}
            {variant === 2 ? (
              /* perfil bajo: solo un filete */
              <rect x={62} y={y + 9} width={276} height={3} fill={M.light} opacity={0.7} />
            ) : null}

            <rect x={62} y={y + tall - 16} width={104} height={10} fill={accent} opacity={0.6} />
            <rect x={176} y={y + tall - 16} width={54} height={10} fill={M.light} opacity={0.45} />
          </g>
        )
      })}
    </g>
  )
}

// ═════════════════════════════════════════════════════════ almacenamiento

function SsdM2({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const heatsink = variant === 0
  return (
    <g>
      <Shadow cx={200} cy={196} rx={152} ry={12} />

      {/* PCB */}
      <rect x={36} y={118} width={328} height={58} rx={2} fill={G.pcb} />
      <rect x={36} y={118} width={328} height={58} rx={2} fill={G.pads} opacity={0.5} />
      <rect x={36} y={118} width={328} height={58} rx={2} fill="none" stroke={M.edge} strokeWidth={1} />
      <Contacts x={40} y={168} w={62} h={9} count={13} notchAt={9} />

      {heatsink ? (
        <>
          {/* disipador con aletas sobre casi toda la placa */}
          <rect x={104} y={122} width={238} height={50} rx={2} fill={G.finsFine} />
          <rect x={104} y={122} width={238} height={50} rx={2} fill="none" stroke={M.edge} strokeWidth={0.9} />
          <EdgeLight x={105} y={123} w={236} h={5} />
          <rect x={116} y={132} width={62} height={16} rx={1} fill={M.dark} opacity={0.85} />
          <rect x={122} y={138} width={34} height={4} fill={accent} opacity={0.95} />
        </>
      ) : (
        <>
          {/* placa desnuda: encapsulados a la vista */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={124 + i * 78}
              y={+(128 + jitter(seed, i, 1)).toFixed(2)}
              width={64}
              height={36}
              rx={1}
              fill={M.dark}
              stroke={M.light}
              strokeWidth={0.8}
            />
          ))}
          <rect x={126} y={134} width={60} height={24} fill={G.metalLight} opacity={0.28} />
          <rect x={132} y={140} width={32} height={4} fill={accent} opacity={0.95} />
          <rect x={132} y={148} width={46} height={2.6} fill={M.edge} opacity={0.7} />
        </>
      )}

      {/* orificio del tornillo 2280 */}
      <circle cx={352} cy={147} r={5.4} fill={M.dark} stroke={M.edge} strokeWidth={0.8} />
    </g>
  )
}

function SsdSata({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <Shadow cx={200} cy={252} rx={132} ry={14} />
      <rect x={70} y={76} width={260} height={164} rx={4} fill={G.metal} />
      <EdgeLight x={71} y={77} w={258} h={8} />
      <rect x={70} y={76} width={260} height={164} rx={4} fill="none" stroke={M.edge} strokeWidth={1.1} />
      <rect x={94} y={102} width={146} height={66} rx={1} fill={M.dark} opacity={0.55} />
      <rect x={106} y={116} width={76} height={5} fill={accent} opacity={0.9} />
      <rect x={106} y={130} width={108} height={3} fill={M.edge} opacity={0.7} />
      <rect x={106} y={140} width={88} height={3} fill={M.edge} opacity={0.5} />
      <rect x={288} y={180} width={42} height={17} fill={M.dark} />
      <rect x={288} y={203} width={42} height={23} fill={M.dark} />
      <rect x={288} y={180} width={42} height={17} fill="none" stroke={M.edge} strokeWidth={0.8} />
      <rect x={288} y={203} width={42} height={23} fill="none" stroke={M.edge} strokeWidth={0.8} />
      {[
        [88, 94],
        [88, 222],
        [312, 94],
        [312, 222],
      ].map(([cx, cy], i) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={+((cy ?? 0) + jitter(seed, i, 0.5)).toFixed(2)}
          r={4}
          fill={M.dark}
          stroke={M.edge}
          strokeWidth={0.7}
        />
      ))}
    </g>
  )
}

// ══════════════════════════════════════════════════════════════ fuente

function Psu({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const modular = variant === 0
  return (
    <g>
      <Shadow cx={200} cy={252} rx={148} ry={16} />
      <rect x={60} y={70} width={280} height={172} rx={4} fill={G.metal} />
      <EdgeLight x={61} y={71} w={278} h={8} />
      <rect x={60} y={70} width={280} height={172} rx={4} fill="none" stroke={M.edge} strokeWidth={1.1} />

      <Fan cx={182} cy={156} r={72} seed={seed} index={0} blades={11} />
      {/* rejilla sobre el ventilador */}
      {variant === 0
        ? Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={182} cy={156} r={12 + i * 8.4} fill="none" stroke={M.edge} strokeWidth={0.7} opacity={0.32} />
          ))
        : (
            <g>
              <clipPath id="si-psu-grill">
                <circle cx={182} cy={156} r={74} />
              </clipPath>
              <rect x={106} y={80} width={152} height={152} fill={G.hex} clipPath="url(#si-psu-grill)" />
            </g>
          )}

      {modular ? (
        <>
          <rect x={284} y={90} width={44} height={132} rx={2} fill={M.dark} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={291} y={98 + i * 25} width={30} height={15} rx={1} fill={G.metalLight} stroke={M.dark} strokeWidth={0.6} />
          ))}
        </>
      ) : (
        <>
          {/* cableado fijo saliendo por el canto */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M330 ${112 + i * 26} q28 ${8 + i * 6} 46 ${-4 + i * 10}`}
              stroke={M.light}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}
        </>
      )}

      <rect x={72} y={84} width={70} height={22} rx={1} fill={M.dark} opacity={0.8} />
      <rect x={78} y={92} width={44} height={6} fill={accent} opacity={0.9} />
    </g>
  )
}

// ═══════════════════════════════════════════════════════════ refrigeración

function AirCooler({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const dual = variant === 0
  return (
    <g>
      <Shadow cx={200} cy={268} rx={120} ry={14} />

      {dual ? (
        <>
          <rect x={212} y={40} width={106} height={176} fill={G.fins} />
          <rect x={212} y={40} width={106} height={176} fill="none" stroke={M.edge} strokeWidth={1} />
        </>
      ) : null}
      <rect x={dual ? 82 : 142} y={40} width={106} height={176} fill={G.fins} />
      <rect x={dual ? 82 : 142} y={40} width={106} height={176} fill="none" stroke={M.edge} strokeWidth={1} />
      <EdgeLight x={dual ? 82 : 142} y={40} w={dual ? 236 : 106} h={5} />

      <Fan cx={dual ? 200 : 195} cy={128} r={47} seed={seed} index={1} blades={dual ? 9 : 11} />
      <rect
        x={dual ? 152 : 147}
        y={80}
        width={96}
        height={96}
        rx={2}
        fill="none"
        stroke={M.edge}
        strokeWidth={1.1}
        opacity={0.7}
      />

      {/* caños de calor de cobre */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${(dual ? 112 : 158) + i * 26} 216 v22 q0 10 10 10 h${(dual ? 132 : 52) - i * 22} q10 0 10 -10 v-22`}
          stroke={G.copper}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
      ))}

      <rect x={dual ? 152 : 162} y={246} width={96} height={17} rx={2} fill={G.metalLight} />
      <rect x={dual ? 152 : 162} y={246} width={96} height={17} rx={2} fill="none" stroke={M.dark} strokeWidth={0.8} />
      <rect x={dual ? 82 : 142} y={34} width={dual ? 236 : 106} height={6} fill={accent} opacity={0.6} />
    </g>
  )
}

function AioCooler({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <Shadow cx={150} cy={140} rx={120} ry={14} />

      {/* radiador */}
      <rect x={32} y={54} width={220} height={76} rx={2} fill={G.finsFine} />
      <rect x={32} y={54} width={220} height={76} rx={2} fill="none" stroke={M.edge} strokeWidth={1.1} />
      <EdgeLight x={33} y={55} w={218} h={5} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={36 + i * 71} y={58} width={67} height={68} rx={2} fill={M.body} opacity={0.86} />
          <Fan cx={69 + i * 71} cy={92} r={29} seed={seed} index={i} />
        </g>
      ))}

      {/* mangueras trenzadas */}
      <path d="M252 80 q58 6 64 58 q6 56 -46 64" stroke={M.light} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M252 106 q44 8 48 52 q4 46 -40 52" stroke={M.light} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M252 80 q58 6 64 58 q6 56 -46 64" stroke={M.edge} strokeWidth={1} fill="none" opacity={0.55} />
      <path d="M252 106 q44 8 48 52 q4 46 -40 52" stroke={M.edge} strokeWidth={1} fill="none" opacity={0.55} />

      {/* bloque de bomba */}
      <rect x={192} y={182} width={96} height={78} rx={4} fill={G.metal} />
      <EdgeLight x={193} y={183} w={94} h={6} />
      <rect x={192} y={182} width={96} height={78} rx={4} fill="none" stroke={M.edge} strokeWidth={1.1} />
      <circle cx={240} cy={221} r={27} fill={M.dark} stroke={M.light} strokeWidth={1.2} />
      <circle cx={240} cy={221} r={17} fill="none" stroke={accent} strokeWidth={1.8} opacity={0.85} />
      <circle cx={240} cy={221} r={7} fill={G.metalLight} />
    </g>
  )
}

// ═══════════════════════════════════════════════════════════════ gabinete

function Case({ accent, seed, variant = 0 }: ShapeProps): ReactElement {
  const cube = variant === 2
  const w = cube ? 196 : 176
  const h = cube ? 196 : 244
  const x = (400 - w) / 2
  const y = cube ? 54 : 28

  return (
    <g>
      <Shadow cx={200} cy={y + h + 14} rx={w * 0.62} ry={13} />

      <rect x={x} y={y} width={w} height={h} rx={3} fill={G.metal} />
      <EdgeLight x={x + 1} y={y + 1} w={w - 2} h={8} />
      <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={M.edge} strokeWidth={1.1} />

      {/* frente */}
      <rect x={x + 8} y={y + 12} width={cube ? 60 : 54} height={h - 24} fill={M.dark} />
      <rect
        x={x + 12}
        y={y + 16}
        width={cube ? 52 : 46}
        height={h - 32}
        fill={variant === 1 ? G.hex : G.mesh}
      />

      {/* lateral */}
      <rect
        x={x + (cube ? 74 : 66)}
        y={y + 12}
        width={w - (cube ? 84 : 76)}
        height={h - 24}
        fill={variant === 1 ? G.glass : M.dark}
        opacity={variant === 1 ? 1 : 0.62}
      />
      <rect
        x={x + (cube ? 74 : 66)}
        y={y + 12}
        width={w - (cube ? 84 : 76)}
        height={h - 24}
        fill="none"
        stroke={M.light}
        strokeWidth={1}
      />

      {/* siluetas internas apenas insinuadas */}
      <rect x={x + (cube ? 86 : 80)} y={y + 34} width={w * 0.34} height={h * 0.3} fill={M.light} opacity={0.26} />
      <rect x={x + (cube ? 86 : 80)} y={y + h * 0.52} width={w * 0.4} height={10} fill={M.light} opacity={0.2} />
      <rect x={x + (cube ? 86 : 80)} y={y + h * 0.72} width={w * 0.3} height={h * 0.12} fill={M.light} opacity={0.16} />

      {/* botón de encendido */}
      <circle cx={x + 35} cy={y + 8 + jitter(seed, 0, 1)} r={3.4} fill={accent} opacity={0.95} />

      {/* pies */}
      <rect x={x + 14} y={y + h} width={26} height={9} rx={1} fill={M.dark} />
      <rect x={x + w - 40} y={y + h} width={26} height={9} rx={1} fill={M.dark} />
    </g>
  )
}

// ══════════════════════════════════════════════════════════════ accesorios

function FanPack({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <Shadow cx={200} cy={250} rx={130} ry={14} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 26 - 26} ${i * 17 - 17})`}>
          <rect x={92} y={70} width={134} height={134} rx={5} fill={G.metal} />
          <EdgeLight x={93} y={71} w={132} h={6} />
          <rect x={92} y={70} width={134} height={134} rx={5} fill="none" stroke={M.edge} strokeWidth={1} />
          <Fan cx={159} cy={137} r={57} seed={seed} index={i} blades={11} />
          {[
            [103, 81],
            [215, 81],
            [103, 193],
            [215, 193],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4.2} fill={M.dark} stroke={M.edge} strokeWidth={0.6} />
          ))}
          <rect x={92} y={70} width={134} height={5} fill={accent} opacity={0.55} />
        </g>
      ))}
    </g>
  )
}

function Paste({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <Shadow cx={190} cy={200} rx={110} ry={12} />
      <rect x={90} y={126} width={172} height={42} rx={5} fill={G.metal} />
      <EdgeLight x={91} y={127} w={170} h={6} />
      <rect x={90} y={126} width={172} height={42} rx={5} fill="none" stroke={M.edge} strokeWidth={1} />
      <rect x={104} y={138} width={82} height={18} rx={1} fill={M.dark} opacity={0.75} />
      <rect x={110} y={143} width={46} height={5} fill={accent} opacity={0.95} />
      <rect x={62} y={134} width={28} height={26} rx={2} fill={G.metalLight} />
      <rect x={50} y={128} width={13} height={38} rx={2} fill={M.hi} opacity={0.8} />
      <path d="M262 140 h30 l15 8 l-15 8 h-30 z" fill={G.metalLight} />
      <path d="M262 140 h30 l15 8 l-15 8 h-30 z" fill="none" stroke={M.dark} strokeWidth={0.8} />
      <rect
        x={116}
        y={198}
        width={132}
        height={10}
        rx={2}
        fill={M.hi}
        opacity={0.5}
        transform={`rotate(${-4 + jitter(seed, 1, 3)} 182 203)`}
      />
    </g>
  )
}

// ══════════════════════════════════════════════════════════════════ cotas

function Dimensions({ dims }: { dims: string[] }): ReactElement {
  const [main, ...notes] = dims
  return (
    <g fontFamily="var(--font-mono), monospace" fontSize={10}>
      {main ? (
        <g>
          <line x1={26} y1={276} x2={374} y2={276} stroke="var(--color-sky)" strokeWidth={1} />
          <line x1={26} y1={270} x2={26} y2={282} stroke="var(--color-sky)" strokeWidth={1} />
          <line x1={374} y1={270} x2={374} y2={282} stroke="var(--color-sky)" strokeWidth={1} />
          <rect x={144} y={267} width={112} height={18} fill="var(--color-carbon)" />
          <text x={200} y={280} textAnchor="middle" fill="var(--color-sky)" letterSpacing="0.1em">
            {main}
          </text>
        </g>
      ) : null}
      {notes.slice(0, 2).map((note, i) => (
        <g key={note}>
          <line x1={20} y1={18 + i * 18} x2={36} y2={18 + i * 18} stroke="var(--color-steel)" strokeWidth={1} />
          <text x={42} y={21 + i * 18} fill="var(--color-steel)" letterSpacing="0.08em">
            {note}
          </text>
        </g>
      ))}
    </g>
  )
}

const SHAPES: Record<RenderSpec['shape'], (props: ShapeProps) => ReactElement> = {
  gpu: Gpu,
  cpu: Cpu,
  motherboard: Motherboard,
  ram: Ram,
  'ssd-m2': SsdM2,
  'ssd-sata': SsdSata,
  psu: Psu,
  'air-cooler': AirCooler,
  'aio-cooler': AioCooler,
  case: Case,
  fan: FanPack,
  paste: Paste,
  accessory: FanPack,
}

export function ComponentRender({
  shape,
  accent,
  seed,
  fans,
  variant,
  view = 'front',
  dims,
  className,
  title,
}: ComponentRenderProps) {
  const Shape = SHAPES[shape]
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <Shape accent={accent} seed={seed} fans={fans} variant={variant} />
      {view === 'annotated' && dims && dims.length > 0 ? <Dimensions dims={dims} /> : null}
    </svg>
  )
}

/**
 * Solo la capa de cotas, para superponerla sobre un dibujo que ya está en la
 * página. Dibujar la pieza dos veces —limpia y anotada— duplicaba el peso del
 * HTML de cada ficha sin aportar un píxel nuevo.
 */
export function ComponentDims({ dims, className }: { dims: string[]; className?: string }) {
  if (dims.length === 0) return null
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true" focusable="false">
      <Dimensions dims={dims} />
    </svg>
  )
}
