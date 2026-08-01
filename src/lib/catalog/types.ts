import type { L10n } from '@/lib/i18n/locales'

export const CATEGORIES = [
  'tarjetas-graficas',
  'procesadores',
  'placas-madre',
  'memorias-ram',
  'almacenamiento',
  'fuentes',
  'refrigeracion',
  'gabinetes',
  'accesorios',
] as const

export type CategorySlug = (typeof CATEGORIES)[number]

/** Sockets que el configurador sabe comparar. */
export const SOCKETS = ['AM5', 'AM4', 'LGA1700', 'LGA1851'] as const
export type Socket = (typeof SOCKETS)[number]

export type MemoryGen = 'DDR4' | 'DDR5'
export type FormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX'

/**
 * Ficha de compatibilidad. Es un tipo discriminado a propósito: el configurador
 * no puede comparar un socket contra un disco porque el compilador no lo permite.
 */
export type Compat =
  | {
      kind: 'gpu'
      /** Longitud física de la tarjeta en milímetros. */
      lengthMm: number
      slots: number
      /** Consumo de la tarjeta declarado por el fabricante. */
      tgpW: number
      /** Fuente recomendada por el fabricante para el sistema completo. */
      recommendedPsuW: number
      power: string
      bus: string
      vramGb: number
      vramType: string
      busWidthBit: number
    }
  | {
      kind: 'cpu'
      socket: Socket
      tdpW: number
      cores: number
      threads: number
      igpu: boolean
      /**
       * La generación de memoria NO vive acá a propósito: quien impone el zócalo
       * físico del módulo es la placa madre, no el procesador (un LGA1700 admite
       * DDR4 o DDR5 según la placa). La comprobación DDR se hace RAM ↔ placa.
       */
    }
  | {
      kind: 'motherboard'
      socket: Socket
      memory: MemoryGen
      formFactor: FormFactor
      memorySlots: number
      chipset: string
    }
  | {
      kind: 'ram'
      memory: MemoryGen
      capacityGb: number
      modules: number
      speedMts: number
      latency: string
    }
  | {
      kind: 'storage'
      format: 'M.2 2280' | '2.5"'
      bus: string
      capacityGb: number
      readMBs: number
      writeMBs: number
    }
  | {
      kind: 'psu'
      wattsW: number
      efficiency: string
      modular: string
      formFactor: 'ATX'
    }
  | {
      kind: 'cooling'
      type: 'aire' | 'liquida'
      /** Altura del disipador de aire. */
      heightMm?: number
      /** Longitud del radiador de refrigeración líquida. */
      radiatorMm?: number
      sockets: Socket[]
    }
  | {
      kind: 'case'
      supports: FormFactor[]
      maxGpuMm: number
      maxCoolerMm: number
      maxRadiatorMm: number
    }
  | { kind: 'accessory' }

export type CompatKind = Compat['kind']

/**
 * Par etiqueta/valor de la ficha técnica.
 *
 * El valor es `string` cuando es un dato puro (`"360 W"`, `"PCIe 5.0 ×16"`) y
 * `L10n` solo cuando de verdad es prosa que cambia de idioma («Totalmente
 * modular» / «Totalmente modular», «Cableado fijo» / «Cabeamento fixo»).
 */
export interface Spec {
  label: L10n
  value: string | L10n
}

/** Cómo se dibuja el render vectorial de la pieza. */
export interface RenderSpec {
  /** Familia de dibujo; determina la silueta. */
  shape:
    | 'gpu'
    | 'cpu'
    | 'motherboard'
    | 'ram'
    | 'ssd-m2'
    | 'ssd-sata'
    | 'psu'
    | 'air-cooler'
    | 'aio-cooler'
    | 'case'
    | 'fan'
    | 'paste'
    | 'accessory'
  /** Acento propio de la pieza (disipador, PCB, ventilador). De la paleta de la casa. */
  accent: string
  /** Semilla estable para las variaciones de dibujo. Nunca aleatoria. */
  seed: number
  /**
   * Diseño concreto dentro de la familia. No es un matiz: cambia la pieza.
   * En placas de video elige la carcasa, en gabinetes el frente, en disipadores
   * si es de una torre o de dos. Es lo que hace que cada producto tenga SU
   * dibujo y no el icono de su categoría.
   */
  variant?: number
  /** Cantidad de ventiladores donde la silueta los admite. */
  fans?: number
}

export interface ProductMedia {
  primary: string
  secondary?: string
  alt: L10n
  sourcePage: string
  credit: string
  objectPosition?: string
}

export interface Product {
  slug: string
  /** Código de referencia interno, estable y dictable por teléfono. */
  ref: string
  name: string
  brand: string
  model: string
  category: CategorySlug
  /** Precio de venta en USD — fuente de verdad de las tres monedas. */
  priceUsd: number
  /** Precio anterior. Si existe y es mayor, la oferta se DERIVA de la diferencia. */
  listPriceUsd?: number
  /**
   * Unidades configuradas por el operador. Los estados visibles se derivan de
   * este número; no hay ningún campo «agotado» que se pueda contradecir con él.
   */
  units: number
  /** Se marca a mano solo lo que es un hecho de calendario, no un estado. */
  arrivedRecently?: boolean
  featured?: boolean
  blurb: L10n
  specs: Spec[]
  compat: Compat
  render: RenderSpec
  media: ProductMedia
}

export type CatalogProduct = Omit<Product, 'media'>

/** Estado derivado — nunca declarado en los datos. */
export type Availability = 'disponible' | 'ultimas-unidades' | 'agotado'

export function availabilityOf(product: Product, lowStockAt: number): Availability {
  if (product.units <= 0) return 'agotado'
  if (product.units <= lowStockAt) return 'ultimas-unidades'
  return 'disponible'
}
