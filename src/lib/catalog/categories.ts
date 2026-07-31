import type { L10n } from '@/lib/i18n/locales'
import type { CategorySlug } from './types'

export interface CategoryMeta {
  slug: CategorySlug
  name: L10n
  /** Una línea que dice qué decide esa categoría. No es marketing. */
  role: L10n
  /** Silueta que representa la categoría en el índice. */
  shape:
    | 'gpu'
    | 'cpu'
    | 'motherboard'
    | 'ram'
    | 'ssd-m2'
    | 'psu'
    | 'air-cooler'
    | 'case'
    | 'accessory'
}

export const CATEGORY_META: Record<CategorySlug, CategoryMeta> = {
  'tarjetas-graficas': {
    slug: 'tarjetas-graficas',
    name: { es: 'Tarjetas gráficas', pt: 'Placas de vídeo' },
    role: {
      es: 'Define el techo de rendimiento y el vataje de toda la máquina.',
      pt: 'Define o teto de desempenho e a potência de toda a máquina.',
    },
    shape: 'gpu',
  },
  procesadores: {
    slug: 'procesadores',
    name: { es: 'Procesadores', pt: 'Processadores' },
    role: {
      es: 'Fija el zócalo: a partir de acá quedan decididas placa y memoria.',
      pt: 'Define o soquete: a partir daqui, placa e memória ficam decididas.',
    },
    shape: 'cpu',
  },
  'placas-madre': {
    slug: 'placas-madre',
    name: { es: 'Placas madre', pt: 'Placas-mãe' },
    role: {
      es: 'Decide el formato del gabinete y qué generación de RAM entra.',
      pt: 'Decide o formato do gabinete e qual geração de RAM encaixa.',
    },
    shape: 'motherboard',
  },
  'memorias-ram': {
    slug: 'memorias-ram',
    name: { es: 'Memorias RAM', pt: 'Memórias RAM' },
    role: {
      es: 'DDR4 y DDR5 no son intercambiables: el módulo no entra en la ranura.',
      pt: 'DDR4 e DDR5 não são intercambiáveis: o módulo não entra no slot.',
    },
    shape: 'ram',
  },
  almacenamiento: {
    slug: 'almacenamiento',
    name: { es: 'SSD y almacenamiento', pt: 'SSD e armazenamento' },
    role: {
      es: 'M.2 va sobre la placa; SATA necesita bahía y dos cables.',
      pt: 'M.2 vai sobre a placa; SATA precisa de baia e dois cabos.',
    },
    shape: 'ssd-m2',
  },
  fuentes: {
    slug: 'fuentes',
    name: { es: 'Fuentes de alimentación', pt: 'Fontes de alimentação' },
    role: {
      es: 'La pieza que nadie mira hasta que apaga el equipo bajo carga.',
      pt: 'A peça que ninguém olha até desligar o equipamento sob carga.',
    },
    shape: 'psu',
  },
  refrigeracion: {
    slug: 'refrigeracion',
    name: { es: 'Refrigeración', pt: 'Refrigeração' },
    role: {
      es: 'Altura y radiador tienen que caber: son milímetros, no preferencias.',
      pt: 'Altura e radiador precisam caber: são milímetros, não preferências.',
    },
    shape: 'air-cooler',
  },
  gabinetes: {
    slug: 'gabinetes',
    name: { es: 'Gabinetes', pt: 'Gabinetes' },
    role: {
      es: 'El límite físico de todo lo demás: largo de placa de video y disipador.',
      pt: 'O limite físico de todo o resto: comprimento da placa de vídeo e do cooler.',
    },
    shape: 'case',
  },
  accesorios: {
    slug: 'accesorios',
    name: { es: 'Accesorios de armado', pt: 'Acessórios de montagem' },
    role: {
      es: 'Lo que falta a mitad del armado y frena todo hasta el lunes.',
      pt: 'O que falta no meio da montagem e trava tudo até segunda.',
    },
    shape: 'accessory',
  },
}

/** Orden de presentación: el recorrido real de quien arma una máquina. */
export const CATEGORY_ORDER: CategorySlug[] = [
  'tarjetas-graficas',
  'procesadores',
  'placas-madre',
  'memorias-ram',
  'almacenamiento',
  'fuentes',
  'refrigeracion',
  'gabinetes',
  'accesorios',
]
