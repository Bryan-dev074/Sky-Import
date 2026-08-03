import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import {
  arrangeFiveIdenticalCopies,
  decontaminateNeutralBoundaryRgb,
  liftDarkProductRgb,
  PRODUCT_CUTOUT_RECIPES,
  TASK_6_PRODUCT_SLUGS,
  TASK_7_PRODUCT_SLUGS,
  pruneDiffuseNativeAlpha,
  rebuildProductCutout,
  removeWhiteBackground,
} from '../../scripts/lib/product-cutout-recipes.mjs'

function sha256(bytes: Buffer) {
  return createHash('sha256').update(bytes).digest('hex').toUpperCase()
}

async function countBrightNeutralBoundaryPixels(input: Buffer) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let count = 0
  for (let index = 0; index < info.width * info.height; index += 1) {
    const offset = index * info.channels
    if (data[offset + 3] === 0) continue
    const x = index % info.width
    const y = Math.floor(index / info.width)
    const touchesTransparency = [
      x > 0 ? index - 1 : -1,
      x + 1 < info.width ? index + 1 : -1,
      y > 0 ? index - info.width : -1,
      y + 1 < info.height ? index + info.width : -1,
    ].some((neighbor) => neighbor >= 0 && data[neighbor * info.channels + 3] === 0)
    if (!touchesTransparency) continue
    const red = data[offset]!
    const green = data[offset + 1]!
    const blue = data[offset + 2]!
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue)
    const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722
    if (luma >= 180 && chroma <= 24) count += 1
  }
  return count
}

test('versiona una receta completa para cada activo de Task 6', () => {
  expect(TASK_6_PRODUCT_SLUGS).toEqual([
    'kingston-fury-beast-ddr5-16gb-5600',
    'samsung-990-pro-2tb',
    'crucial-p3-plus-1tb',
    'samsung-870-evo-1tb',
    'seasonic-focus-gx-850',
  ])

  for (const slug of TASK_6_PRODUCT_SLUGS) {
    expect(PRODUCT_CUTOUT_RECIPES[slug], slug).toMatchObject({
      sourceSha256: expect.stringMatching(/^[A-F0-9]{64}$/),
      expectedOutputSha256: expect.stringMatching(/^[A-F0-9]{64}$/),
      operation: expect.stringMatching(/^(native-alpha|white-flood-matte)$/),
    })
  }
  expect(PRODUCT_CUTOUT_RECIPES['crucial-p3-plus-1tb']).toMatchObject({
    sourceSha256: '336EA4453CB15BAFF2C3D31CB338A1503EFCC3FB58E3F2931E8D00DE3817ECA0',
    operation: 'white-flood-matte',
    matte: { luma: 248, chroma: 18, featherPixels: 3, despill: true },
  })
})

test('versiona una receta completa y exacta para cada activo de Task 7', () => {
  expect(TASK_7_PRODUCT_SLUGS).toEqual([
    'noctua-nh-d15',
    'thermalright-peerless-assassin-120-se',
    'arctic-liquid-freezer-iii-360',
    'lian-li-lancool-216',
    'nzxt-h5-flow',
    'cooler-master-nr200p',
    'arctic-p12-pwm-pst-5-pack',
  ])

  for (const slug of TASK_7_PRODUCT_SLUGS) {
    expect(PRODUCT_CUTOUT_RECIPES[slug], slug).toMatchObject({
      sourceSha256: expect.stringMatching(/^[A-F0-9]{64}$/),
      expectedOutputSha256: expect.stringMatching(/^[A-F0-9]{64}$/),
      operation: expect.stringMatching(
        /^(native-alpha|white-flood-matte|native-alpha-prune-diffuse|native-alpha-tone-lift|white-flood-five-copy-grid)$/,
      ),
    })
  }
})

test('el manifiesto fija exactamente los mismos bytes de fuente que las recetas de Task 7', async () => {
  const manifest = JSON.parse(
    await readFile(join(process.cwd(), 'public', 'products', 'manifest.json'), 'utf8'),
  ) as Array<{ slug: string; sourceMediaType?: string; sourceSha256?: string }>

  for (const slug of TASK_7_PRODUCT_SLUGS) {
    const entry = manifest.find((candidate) => candidate.slug === slug)
    expect(entry, slug).toBeDefined()
    expect(entry?.sourceMediaType, slug).toMatch(/^image\/(?:jpeg|png)$/)
    expect(entry?.sourceSha256, slug).toBe(PRODUCT_CUTOUT_RECIPES[slug]?.sourceSha256)
  }
})

test('elimina la sombra alfa difusa sin erosionar el antialias adyacente del gabinete', async () => {
  const core = await sharp({
    create: { width: 4, height: 4, channels: 4, background: { r: 30, g: 30, b: 30, alpha: 1 } },
  })
    .png()
    .toBuffer()
  const antialias = await sharp({
    create: { width: 6, height: 6, channels: 4, background: { r: 30, g: 30, b: 30, alpha: 0.4 } },
  })
    .png()
    .toBuffer()
  const shadow = await sharp({
    create: { width: 8, height: 1, channels: 4, background: { r: 15, g: 15, b: 15, alpha: 0.24 } },
  })
    .png()
    .toBuffer()
  const fixture = await sharp({
    create: { width: 12, height: 12, channels: 4, background: '#00000000' },
  })
    .composite([
      { input: antialias, left: 2, top: 2 },
      { input: core, left: 3, top: 3 },
      { input: shadow, left: 2, top: 10 },
    ])
    .png()
    .toBuffer()

  const result = await pruneDiffuseNativeAlpha(fixture, { coreAlpha: 160, retainDistance: 2 })
  const { data, info } = await sharp(result).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const alphaAt = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3]

  expect(alphaAt(2, 2)).toBeGreaterThan(0)
  expect(alphaAt(3, 3)).toBe(255)
  expect(alphaAt(4, 10)).toBe(0)
})

test('compone exactamente cinco copias separadas e idénticas para el pack P12', async () => {
  const fan = await sharp({
    create: { width: 8, height: 8, channels: 4, background: '#202020' },
  })
    .png()
    .toBuffer()
  const layout = {
    width: 48,
    height: 32,
    itemSize: 8,
    positions: [
      { left: 2, top: 2 },
      { left: 20, top: 2 },
      { left: 38, top: 2 },
      { left: 11, top: 20 },
      { left: 29, top: 20 },
    ],
  }

  const first = await arrangeFiveIdenticalCopies(fan, layout)
  const second = await arrangeFiveIdenticalCopies(fan, layout)
  expect(second).toEqual(first)

  const { data, info } = await sharp(first).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const seen = new Uint8Array(info.width * info.height)
  let components = 0
  for (let start = 0; start < seen.length; start += 1) {
    if (seen[start] || data[start * info.channels + 3] === 0) continue
    components += 1
    const queue = [start]
    seen[start] = 1
    for (let head = 0; head < queue.length; head += 1) {
      const index = queue[head]!
      const x = index % info.width
      const y = Math.floor(index / info.width)
      for (const neighbor of [
        x > 0 ? index - 1 : -1,
        x + 1 < info.width ? index + 1 : -1,
        y > 0 ? index - info.width : -1,
        y + 1 < info.height ? index + info.width : -1,
      ]) {
        if (neighbor < 0 || seen[neighbor] || data[neighbor * info.channels + 3] === 0) continue
        seen[neighbor] = 1
        queue.push(neighbor)
      }
    }
  }
  expect(components).toBe(5)
})

test('el matte blanco atenúa y descontamina el borde sin dañar el sujeto', async () => {
  const source = await sharp({
    create: { width: 32, height: 32, channels: 3, background: '#ffffff' },
  })
    .composite([
      {
        input: await sharp({
          create: { width: 16, height: 16, channels: 3, background: '#dddddd' },
        })
          .composite([
            {
              input: await sharp({
                create: { width: 12, height: 12, channels: 3, background: '#161616' },
              })
                .png()
                .toBuffer(),
              left: 2,
              top: 2,
            },
          ])
          .png()
          .toBuffer(),
        left: 8,
        top: 8,
      },
    ])
    .png()
    .toBuffer()

  const result = await removeWhiteBackground(source, {
    luma: 248,
    chroma: 18,
    featherPixels: 3,
    despill: true,
  })
  const { data, info } = await sharp(result).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixel = (x: number, y: number) => {
    const offset = (y * info.width + x) * info.channels
    return [...data.subarray(offset, offset + info.channels)]
  }

  expect(pixel(0, 0)[3]).toBe(0)
  expect(pixel(8, 8)[3]).toBeLessThan(180)
  expect(Math.max(...pixel(8, 8).slice(0, 3))).toBeLessThan(220)
  expect(pixel(12, 12)).toEqual([22, 22, 22, 255])
})

test('propaga color interior en el halo neutral sin cambiar un solo valor alfa', async () => {
  const input = await sharp({
    create: { width: 18, height: 18, channels: 4, background: '#00000000' },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 14,
            height: 14,
            channels: 4,
            background: { r: 230, g: 230, b: 230, alpha: 0.35 },
          },
        })
          .composite([
            {
              input: await sharp({
                create: { width: 10, height: 10, channels: 4, background: '#202830ff' },
              })
                .png()
                .toBuffer(),
              left: 2,
              top: 2,
            },
            {
              input: await sharp({
                create: { width: 2, height: 2, channels: 4, background: '#ffffffff' },
              })
                .png()
                .toBuffer(),
              left: 6,
              top: 6,
            },
          ])
          .png()
          .toBuffer(),
        left: 2,
        top: 2,
      },
    ])
    .png()
    .toBuffer()
  const output = await decontaminateNeutralBoundaryRgb(input, {
    luma: 180,
    chroma: 24,
    maxDistance: 3,
  })
  const before = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const after = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  expect(after.info).toMatchObject({ width: before.info.width, height: before.info.height })
  for (let offset = 3; offset < before.data.length; offset += before.info.channels) {
    expect(after.data[offset], `alfa en píxel ${Math.floor(offset / before.info.channels)}`).toBe(
      before.data[offset],
    )
  }
  const protectedMarkOffset = (8 * before.info.width + 8) * before.info.channels
  expect(after.data.subarray(protectedMarkOffset, protectedMarkOffset + 4)).toEqual(
    before.data.subarray(protectedMarkOffset, protectedMarkOffset + 4),
  )
  expect(await countBrightNeutralBoundaryPixels(output)).toBe(0)
})

test('vacía huecos blancos encerrados y preserva una marca blanca protegida', async () => {
  const fixture = await sharp({
    create: { width: 40, height: 24, channels: 3, background: '#ffffff' },
  })
    .composite([
      {
        input: await sharp({
          create: { width: 36, height: 18, channels: 3, background: '#202020' },
        })
          .composite([
            {
              input: await sharp({
                create: { width: 8, height: 8, channels: 3, background: '#ffffff' },
              })
                .png()
                .toBuffer(),
              left: 5,
              top: 5,
            },
            {
              input: await sharp({
                create: { width: 6, height: 4, channels: 3, background: '#ffffff' },
              })
                .png()
                .toBuffer(),
              left: 27,
              top: 7,
            },
          ])
          .png()
          .toBuffer(),
        left: 2,
        top: 3,
      },
    ])
    .png()
    .toBuffer()

  const result = await removeWhiteBackground(fixture, {
    luma: 248,
    chroma: 18,
    featherPixels: 3,
    despill: true,
    enclosedWhiteMinArea: 16,
    preserveWhiteRegions: [{ left: 27, top: 8, width: 10, height: 8 }],
  })
  const { data, info } = await sharp(result).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixel = (x: number, y: number) => {
    const offset = (y * info.width + x) * info.channels
    return [...data.subarray(offset, offset + info.channels)]
  }

  expect(pixel(11, 12)[3]).toBe(0)
  expect(pixel(31, 12)).toEqual([255, 255, 255, 255])
})

test('la elevación tonal modifica solo RGB dentro del alfa existente', async () => {
  const input = await sharp({
    create: { width: 2, height: 1, channels: 4, background: '#00000000' },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 1,
            height: 1,
            channels: 4,
            background: { r: 24, g: 32, b: 40, alpha: 0.5 },
          },
        })
          .png()
          .toBuffer(),
        left: 1,
        top: 0,
      },
    ])
    .png()
    .toBuffer()

  const output = await liftDarkProductRgb(input, { gamma: 1.5 })
  const { data } = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  expect([...data.subarray(0, 4)]).toEqual([0, 0, 0, 0])
  expect(data[4]).toBeGreaterThan(24)
  expect(data[5]).toBeGreaterThan(32)
  expect(data[6]).toBeGreaterThan(40)
  expect(data[7]).toBe(128)
})

test('la receta sanea RGB oculto bajo alfa cero después de normalizar', async () => {
  const fixture = await sharp({
    create: { width: 40, height: 40, channels: 3, background: '#ffffff' },
  })
    .composite([
      {
        input: await sharp({
          create: { width: 20, height: 20, channels: 3, background: '#202020' },
        })
          .png()
          .toBuffer(),
        left: 10,
        top: 10,
      },
    ])
    .png()
    .toBuffer()
  const output = await rebuildProductCutout(fixture, {
    operation: 'white-flood-matte',
    matte: { luma: 248, chroma: 18, featherPixels: 3, despill: true },
    policy: { canvas: 160, occupancy: 0.8, allowEnlargement: true, maxEnlargementRatio: 8 },
    webpExactTransparentRgb: true,
  })
  const { data, info } = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let hiddenRgbPixels = 0
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (
      data[offset + 3] === 0 &&
      (data[offset] !== 0 || data[offset + 1] !== 0 || data[offset + 2] !== 0)
    ) {
      hiddenRgbPixels += 1
    }
  }
  expect(hiddenRgbPixels).toBe(0)
})

test('los primarios Task 7 no conservan RGB oculto bajo alfa cero', async () => {
  for (const slug of TASK_7_PRODUCT_SLUGS) {
    const primary = await readFile(join(process.cwd(), 'public', 'products', slug, 'primary.webp'))
    const { data, info } = await sharp(primary)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    let hiddenRgbPixels = 0
    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (
        data[offset + 3] === 0 &&
        (data[offset] !== 0 || data[offset + 1] !== 0 || data[offset + 2] !== 0)
      ) {
        hiddenRgbPixels += 1
      }
    }
    expect(hiddenRgbPixels, slug).toBe(0)
  }
})

test('los recortes negros extraídos de matte blanco no conservan contornos neutrales brillantes', async () => {
  const expectedAlphaHashes = {
    'thermalright-peerless-assassin-120-se':
      'F094D0ADDD2B4C8EC1AE207CE9C32B70E04E9C751A707032674DE7EE69054A62',
    'arctic-liquid-freezer-iii-360':
      '50F9FDC08043970629CC3C4E3FAC5279ACA83911981FE242A1DF9853459465DD',
    'arctic-p12-pwm-pst-5-pack':
      '202154BA300830C016CC6C3C3C027ADF86CF92666A1FC4CAA1D06C22B97F1F92',
  }
  for (const [slug, expectedAlphaHash] of Object.entries(expectedAlphaHashes)) {
    const primary = await readFile(join(process.cwd(), 'public', 'products', slug, 'primary.webp'))
    expect(await countBrightNeutralBoundaryPixels(primary), slug).toBe(0)
    const { data, info } = await sharp(primary)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const alpha = Buffer.alloc(info.width * info.height)
    for (let index = 0; index < alpha.length; index += 1) {
      alpha[index] = data[index * info.channels + 3]!
    }
    expect(sha256(alpha), `${slug} conserva exactamente su máscara alfa aprobada`).toBe(
      expectedAlphaHash,
    )
  }
})

test('la receta es determinista y sus primarios aprobados coinciden con el hash versionado', async () => {
  const fixture = await sharp({
    create: { width: 80, height: 60, channels: 3, background: '#ffffff' },
  })
    .composite([
      {
        input: await sharp({
          create: { width: 50, height: 24, channels: 3, background: '#202020' },
        })
          .png()
          .toBuffer(),
        left: 15,
        top: 18,
      },
    ])
    .png()
    .toBuffer()
  const recipe = {
    operation: 'white-flood-matte' as const,
    matte: { luma: 248, chroma: 18, featherPixels: 3, despill: true },
    policy: { canvas: 160, occupancy: 0.8, allowEnlargement: true, maxEnlargementRatio: 3 },
  }

  const first = await rebuildProductCutout(fixture, recipe)
  const second = await rebuildProductCutout(fixture, recipe)
  expect(second).toEqual(first)

  for (const slug of [...TASK_6_PRODUCT_SLUGS, ...TASK_7_PRODUCT_SLUGS]) {
    const primary = await readFile(join(process.cwd(), 'public', 'products', slug, 'primary.webp'))
    const recipe = PRODUCT_CUTOUT_RECIPES[slug]
    expect(recipe, slug).toBeDefined()
    if (!recipe) throw new Error(`Falta receta para ${slug}.`)
    expect(sha256(primary), slug).toBe(recipe.expectedOutputSha256)
  }
})
