/**
 * REGLAS DE COMPATIBILIDAD
 *
 * Son comprobaciones FUNDAMENTALES, no una validación exhaustiva de todas las
 * combinaciones posibles del mercado. Comprueban lo que hace que un armado
 * directamente no funcione o no entre:
 *
 *   1. El procesador y la placa madre comparten zócalo.
 *   2. El módulo de memoria entra físicamente en la ranura de la placa (DDR4 ≠ DDR5).
 *   3. La placa madre cabe en el gabinete por formato.
 *   4. La placa de video cabe en el gabinete por longitud.
 *   5. El disipador cabe en el gabinete por altura, o el radiador por longitud.
 *   6. El disipador tiene anclaje para el zócalo del procesador.
 *   7. La fuente llega al vataje que el fabricante de la placa de video recomienda.
 *
 * Lo que NO comprueban y la interfaz declara: perfiles de memoria validados por
 * la placa (QVL), altura de los disipadores de la RAM contra el disipador del
 * procesador, versiones de BIOS, ni disponibilidad de conectores concretos.
 */

import type { L10n } from '@/lib/i18n/locales'
import type { Compat, CompatKind, Product } from '@/lib/catalog/types'

/** Ranuras del configurador. Una pieza por ranura. */
export const BUILD_SLOTS = [
  'cpu',
  'motherboard',
  'ram',
  'gpu',
  'storage',
  'psu',
  'cooling',
  'case',
] as const

export type BuildSlot = (typeof BUILD_SLOTS)[number]

export type Build = Partial<Record<BuildSlot, Product>>

/** La ranura a la que pertenece cada tipo de ficha de compatibilidad. */
export const SLOT_OF_KIND: Partial<Record<CompatKind, BuildSlot>> = {
  cpu: 'cpu',
  motherboard: 'motherboard',
  ram: 'ram',
  gpu: 'gpu',
  storage: 'storage',
  psu: 'psu',
  cooling: 'cooling',
  case: 'case',
}

export type IssueLevel = 'bloqueo' | 'aviso' | 'nota'

export interface Issue {
  id: string
  level: IssueLevel
  /** Ranuras implicadas: el tablero pinta ese tramo del trazado. */
  slots: BuildSlot[]
  title: L10n
  detail: L10n
}

/** Estrecha la ficha de un producto a un tipo concreto, o `null`. */
function compatOf<K extends CompatKind>(
  product: Product | undefined,
  kind: K,
): Extract<Compat, { kind: K }> | null {
  if (!product) return null
  if (product.compat.kind !== kind) return null
  return product.compat as Extract<Compat, { kind: K }>
}

/** Consumo estimado del sistema: placa de video + procesador + resto del equipo. */
export const BASELINE_SYSTEM_W = 90

export function estimatedDrawW(build: Build): number | null {
  const gpu = compatOf(build.gpu, 'gpu')
  const cpu = compatOf(build.cpu, 'cpu')
  if (!gpu && !cpu) return null
  return (gpu?.tgpW ?? 0) + (cpu?.tdpW ?? 0) + BASELINE_SYSTEM_W
}

/**
 * Fuente sugerida: el mayor entre lo que recomienda el fabricante de la placa de
 * video y el consumo estimado con un 40 % de margen, redondeado a 50 W.
 */
export function suggestedPsuW(build: Build): number | null {
  const draw = estimatedDrawW(build)
  const gpu = compatOf(build.gpu, 'gpu')
  if (draw === null && !gpu) return null
  const withHeadroom = draw === null ? 0 : Math.ceil((draw * 1.4) / 50) * 50
  return Math.max(gpu?.recommendedPsuW ?? 0, withHeadroom)
}

export function checkBuild(build: Build): Issue[] {
  const issues: Issue[] = []

  const cpu = compatOf(build.cpu, 'cpu')
  const board = compatOf(build.motherboard, 'motherboard')
  const ram = compatOf(build.ram, 'ram')
  const gpu = compatOf(build.gpu, 'gpu')
  const psu = compatOf(build.psu, 'psu')
  const cooling = compatOf(build.cooling, 'cooling')
  const box = compatOf(build.case, 'case')

  // 1 · Zócalo del procesador contra el de la placa madre.
  if (cpu && board && cpu.socket !== board.socket) {
    issues.push({
      id: 'socket',
      level: 'bloqueo',
      slots: ['cpu', 'motherboard'],
      title: {
        es: 'El procesador no entra en esta placa',
        pt: 'O processador não encaixa nesta placa',
      },
      detail: {
        es: `El procesador es de zócalo ${cpu.socket} y la placa es ${board.socket}. Son físicamente distintos: no hay adaptador que los una. Cambiá uno de los dos.`,
        pt: `O processador é soquete ${cpu.socket} e a placa é ${board.socket}. São fisicamente diferentes: não existe adaptador. Troque um dos dois.`,
      },
    })
  }

  // 2 · Generación de memoria contra la ranura de la placa.
  if (ram && board && ram.memory !== board.memory) {
    issues.push({
      id: 'ddr',
      level: 'bloqueo',
      slots: ['ram', 'motherboard'],
      title: {
        es: 'La memoria no entra en esta placa',
        pt: 'A memória não encaixa nesta placa',
      },
      detail: {
        es: `El kit es ${ram.memory} y la placa acepta ${board.memory}. La muesca del módulo está en otra posición, así que ni siquiera entra en la ranura.`,
        pt: `O kit é ${ram.memory} e a placa aceita ${board.memory}. O entalhe do módulo está em outra posição, então ele nem entra no slot.`,
      },
    })
  }

  // 3 · Cantidad de módulos contra ranuras disponibles.
  if (ram && board && ram.modules > board.memorySlots) {
    issues.push({
      id: 'ram-slots',
      level: 'bloqueo',
      slots: ['ram', 'motherboard'],
      title: { es: 'Faltan ranuras de memoria', pt: 'Faltam slots de memória' },
      detail: {
        es: `El kit trae ${ram.modules} módulos y la placa tiene ${board.memorySlots} ranuras.`,
        pt: `O kit traz ${ram.modules} módulos e a placa tem ${board.memorySlots} slots.`,
      },
    })
  }

  // 4 · Formato de la placa contra el gabinete.
  if (board && box && !box.supports.includes(board.formFactor)) {
    issues.push({
      id: 'form-factor',
      level: 'bloqueo',
      slots: ['motherboard', 'case'],
      title: { es: 'La placa no entra en el gabinete', pt: 'A placa não cabe no gabinete' },
      detail: {
        es: `La placa es ${board.formFactor} y este gabinete acepta ${box.supports.join(', ')}. Los puntos de anclaje no coinciden.`,
        pt: `A placa é ${board.formFactor} e este gabinete aceita ${box.supports.join(', ')}. Os pontos de fixação não coincidem.`,
      },
    })
  }

  // 5 · Longitud de la placa de video contra el gabinete.
  if (gpu && box && gpu.lengthMm > box.maxGpuMm) {
    issues.push({
      id: 'gpu-length',
      level: 'bloqueo',
      slots: ['gpu', 'case'],
      title: { es: 'La placa de video es más larga que el gabinete', pt: 'A placa de vídeo é mais longa que o gabinete' },
      detail: {
        es: `La tarjeta mide ${gpu.lengthMm} mm y el gabinete admite hasta ${box.maxGpuMm} mm. Faltan ${gpu.lengthMm - box.maxGpuMm} mm.`,
        pt: `A placa mede ${gpu.lengthMm} mm e o gabinete aceita até ${box.maxGpuMm} mm. Faltam ${gpu.lengthMm - box.maxGpuMm} mm.`,
      },
    })
  } else if (gpu && box && box.maxGpuMm - gpu.lengthMm <= 15) {
    issues.push({
      id: 'gpu-length-tight',
      level: 'aviso',
      slots: ['gpu', 'case'],
      title: { es: 'La placa de video entra justa', pt: 'A placa de vídeo entra apertada' },
      detail: {
        es: `Quedan ${box.maxGpuMm - gpu.lengthMm} mm de margen. Entra, pero los cables de alimentación del frente pueden quedar forzados.`,
        pt: `Sobram ${box.maxGpuMm - gpu.lengthMm} mm de folga. Cabe, mas os cabos de energia da frente podem ficar forçados.`,
      },
    })
  }

  // 6 · Anclaje del disipador contra el zócalo del procesador.
  if (cooling && cpu && !cooling.sockets.includes(cpu.socket)) {
    issues.push({
      id: 'cooler-socket',
      level: 'bloqueo',
      slots: ['cooling', 'cpu'],
      title: { es: 'El disipador no tiene anclaje para este procesador', pt: 'O cooler não tem suporte para este processador' },
      detail: {
        es: `El disipador trae anclaje para ${cooling.sockets.join(', ')} y el procesador es ${cpu.socket}.`,
        pt: `O cooler traz suporte para ${cooling.sockets.join(', ')} e o processador é ${cpu.socket}.`,
      },
    })
  }

  // 7 · Altura del disipador de aire contra el gabinete.
  if (cooling?.type === 'aire' && cooling.heightMm && box && cooling.heightMm > box.maxCoolerMm) {
    issues.push({
      id: 'cooler-height',
      level: 'bloqueo',
      slots: ['cooling', 'case'],
      title: { es: 'El disipador es más alto que el gabinete', pt: 'O cooler é mais alto que o gabinete' },
      detail: {
        es: `El disipador mide ${cooling.heightMm} mm de alto y el gabinete admite ${box.maxCoolerMm} mm. La tapa lateral no cierra.`,
        pt: `O cooler tem ${cooling.heightMm} mm de altura e o gabinete aceita ${box.maxCoolerMm} mm. A tampa lateral não fecha.`,
      },
    })
  }

  // 8 · Longitud del radiador contra el gabinete.
  if (cooling?.type === 'liquida' && cooling.radiatorMm && box && cooling.radiatorMm > box.maxRadiatorMm) {
    issues.push({
      id: 'radiator',
      level: 'bloqueo',
      slots: ['cooling', 'case'],
      title: { es: 'El radiador no entra en el gabinete', pt: 'O radiador não cabe no gabinete' },
      detail: {
        es: `El radiador es de ${cooling.radiatorMm} mm y el gabinete admite hasta ${box.maxRadiatorMm} mm.`,
        pt: `O radiador é de ${cooling.radiatorMm} mm e o gabinete aceita até ${box.maxRadiatorMm} mm.`,
      },
    })
  }

  // 9 · Fuente contra lo recomendado por el fabricante de la placa de video.
  if (gpu && psu && psu.wattsW < gpu.recommendedPsuW) {
    issues.push({
      id: 'psu-under',
      level: 'aviso',
      slots: ['psu', 'gpu'],
      title: { es: 'La fuente está por debajo de lo recomendado', pt: 'A fonte está abaixo do recomendado' },
      detail: {
        es: `El fabricante de la placa de video recomienda ${gpu.recommendedPsuW} W para el sistema completo y esta fuente entrega ${psu.wattsW} W. Puede funcionar y apagarse en los picos de carga.`,
        pt: `O fabricante da placa de vídeo recomenda ${gpu.recommendedPsuW} W para o sistema completo e esta fonte entrega ${psu.wattsW} W. Pode funcionar e desligar nos picos de carga.`,
      },
    })
  }

  // 10 · Un procesador sin video integrado y sin placa de video no da imagen.
  if (cpu && !cpu.igpu && !gpu) {
    issues.push({
      id: 'no-display',
      level: 'aviso',
      slots: ['cpu', 'gpu'],
      title: { es: 'Este armado no daría imagen', pt: 'Esta montagem não daria imagem' },
      detail: {
        es: 'El procesador elegido no tiene video integrado y no hay placa de video en el armado.',
        pt: 'O processador escolhido não tem vídeo integrado e não há placa de vídeo na montagem.',
      },
    })
  }

  return issues
}

/** Resumen para el encabezado del configurador. */
export function summarize(issues: Issue[]): {
  blocking: number
  warnings: number
  status: 'vacio' | 'ok' | 'aviso' | 'bloqueo'
} {
  const blocking = issues.filter((i) => i.level === 'bloqueo').length
  const warnings = issues.filter((i) => i.level === 'aviso').length
  const status: 'ok' | 'aviso' | 'bloqueo' = blocking > 0 ? 'bloqueo' : warnings > 0 ? 'aviso' : 'ok'
  return { blocking, warnings, status }
}
