import { describe, expect, it } from 'vitest'
import { PRODUCT_BY_SLUG, PRODUCTS } from '@/lib/catalog/products'
import { availabilityOf } from '@/lib/catalog/types'
import { RULES } from '@/config/site'
import {
  BASELINE_SYSTEM_W,
  checkBuild,
  estimatedDrawW,
  suggestedPsuW,
  summarize,
  type Build,
} from '@/lib/compat'

const get = (slug: string) => {
  const product = PRODUCT_BY_SLUG.get(slug)
  if (!product) throw new Error(`falta la pieza de prueba: ${slug}`)
  return product
}

const cpuAm5 = get('ryzen-7-9800x3d')
const cpuLga1700 = get('core-i5-14600k')
const boardAm5Atx = get('msi-mag-b850-tomahawk-wifi')
const boardLga1700Matx = get('gigabyte-b760m-ds3h')
const ramDdr5 = get('corsair-vengeance-ddr5-32gb-6000')
const ramDdr4 = get('corsair-vengeance-lpx-ddr4-16gb-3200')
const gpuBig = get('geforce-rtx-5080-16gb') // 304 mm · 360 W · pide 850 W
const gpuSmall = get('geforce-rtx-4060-8gb') // 200 mm · 115 W · pide 550 W
const psu650 = get('msi-mag-a650bn')
const psu1000 = get('corsair-rm1000x')
const caseSmall = get('cooler-master-masterbox-q300l') // Micro-ATX · GPU 360 · disipador 159
const caseItx = get('cooler-master-nr200p') // Mini-ITX · GPU 330 · disipador 155 · radiador 280
const caseBig = get('lian-li-lancool-216') // ATX · GPU 392 · disipador 180
const coolerTall = get('noctua-nh-d15') // 165 mm · sin LGA1851
const aio360 = get('arctic-liquid-freezer-iii-360')

const ids = (build: Build) => checkBuild(build).map((issue) => issue.id)

const caseWithGpuClearance = (maxGpuMm: number) => {
  if (caseItx.compat.kind !== 'case') throw new Error('el producto de prueba debe ser un gabinete')
  return { ...caseItx, compat: { ...caseItx.compat, maxGpuMm } }
}

describe('compatibilidad — zócalo', () => {
  it('detecta procesador y placa de zócalos distintos', () => {
    const issues = checkBuild({ cpu: cpuAm5, motherboard: boardLga1700Matx })
    expect(issues.map((i) => i.id)).toContain('socket')
    expect(issues.find((i) => i.id === 'socket')?.level).toBe('bloqueo')
  })

  it('no se queja cuando el zócalo coincide', () => {
    expect(ids({ cpu: cpuAm5, motherboard: boardAm5Atx })).not.toContain('socket')
  })

  it('explica el problema nombrando los dos zócalos, en los dos idiomas', () => {
    const issue = checkBuild({ cpu: cpuAm5, motherboard: boardLga1700Matx })[0]!
    expect(issue.detail.es).toContain('AM5')
    expect(issue.detail.es).toContain('LGA1700')
    expect(issue.detail.pt).toContain('AM5')
    expect(issue.detail.pt.length).toBeGreaterThan(20)
  })
})

describe('compatibilidad — memoria', () => {
  it('bloquea DDR4 en una placa DDR5', () => {
    expect(ids({ motherboard: boardAm5Atx, ram: ramDdr4 })).toContain('ddr')
  })

  it('acepta DDR5 en una placa DDR5', () => {
    expect(ids({ motherboard: boardAm5Atx, ram: ramDdr5 })).not.toContain('ddr')
  })

  it('la comprobación DDR es RAM contra placa, no contra procesador', () => {
    // Un LGA1700 admite DDR4 o DDR5 según la placa: con placa DDR5 y kit DDR5
    // no puede haber advertencia aunque el procesador sea de esa plataforma.
    expect(ids({ cpu: cpuLga1700, motherboard: boardLga1700Matx, ram: ramDdr5 })).toEqual([])
  })
})

describe('compatibilidad — física', () => {
  it('bloquea una placa ATX en un gabinete que solo acepta Micro-ATX', () => {
    expect(ids({ motherboard: boardAm5Atx, case: caseSmall })).toContain('form-factor')
  })

  it('bloquea una placa de video solo cuando supera el espacio real del gabinete', () => {
    // 304 mm de tarjeta en un gabinete que admite 303 mm.
    const issue = checkBuild({ gpu: gpuBig, case: caseWithGpuClearance(303) }).find(
      (candidate) => candidate.id === 'gpu-length',
    )
    expect(issue).toBeDefined()
    expect(issue?.level).toBe('bloqueo')
    expect(issue?.detail.es).toContain('304')
    expect(issue?.detail.es).toContain('303')
    // Y nombra exactamente cuántos milímetros faltan.
    expect(issue?.detail.es).toContain('1 mm')
  })

  it.each([304, 330, 335])(
    'no rechaza la RTX 5080 FE en un gabinete con %i mm disponibles',
    (maxGpuMm) => {
      expect(ids({ gpu: gpuBig, case: caseWithGpuClearance(maxGpuMm) })).not.toContain('gpu-length')
    },
  )

  it('avisa (sin bloquear) cuando la placa de video entra con menos de 15 mm de margen', () => {
    // 320 mm en un gabinete de 330 mm: entra con 10 mm, avisa pero no bloquea.
    const tight = checkBuild({ gpu: get('radeon-rx-9070-xt-16gb'), case: caseItx })
    const issue = tight.find((i) => i.id === 'gpu-length-tight')
    expect(issue?.level).toBe('aviso')
    // 304 mm en un gabinete de 392 mm: sobra margen, ni bloqueo ni aviso.
    expect(ids({ gpu: gpuBig, case: caseBig })).not.toContain('gpu-length-tight')
    expect(ids({ gpu: gpuBig, case: caseBig })).not.toContain('gpu-length')
  })

  it('bloquea un disipador más alto que el gabinete', () => {
    // Noctua 165 mm en un gabinete de 159 mm.
    expect(ids({ cooling: coolerTall, case: caseSmall })).toContain('cooler-height')
  })

  it('bloquea un radiador que no entra', () => {
    // 360 mm en un gabinete que admite 240 mm.
    expect(ids({ cooling: aio360, case: caseSmall })).toContain('radiator')
  })

  it('bloquea un disipador sin anclaje para el zócalo del procesador', () => {
    const cpu1851 = get('core-ultra-7-265k')
    expect(ids({ cpu: cpu1851, cooling: coolerTall })).toContain('cooler-socket')
    // El de refrigeración líquida sí trae anclaje LGA1851.
    expect(ids({ cpu: cpu1851, cooling: aio360 })).not.toContain('cooler-socket')
  })
})

describe('compatibilidad — energía', () => {
  it('avisa cuando la fuente queda por debajo de lo que recomienda el fabricante', () => {
    const issue = checkBuild({ gpu: gpuBig, psu: psu650 }).find((i) => i.id === 'psu-under')
    expect(issue?.level).toBe('aviso')
    expect(issue?.detail.es).toContain('850')
    expect(issue?.detail.es).toContain('650')
  })

  it('no avisa cuando la fuente alcanza', () => {
    expect(ids({ gpu: gpuBig, psu: psu1000 })).not.toContain('psu-under')
  })

  it('estima el consumo sumando placa de video, procesador y el resto del equipo', () => {
    const draw = estimatedDrawW({ gpu: gpuBig, cpu: cpuAm5 })
    expect(draw).toBe(360 + 120 + BASELINE_SYSTEM_W)
  })

  it('sugiere la mayor entre la recomendación del fabricante y el consumo con margen', () => {
    // Equipo modesto: manda la recomendación del fabricante (550 W).
    expect(suggestedPsuW({ gpu: gpuSmall, cpu: get('ryzen-5-9600x') })).toBe(550)
    // Equipo grande: manda el consumo con 40 % de margen, redondeado a 50.
    expect(suggestedPsuW({ gpu: gpuBig, cpu: cpuAm5 })).toBe(850)
  })

  it('no estima nada con el armado vacío', () => {
    expect(estimatedDrawW({})).toBeNull()
    expect(suggestedPsuW({})).toBeNull()
  })
})

describe('resumen del tablero', () => {
  it('un armado completo y coherente no tiene advertencias', () => {
    const build: Build = {
      cpu: cpuAm5,
      motherboard: boardAm5Atx,
      ram: ramDdr5,
      gpu: gpuBig,
      storage: get('samsung-990-pro-2tb'),
      psu: psu1000,
      cooling: aio360,
      case: caseBig,
    }
    const issues = checkBuild(build)
    expect(issues).toEqual([])
    expect(summarize(issues).status).toBe('ok')
  })

  it('el bloqueo pesa más que el aviso en el resumen', () => {
    const issues = checkBuild({
      cpu: cpuAm5,
      motherboard: boardLga1700Matx,
      gpu: gpuBig,
      psu: psu650,
    })
    const summary = summarize(issues)
    expect(summary.blocking).toBeGreaterThan(0)
    expect(summary.warnings).toBeGreaterThan(0)
    expect(summary.status).toBe('bloqueo')
  })
})

describe('integridad del catálogo', () => {
  it('no hay slugs ni códigos de referencia repetidos', () => {
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length)
    expect(new Set(PRODUCTS.map((p) => p.ref)).size).toBe(PRODUCTS.length)
  })

  it('todo producto tiene descripción y ficha en los dos idiomas', () => {
    for (const product of PRODUCTS) {
      expect(product.blurb.es.length).toBeGreaterThan(40)
      expect(product.blurb.pt.length).toBeGreaterThan(40)
      expect(product.specs.length).toBeGreaterThan(0)
      for (const spec of product.specs) {
        expect(spec.label.es.length).toBeGreaterThan(0)
        expect(spec.label.pt.length).toBeGreaterThan(0)
      }
    }
  })

  it('la disponibilidad se DERIVA de las unidades, no se declara', () => {
    for (const product of PRODUCTS) {
      const state = availabilityOf(product, RULES.lowStockAt)
      if (product.units <= 0) expect(state).toBe('agotado')
      else if (product.units <= RULES.lowStockAt) expect(state).toBe('ultimas-unidades')
      else expect(state).toBe('disponible')
    }
  })

  it('un precio anterior, si existe, es mayor que el precio de venta', () => {
    for (const product of PRODUCTS) {
      if (product.listPriceUsd !== undefined) {
        expect(product.listPriceUsd).toBeGreaterThan(product.priceUsd)
      }
    }
  })
})
