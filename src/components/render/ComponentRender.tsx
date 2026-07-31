import type { ReactElement } from 'react'
import type { RenderSpec } from '@/lib/catalog/types'

/**
 * RENDERS DE COMPONENTES
 *
 * Todo el material gráfico de la tienda es autoral y vectorial. La decisión no es
 * estética sino práctica: no hay fotografía de producto con derechos, y un dibujo
 * propio garantiza las dos cosas que el sistema pide — registro unificado (misma
 * vista, misma luz, misma escala relativa dentro de una categoría) y cero marcas
 * ajenas.
 *
 * Cada pieza tiene dos vistas, como en un muestrario impreso:
 *   · `front`     — la pieza.
 *   · `annotated` — el MISMO negativo con la capa de cotas encima. No es otra
 *                   imagen. Es lo que cruza en hover, en 400 ms.
 *
 * Todos comparten `viewBox="0 0 400 300"`, luz desde arriba-izquierda y la misma
 * paleta de materiales. Nada de esto usa `Math.random()`: la variación sale de la
 * semilla del producto, así que servidor y navegador dibujan lo mismo.
 */

const M = {
  dark: '#12171C',
  body: '#232B33',
  light: '#39434D',
  edge: '#6E7A85',
  hi: '#9AA5AF',
  pcb: '#1B2229',
  gold: '#A98A4E',
  copper: '#B87A4E',
} as const

interface ShapeProps {
  accent: string
  seed: number
  fans?: number
}

export interface ComponentRenderProps extends RenderSpec {
  variant?: 'front' | 'annotated'
  /** Cotas de la vista anotada. La primera se dibuja como regla horizontal. */
  dims?: string[]
  className?: string
  /** Si se pasa, el dibujo es contenido con nombre; si no, es decorativo. */
  title?: string
}

/** Ruido determinista a partir de la semilla. */
function jitter(seed: number, index: number, amount: number): number {
  const h = (seed * 2654435761 + index * 40503) % 1024
  return +(((h / 1024) * 2 - 1) * amount).toFixed(2)
}

function Fan({
  cx,
  cy,
  r,
  seed,
  index,
}: {
  cx: number
  cy: number
  r: number
  seed: number
  index: number
}) {
  const blades = 9
  const rot = 8 + jitter(seed, index, 14)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={M.dark} />
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={M.light} strokeWidth={1} />
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        {Array.from({ length: blades }, (_, i) => {
          const a = (i / blades) * Math.PI * 2
          const x1 = +(cx + Math.cos(a) * (r * 0.28)).toFixed(3)
          const y1 = +(cy + Math.sin(a) * (r * 0.28)).toFixed(3)
          const x2 = +(cx + Math.cos(a + 0.5) * (r * 0.92)).toFixed(3)
          const y2 = +(cy + Math.sin(a + 0.5) * (r * 0.92)).toFixed(3)
          const mx = +((x1 + x2) / 2 + 3).toFixed(3)
          const my = +((y1 + y2) / 2).toFixed(3)
          return (
            <path
              key={i}
              d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
              stroke={M.edge}
              strokeWidth={+(r * 0.17).toFixed(2)}
              strokeLinecap="round"
              fill="none"
              opacity={0.5}
            />
          )
        })}
      </g>
      <circle cx={cx} cy={cy} r={+(r * 0.26).toFixed(2)} fill={M.light} />
      <circle cx={cx} cy={cy} r={+(r * 0.26).toFixed(2)} fill="none" stroke={M.edge} strokeWidth={0.75} />
      <circle
        cx={+(cx - r * 0.09).toFixed(2)}
        cy={+(cy - r * 0.09).toFixed(2)}
        r={+(r * 0.07).toFixed(2)}
        fill={M.hi}
        opacity={0.6}
      />
    </g>
  )
}

/** Peine de aletas de disipador. */
function Fins({
  x,
  y,
  w,
  h,
  count,
  vertical = true,
}: {
  x: number
  y: number
  w: number
  h: number
  count: number
  vertical?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={M.dark} />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count
        return vertical ? (
          <line
            key={i}
            x1={+(x + t * w).toFixed(2)}
            y1={y + 1.5}
            x2={+(x + t * w).toFixed(2)}
            y2={y + h - 1.5}
            stroke={M.edge}
            strokeWidth={0.9}
            opacity={0.55}
          />
        ) : (
          <line
            key={i}
            x1={x + 1.5}
            y1={+(y + t * h).toFixed(2)}
            x2={x + w - 1.5}
            y2={+(y + t * h).toFixed(2)}
            stroke={M.edge}
            strokeWidth={0.9}
            opacity={0.55}
          />
        )
      })}
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
    <g>
      {Array.from({ length: count }, (_, i) =>
        notchAt !== undefined && i === notchAt ? null : (
          <rect
            key={i}
            x={+(x + i * step + step * 0.16).toFixed(2)}
            y={y}
            width={+(step * 0.68).toFixed(2)}
            height={h}
            fill={M.gold}
            opacity={0.85}
          />
        ),
      )}
    </g>
  )
}

function Gpu({ accent, seed, fans = 3 }: ShapeProps): ReactElement {
  const fanCount = Math.max(1, Math.min(3, fans))
  const x = 52
  const w = 316
  const fanR = fanCount === 3 ? 40 : fanCount === 2 ? 48 : 56
  const gap = w / fanCount
  return (
    <g>
      <Fins x={x + 6} y={62} w={w - 12} h={16} count={44} />
      <rect x={x} y={196} width={w} height={16} fill={M.pcb} />
      <Contacts x={92} y={212} w={128} h={13} count={22} notchAt={4} />
      <rect x={x} y={76} width={w} height={122} rx={3} fill={M.body} />
      <rect x={x} y={76} width={w} height={122} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      <line x1={x + 1} y1={77.5} x2={x + w - 1} y2={77.5} stroke={M.hi} strokeWidth={1} opacity={0.35} />
      <rect x={x} y={186} width={w} height={4} fill={accent} opacity={0.85} />
      {Array.from({ length: fanCount }, (_, i) => (
        <Fan key={i} cx={+(x + gap * (i + 0.5)).toFixed(2)} cy={137} r={fanR} seed={seed} index={i} />
      ))}
      <rect x={30} y={70} width={12} height={150} fill={M.light} />
      <rect x={30} y={70} width={12} height={150} fill="none" stroke={M.edge} strokeWidth={0.75} />
      {[104, 130, 156, 182].map((oy) => (
        <rect key={oy} x={32} y={oy} width={8} height={14} rx={1} fill={M.dark} />
      ))}
      <rect x={286} y={64} width={44} height={11} rx={1.5} fill={M.dark} />
      <rect x={286} y={64} width={44} height={11} rx={1.5} fill="none" stroke={M.edge} strokeWidth={0.75} />
    </g>
  )
}

function Cpu({ accent, seed }: ShapeProps): ReactElement {
  const x = 122
  const y = 72
  const s = 156
  const ihs = `M${x + 22} ${y} H${x + s - 22} L${x + s} ${y + 22} V${y + s - 22} L${x + s - 22} ${y + s} H${x + 22} L${x} ${y + s - 22} V${y + 22} Z`
  return (
    <g>
      <rect x={x - 10} y={y - 10} width={s + 20} height={s + 20} rx={3} fill={M.pcb} />
      <rect x={x - 10} y={y - 10} width={s + 20} height={s + 20} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      <path d={`M${x - 5} ${y + s + 5} l0 -12 l12 12 z`} fill={accent} />
      <path d={ihs} fill={M.light} />
      <path d={ihs} fill="none" stroke={M.hi} strokeWidth={1} opacity={0.55} />
      <path d={`M${x + 24} ${y + 2} H${x + s - 24}`} stroke={M.hi} strokeWidth={1.5} opacity={0.45} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={x + 34}
          y={y + 58 + i * 15}
          width={88 - i * 22 + jitter(seed, i, 6)}
          height={3}
          fill={M.edge}
          opacity={0.55}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={x + 12 + i * 24} y={y + s + 6} width={12} height={5} fill={M.dark} />
      ))}
    </g>
  )
}

function Motherboard({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={44} y={34} width={312} height={232} rx={3} fill={M.pcb} />
      <rect x={44} y={34} width={312} height={232} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      {[
        [56, 46],
        [344, 46],
        [56, 254],
        [344, 254],
        [200, 46],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.5} fill={M.dark} stroke={M.edge} strokeWidth={0.75} />
      ))}
      <rect x={52} y={42} width={92} height={38} rx={2} fill={M.body} />
      <rect x={52} y={42} width={92} height={38} rx={2} fill="none" stroke={M.edge} strokeWidth={0.75} />
      <rect x={52} y={42} width={92} height={4} fill={accent} opacity={0.8} />
      <rect x={106} y={92} width={78} height={78} rx={2} fill={M.dark} />
      <rect x={106} y={92} width={78} height={78} rx={2} fill="none" stroke={M.edge} strokeWidth={1} />
      <rect x={114} y={100} width={62} height={62} fill={M.light} opacity={0.45} />
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1={116}
          y1={+(104 + i * 7.5).toFixed(1)}
          x2={174}
          y2={+(104 + i * 7.5).toFixed(1)}
          stroke={M.edge}
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}
      <Fins x={52} y={92} w={44} h={78} count={12} vertical={false} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={204 + i * 15} y={88} width={9} height={92} rx={1} fill={M.dark} />
          <rect x={204 + i * 15} y={88} width={9} height={92} rx={1} fill="none" stroke={M.edge} strokeWidth={0.5} />
          <rect x={204 + i * 15} y={88} width={9} height={5} fill={i < 2 ? accent : M.light} opacity={0.75} />
        </g>
      ))}
      {[196, 222].map((y, i) => (
        <g key={y}>
          <rect x={104} y={y} width={168 - i * 78} height={9} rx={1} fill={M.dark} />
          <rect x={104} y={y} width={168 - i * 78} height={9} rx={1} fill="none" stroke={M.edge} strokeWidth={0.5} />
        </g>
      ))}
      <rect x={104} y={182} width={140} height={8} rx={1} fill={M.body} />
      <rect x={104} y={182} width={140} height={8} rx={1} fill="none" stroke={M.edge} strokeWidth={0.5} />
      <rect x={286} y={196} width={58} height={54} rx={2} fill={M.light} />
      <rect x={286} y={196} width={58} height={54} rx={2} fill="none" stroke={M.hi} strokeWidth={0.75} opacity={0.6} />
      <path d="M292 242 l46 -38" stroke={accent} strokeWidth={2} opacity={0.7} />
      {[0, 1, 2, 3].map((i) => {
        const y = +(200 + i * 8 + jitter(seed, i, 2)).toFixed(2)
        return (
          <path
            key={i}
            d={`M252 ${y} h18 l10 -10 h26`}
            stroke={M.edge}
            strokeWidth={0.6}
            fill="none"
            opacity={0.4}
          />
        )
      })}
    </g>
  )
}

function Ram({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      {[0, 1].map((i) => {
        const y = 78 + i * 78
        return (
          <g key={i} transform={`translate(0 ${jitter(seed, i, 3)})`}>
            <rect x={54} y={y + 44} width={292} height={16} fill={M.pcb} />
            <Contacts x={72} y={y + 60} w={256} h={10} count={40} notchAt={13} />
            <rect x={54} y={y} width={292} height={48} rx={2} fill={M.body} />
            <rect x={54} y={y} width={292} height={48} rx={2} fill="none" stroke={M.edge} strokeWidth={1} />
            <line x1={55} y1={y + 1.5} x2={345} y2={y + 1.5} stroke={M.hi} strokeWidth={1} opacity={0.4} />
            {Array.from({ length: 26 }, (_, k) => (
              <rect key={k} x={+(64 + k * 10.6).toFixed(2)} y={y + 6} width={4} height={14} fill={M.dark} opacity={0.75} />
            ))}
            <rect x={64} y={y + 28} width={104} height={12} fill={accent} opacity={0.55} />
          </g>
        )
      })}
    </g>
  )
}

function SsdM2({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={40} y={124} width={320} height={52} rx={2} fill={M.pcb} />
      <rect x={40} y={124} width={320} height={52} rx={2} fill="none" stroke={M.edge} strokeWidth={1} />
      <Contacts x={44} y={168} w={58} h={8} count={12} notchAt={9} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={124 + i * 76}
          y={+(134 + jitter(seed, i, 1)).toFixed(2)}
          width={62}
          height={34}
          rx={1}
          fill={M.dark}
          stroke={M.light}
          strokeWidth={0.75}
        />
      ))}
      <rect x={126} y={140} width={58} height={22} fill={M.light} opacity={0.5} />
      <rect x={132} y={146} width={30} height={3} fill={accent} opacity={0.9} />
      <rect x={132} y={153} width={44} height={2} fill={M.edge} opacity={0.7} />
      <circle cx={350} cy={150} r={5} fill={M.dark} stroke={M.edge} strokeWidth={0.75} />
    </g>
  )
}

function SsdSata({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={72} y={78} width={256} height={162} rx={3} fill={M.body} />
      <rect x={72} y={78} width={256} height={162} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      <line x1={73} y1={79.5} x2={327} y2={79.5} stroke={M.hi} strokeWidth={1} opacity={0.35} />
      <rect x={96} y={104} width={140} height={62} fill={M.dark} opacity={0.55} />
      <rect x={108} y={118} width={72} height={4} fill={accent} opacity={0.9} />
      <rect x={108} y={130} width={104} height={3} fill={M.edge} opacity={0.7} />
      <rect x={108} y={139} width={86} height={3} fill={M.edge} opacity={0.5} />
      <rect x={286} y={182} width={42} height={16} fill={M.dark} />
      <rect x={286} y={204} width={42} height={22} fill={M.dark} />
      <rect x={286} y={182} width={42} height={16} fill="none" stroke={M.edge} strokeWidth={0.75} />
      <rect x={286} y={204} width={42} height={22} fill="none" stroke={M.edge} strokeWidth={0.75} />
      {[
        [90, 96],
        [90, 222],
        [310, 96],
      ].map(([cx, cy], i) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={+((cy ?? 0) + jitter(seed, i, 0.4)).toFixed(2)}
          r={4}
          fill={M.dark}
          stroke={M.edge}
          strokeWidth={0.75}
        />
      ))}
    </g>
  )
}

function Psu({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={64} y={72} width={272} height={168} rx={3} fill={M.body} />
      <rect x={64} y={72} width={272} height={168} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      <line x1={65} y1={73.5} x2={335} y2={73.5} stroke={M.hi} strokeWidth={1} opacity={0.35} />
      <Fan cx={186} cy={156} r={70} seed={seed} index={0} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={186} cy={156} r={12 + i * 8} fill="none" stroke={M.edge} strokeWidth={0.6} opacity={0.3} />
      ))}
      <rect x={286} y={92} width={40} height={128} rx={2} fill={M.dark} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={293} y={100 + i * 24} width={26} height={14} rx={1} fill={M.light} stroke={M.edge} strokeWidth={0.5} />
      ))}
      <rect x={76} y={86} width={64} height={20} fill={M.dark} opacity={0.75} />
      <rect x={82} y={93} width={40} height={5} fill={accent} opacity={0.9} />
    </g>
  )
}

function AirCooler({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <Fins x={214} y={44} w={104} h={172} count={30} />
      <rect x={214} y={44} width={104} height={172} fill="none" stroke={M.edge} strokeWidth={1} />
      <Fins x={82} y={44} w={104} h={172} count={30} />
      <rect x={82} y={44} width={104} height={172} fill="none" stroke={M.edge} strokeWidth={1} />
      <Fan cx={200} cy={130} r={46} seed={seed} index={1} />
      <rect x={152} y={82} width={96} height={96} rx={2} fill="none" stroke={M.edge} strokeWidth={1} opacity={0.7} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${112 + i * 26} 216 v22 q0 10 10 10 h${132 - i * 24} q10 0 10 -10 v-22`}
          stroke={M.copper}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}
      <rect x={152} y={244} width={96} height={16} rx={2} fill={M.hi} />
      <rect x={152} y={244} width={96} height={16} rx={2} fill="none" stroke={M.edge} strokeWidth={0.75} />
      <rect x={82} y={38} width={236} height={6} fill={accent} opacity={0.55} />
    </g>
  )
}

function AioCooler({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={36} y={58} width={216} height={72} rx={2} fill={M.dark} />
      <Fins x={40} y={62} w={208} h={64} count={40} />
      <rect x={36} y={58} width={216} height={72} rx={2} fill="none" stroke={M.edge} strokeWidth={1} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={40 + i * 70} y={62} width={66} height={64} rx={2} fill={M.body} opacity={0.9} />
          <Fan cx={73 + i * 70} cy={94} r={28} seed={seed} index={i} />
        </g>
      ))}
      <path d="M252 82 q56 4 62 56 q6 54 -44 62" stroke={M.light} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M252 106 q42 8 46 50 q4 44 -38 50" stroke={M.light} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M252 82 q56 4 62 56 q6 54 -44 62" stroke={M.edge} strokeWidth={1} fill="none" opacity={0.6} />
      <rect x={196} y={182} width={92} height={74} rx={3} fill={M.body} />
      <rect x={196} y={182} width={92} height={74} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      <circle cx={242} cy={219} r={26} fill={M.dark} stroke={M.light} strokeWidth={1} />
      <circle cx={242} cy={219} r={16} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.8} />
      <line x1={197} y1={183.5} x2={287} y2={183.5} stroke={M.hi} strokeWidth={1} opacity={0.35} />
    </g>
  )
}

function Case({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={112} y={28} width={176} height={244} rx={3} fill={M.body} />
      <rect x={112} y={28} width={176} height={244} rx={3} fill="none" stroke={M.edge} strokeWidth={1} />
      <line x1={113} y1={29.5} x2={287} y2={29.5} stroke={M.hi} strokeWidth={1} opacity={0.35} />
      <rect x={120} y={40} width={54} height={210} fill={M.dark} />
      {/* La malla es un patrón, no 182 círculos: mismo dibujo, una fracción de
          los bytes en el HTML. */}
      <defs>
        <pattern id="si-mesh" width={7.5} height={15.6} patternUnits="userSpaceOnUse">
          <circle cx={1.9} cy={1.9} r={1.55} fill={M.edge} opacity={0.3} />
          <circle cx={5.65} cy={9.7} r={1.55} fill={M.edge} opacity={0.3} />
        </pattern>
      </defs>
      <rect x={124} y={44} width={47} height={202} fill="url(#si-mesh)" />
      <rect x={182} y={40} width={96} height={210} fill={M.dark} opacity={0.55} />
      <rect x={182} y={40} width={96} height={210} fill="none" stroke={M.light} strokeWidth={1} />
      <rect x={196} y={62} width={62} height={78} fill={M.light} opacity={0.28} />
      <rect x={196} y={156} width={70} height={22} fill={M.light} opacity={0.22} />
      <rect x={196} y={206} width={54} height={30} fill={M.light} opacity={0.18} />
      <circle cx={147} cy={+(36 + jitter(seed, 0, 1)).toFixed(2)} r={3.5} fill={accent} opacity={0.9} />
      <rect x={126} y={272} width={26} height={8} rx={1} fill={M.dark} />
      <rect x={248} y={272} width={26} height={8} rx={1} fill={M.dark} />
    </g>
  )
}

function FanPack({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 24 - 24} ${i * 16 - 16})`}>
          <rect x={92} y={70} width={132} height={132} rx={4} fill={M.body} />
          <rect x={92} y={70} width={132} height={132} rx={4} fill="none" stroke={M.edge} strokeWidth={1} />
          <Fan cx={158} cy={136} r={56} seed={seed} index={i} />
          {[
            [102, 80],
            [214, 80],
            [102, 192],
            [214, 192],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={M.dark} stroke={M.edge} strokeWidth={0.6} />
          ))}
          <rect x={92} y={70} width={132} height={5} fill={accent} opacity={0.5} />
        </g>
      ))}
    </g>
  )
}

function Paste({ accent, seed }: ShapeProps): ReactElement {
  return (
    <g>
      <rect x={92} y={128} width={168} height={40} rx={4} fill={M.body} />
      <rect x={92} y={128} width={168} height={40} rx={4} fill="none" stroke={M.edge} strokeWidth={1} />
      <line x1={93} y1={129.5} x2={259} y2={129.5} stroke={M.hi} strokeWidth={1} opacity={0.35} />
      <rect x={106} y={140} width={78} height={16} fill={M.dark} opacity={0.7} />
      <rect x={112} y={145} width={44} height={4} fill={accent} opacity={0.9} />
      <rect x={64} y={136} width={28} height={24} rx={2} fill={M.light} />
      <rect x={54} y={130} width={12} height={36} rx={2} fill={M.hi} opacity={0.8} />
      <path d="M260 140 h30 l14 8 l-14 8 h-30 z" fill={M.light} />
      <path d="M260 140 h30 l14 8 l-14 8 h-30 z" fill="none" stroke={M.edge} strokeWidth={0.75} />
      <rect
        x={116}
        y={198}
        width={128}
        height={9}
        rx={2}
        fill={M.hi}
        opacity={0.55}
        transform={`rotate(${-4 + jitter(seed, 1, 3)} 180 202)`}
      />
    </g>
  )
}

/**
 * Capa de cotas. Una regla horizontal con topes para la medida que decide (la
 * longitud), y hasta dos notas al margen. El acento cian se usa acá en su rol
 * legítimo: filete de estado sobre 1 px.
 */
function Dimensions({ dims }: { dims: string[] }): ReactElement {
  const [main, ...notes] = dims
  return (
    <g fontFamily="var(--font-mono), monospace" fontSize={10}>
      {main ? (
        <g>
          <line x1={30} y1={272} x2={370} y2={272} stroke="var(--color-sky)" strokeWidth={1} />
          <line x1={30} y1={266} x2={30} y2={278} stroke="var(--color-sky)" strokeWidth={1} />
          <line x1={370} y1={266} x2={370} y2={278} stroke="var(--color-sky)" strokeWidth={1} />
          <rect x={144} y={263} width={112} height={18} fill="var(--color-carbon)" />
          <text x={200} y={276} textAnchor="middle" fill="var(--color-sky)" letterSpacing="0.1em">
            {main}
          </text>
        </g>
      ) : null}
      {notes.slice(0, 2).map((note, i) => (
        <g key={note}>
          <line
            x1={22}
            y1={20 + i * 18}
            x2={38}
            y2={20 + i * 18}
            stroke="var(--color-steel)"
            strokeWidth={1}
          />
          <text x={44} y={23 + i * 18} fill="var(--color-steel)" letterSpacing="0.08em">
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
  variant = 'front',
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
      <Shape accent={accent} seed={seed} fans={fans} />
      {variant === 'annotated' && dims && dims.length > 0 ? <Dimensions dims={dims} /> : null}
    </svg>
  )
}

/**
 * Solo la capa de cotas, para superponerla sobre un dibujo que ya está en la
 * página. Dibujar la pieza dos veces —una limpia y otra anotada— duplicaba el
 * peso del HTML de cada ficha sin aportar un solo píxel nuevo.
 */
export function ComponentDims({ dims, className }: { dims: string[]; className?: string }) {
  if (dims.length === 0) return null
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true" focusable="false">
      <Dimensions dims={dims} />
    </svg>
  )
}
