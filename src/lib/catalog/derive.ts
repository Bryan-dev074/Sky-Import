import type { Locale } from '@/lib/i18n/locales'
import type { Product } from './types'

/**
 * Todo lo de acá es DERIVADO de los datos del producto. Ninguna de estas cadenas
 * se escribe a mano en el catálogo, así que no puede contradecir a la ficha.
 */

/** La línea de una sola frase que decide en la grilla. */
export function headlineSpec(product: Product, locale: Locale): string {
  const c = product.compat
  switch (c.kind) {
    case 'gpu':
      return `${c.vramGb} GB ${c.vramType} · ${c.tgpW} W · ${c.lengthMm} mm`
    case 'cpu':
      return `${c.socket} · ${c.cores}${locale === 'es' ? ' núcleos' : ' núcleos'} / ${c.threads}`
    case 'motherboard':
      return `${c.socket} · ${c.formFactor} · ${c.memory}`
    case 'ram':
      return `${c.capacityGb} GB ${c.memory} · ${c.speedMts} MT/s ${c.latency}`
    case 'storage':
      return `${formatCapacity(c.capacityGb)} · ${c.format} · ${c.readMBs} MB/s`
    case 'psu':
      return `${c.wattsW} W · ${c.efficiency}`
    case 'cooling':
      return c.type === 'aire'
        ? `${locale === 'es' ? 'Aire' : 'Ar'} · ${c.heightMm} mm`
        : `${locale === 'es' ? 'Líquida' : 'Water cooler'} · ${c.radiatorMm} mm`
    case 'case':
      return `${c.supports[0]} · ${locale === 'es' ? 'GPU hasta' : 'GPU até'} ${c.maxGpuMm} mm`
    case 'accessory': {
      const first = product.specs[0]
      if (!first) return ''
      return typeof first.value === 'string' ? first.value : first.value[locale]
    }
  }
}

function formatCapacity(gb: number): string {
  return gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`
}

/** Cotas de la vista anotada: la primera es la regla horizontal. */
export function renderDims(product: Product, locale: Locale): string[] {
  const c = product.compat
  const es = locale === 'es'
  switch (c.kind) {
    case 'gpu':
      return [`${c.lengthMm} mm`, `${c.slots} ${es ? 'ranuras' : 'slots'}`, c.power]
    case 'cpu':
      return [c.socket, `${c.tdpW} W`, `${c.cores} / ${c.threads}`]
    case 'motherboard':
      return [c.formFactor, c.socket, `${c.memorySlots} × ${c.memory}`]
    case 'ram':
      return [`${c.modules} × ${c.capacityGb / c.modules} GB`, c.memory, `${c.speedMts} MT/s`]
    case 'storage':
      return [c.format, formatCapacity(c.capacityGb), c.bus]
    case 'psu':
      return [`${c.wattsW} W`, c.efficiency, c.formFactor]
    case 'cooling':
      return c.type === 'aire'
        ? [`${c.heightMm} mm`, es ? 'Altura' : 'Altura', c.sockets.join(' · ')]
        : [`${c.radiatorMm} mm`, es ? 'Radiador' : 'Radiador', c.sockets.join(' · ')]
    case 'case':
      return [
        `${c.maxGpuMm} mm`,
        `${es ? 'Disipador' : 'Cooler'} ${c.maxCoolerMm} mm`,
        c.supports.join(' · '),
      ]
    case 'accessory':
      return product.specs
        .slice(0, 3)
        .map((s) => (typeof s.value === 'string' ? s.value : s.value[locale]))
  }
}

/**
 * Qué condiciona esta pieza sobre el resto del armado. Es el bloque que explica
 * por qué la ficha va delante del precio.
 */
export function constraintsOf(product: Product, locale: Locale): string[] {
  const c = product.compat
  const es = locale === 'es'
  switch (c.kind) {
    case 'gpu':
      return [
        es
          ? `Necesita una fuente de ${c.recommendedPsuW} W para el sistema completo, según el fabricante.`
          : `Precisa de uma fonte de ${c.recommendedPsuW} W para o sistema completo, segundo o fabricante.`,
        es
          ? `Mide ${c.lengthMm} mm: el gabinete tiene que admitir al menos esa longitud.`
          : `Mede ${c.lengthMm} mm: o gabinete precisa aceitar pelo menos esse comprimento.`,
        es
          ? `Ocupa ${c.slots} ranuras de expansión y usa ${c.power}.`
          : `Ocupa ${c.slots} slots de expansão e usa ${c.power}.`,
      ]
    case 'cpu':
      return [
        es
          ? `Obliga a una placa madre de zócalo ${c.socket}.`
          : `Obriga a uma placa-mãe de soquete ${c.socket}.`,
        es
          ? `Disipa ${c.tdpW} W de potencia base: la refrigeración tiene que estar a la altura.`
          : `Dissipa ${c.tdpW} W de potência base: a refrigeração precisa dar conta.`,
        c.igpu
          ? es
            ? 'Tiene video integrado, así que puede dar imagen sin placa de video.'
            : 'Tem vídeo integrado, então pode dar imagem sem placa de vídeo.'
          : es
            ? 'No tiene video integrado: necesita sí o sí una placa de video.'
            : 'Não tem vídeo integrado: precisa obrigatoriamente de placa de vídeo.',
      ]
    case 'motherboard':
      return [
        es
          ? `Solo acepta procesadores de zócalo ${c.socket}.`
          : `Só aceita processadores de soquete ${c.socket}.`,
        es
          ? `Sus ${c.memorySlots} ranuras son ${c.memory}: un módulo de la otra generación no entra.`
          : `Seus ${c.memorySlots} slots são ${c.memory}: um módulo da outra geração não encaixa.`,
        es
          ? `Es ${c.formFactor}: el gabinete tiene que aceptar ese formato.`
          : `É ${c.formFactor}: o gabinete precisa aceitar esse formato.`,
      ]
    case 'ram':
      return [
        es
          ? `Es ${c.memory}. La placa madre tiene que ser ${c.memory}, sin excepción.`
          : `É ${c.memory}. A placa-mãe precisa ser ${c.memory}, sem exceção.`,
        es
          ? `Ocupa ${c.modules} ranuras de las que tenga la placa.`
          : `Ocupa ${c.modules} slots dos que a placa tiver.`,
        es
          ? `Los ${c.speedMts} MT/s se obtienen activando el perfil en la BIOS.`
          : `Os ${c.speedMts} MT/s se obtêm ativando o perfil na BIOS.`,
      ]
    case 'storage':
      return [
        c.format === 'M.2 2280'
          ? es
            ? 'Va montado sobre la placa madre: necesita una ranura M.2 libre.'
            : 'É montado sobre a placa-mãe: precisa de um slot M.2 livre.'
          : es
            ? 'Necesita una bahía de 2,5" y dos cables: datos y alimentación.'
            : 'Precisa de uma baia de 2,5" e dois cabos: dados e energia.',
        `${c.bus}.`,
      ]
    case 'psu':
      return [
        es
          ? `Entrega ${c.wattsW} W: tiene que igualar o superar lo que recomiende la placa de video.`
          : `Entrega ${c.wattsW} W: precisa igualar ou superar o que a placa de vídeo recomendar.`,
        `${c.efficiency}.`,
      ]
    case 'cooling':
      return [
        es
          ? `Tiene anclaje para ${c.sockets.join(', ')}.`
          : `Tem suporte para ${c.sockets.join(', ')}.`,
        c.type === 'aire'
          ? es
            ? `Mide ${c.heightMm} mm de alto: el gabinete tiene que admitirlo.`
            : `Tem ${c.heightMm} mm de altura: o gabinete precisa aceitar.`
          : es
            ? `El radiador es de ${c.radiatorMm} mm: el gabinete tiene que tener ese montaje.`
            : `O radiador é de ${c.radiatorMm} mm: o gabinete precisa ter essa fixação.`,
      ]
    case 'case':
      return [
        es
          ? `Acepta placas ${c.supports.join(', ')}.`
          : `Aceita placas ${c.supports.join(', ')}.`,
        es
          ? `Admite placas de video de hasta ${c.maxGpuMm} mm.`
          : `Aceita placas de vídeo de até ${c.maxGpuMm} mm.`,
        es
          ? `Disipador de hasta ${c.maxCoolerMm} mm y radiador de hasta ${c.maxRadiatorMm} mm.`
          : `Cooler de até ${c.maxCoolerMm} mm e radiador de até ${c.maxRadiatorMm} mm.`,
      ]
    case 'accessory':
      return []
  }
}
