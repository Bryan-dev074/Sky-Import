import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { expect, test } from 'vitest'
import {
  measureOpaqueBounds,
  normalizeProductCutout,
  readCornerAlpha,
} from '../../scripts/lib/product-cutout.mjs'
import { getProductCutoutPolicy } from '../../scripts/product-cutout-policy.mjs'

const execFileAsync = promisify(execFile)

async function createOpaqueSquareFixture(size = 50) {
  return sharp({
    create: { width: size, height: size, channels: 4, background: '#2f86ff' },
  })
    .png()
    .toBuffer()
}

test('normaliza un recorte sin perder alfa ni margen seguro', async () => {
  const opaqueFixture = await sharp({
    create: { width: 640, height: 320, channels: 4, background: '#2f86ff' },
  })
    .png()
    .toBuffer()
  const input = await sharp({
    create: { width: 800, height: 400, channels: 4, background: '#00000000' },
  })
    .composite([{ input: opaqueFixture, left: 80, top: 40 }])
    .png()
    .toBuffer()

  const output = await normalizeProductCutout(input, { canvas: 1600, occupancy: 0.86 })
  const metadata = await sharp(output).metadata()

  expect(metadata).toMatchObject({ width: 1600, height: 1600, format: 'webp', hasAlpha: true })
  await expect(readCornerAlpha(output)).resolves.toEqual([0, 0, 0, 0])
  await expect(measureOpaqueBounds(output)).resolves.toMatchObject({
    safeMarginRatio: expect.any(Number),
  })
  const bounds = await measureOpaqueBounds(output)
  expect(bounds.safeMarginRatio).toBeGreaterThanOrEqual(0.06)
})

test('rechaza una ampliación que supera el límite medido con un error accionable', async () => {
  const input = await createOpaqueSquareFixture()

  await expect(
    normalizeProductCutout(input, {
      canvas: 100,
      occupancy: 0.8,
      allowEnlargement: true,
      maxEnlargementRatio: 1.5,
    }),
  ).rejects.toThrow(
    'La ampliación solicitada (1.600×) supera el máximo permitido (1.500×); fuente opaca 50×50 px, objetivo 80 px.',
  )
})

test('exige un límite explícito cuando se habilita la ampliación', async () => {
  const input = await createOpaqueSquareFixture()

  await expect(
    normalizeProductCutout(input, {
      canvas: 100,
      occupancy: 0.8,
      allowEnlargement: true,
    }),
  ).rejects.toThrow(
    'allowEnlargement requiere un maxEnlargementRatio finito mayor o igual a 1.',
  )
})

test('acepta exactamente el límite de ampliación medido', async () => {
  const input = await createOpaqueSquareFixture()
  const output = await normalizeProductCutout(input, {
    canvas: 100,
    occupancy: 0.8,
    allowEnlargement: true,
    maxEnlargementRatio: 1.6,
  })

  await expect(measureOpaqueBounds(output)).resolves.toMatchObject({
    opaqueWidth: 80,
    opaqueHeight: 80,
  })
})

test('el CLI normaliza solo en la ruta de salida explícita', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sky-import-cutout-'))
  const input = join(directory, 'raw.png')
  const output = join(directory, 'curated', 'primary.webp')

  try {
    const raw = await sharp({
      create: { width: 400, height: 240, channels: 4, background: '#00000000' },
    })
      .composite([
        {
          input: await sharp({
            create: { width: 240, height: 120, channels: 4, background: '#2f86ff' },
          })
            .png()
            .toBuffer(),
          left: 80,
          top: 60,
        },
      ])
      .png()
      .toBuffer()
    await writeFile(input, raw)

    await execFileAsync(process.execPath, [
      'scripts/normalize-product-cutout.mjs',
      '--input',
      input,
      '--slug',
      'geforce-rtx-5070-12gb',
      '--output',
      output,
    ])

    const normalized = await readFile(output)
    expect((await stat(output)).isFile()).toBe(true)
    const metadata = await sharp(normalized).metadata()
    expect(metadata).toMatchObject({ width: 1600, height: 1600, format: 'webp', hasAlpha: true })
    await expect(readCornerAlpha(normalized)).resolves.toEqual([0, 0, 0, 0])
    await expect(measureOpaqueBounds(normalized)).resolves.toMatchObject({
      safeMarginRatio: expect.any(Number),
    })
    expect(await readdir(directory)).toEqual(['curated', 'raw.png'])
    expect(await readdir(dirname(output))).toEqual(['primary.webp'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('el CLI rechaza un slug desconocido antes de crear salida o temporal', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sky-import-cutout-'))
  const output = join(directory, 'curated', 'primary.webp')

  try {
    await expect(
      execFileAsync(process.execPath, [
        'scripts/normalize-product-cutout.mjs',
        '--input',
        join(directory, 'missing.png'),
        '--slug',
        'slug-desconocido',
        '--output',
        output,
      ]),
    ).rejects.toThrow('No existe una política de recorte para slug-desconocido.')

    expect(await readdir(directory)).toEqual([])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('el CLI deja intacto un sentinela junto a la salida solicitada', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sky-import-cutout-'))
  const input = join(directory, 'raw.png')
  const curated = join(directory, 'curated')
  const output = join(curated, 'primary.webp')
  const sentinel = join(curated, 'keep.txt')
  const sentinelBytes = Buffer.from('no modificar este archivo')

  try {
    const raw = await sharp({
      create: { width: 400, height: 240, channels: 4, background: '#00000000' },
    })
      .composite([
        {
          input: await sharp({
            create: { width: 240, height: 120, channels: 4, background: '#2f86ff' },
          })
            .png()
            .toBuffer(),
          left: 80,
          top: 60,
        },
      ])
      .png()
      .toBuffer()
    await writeFile(input, raw)
    await mkdir(curated, { recursive: true })
    await writeFile(sentinel, sentinelBytes)

    await execFileAsync(process.execPath, [
      'scripts/normalize-product-cutout.mjs',
      '--input',
      input,
      '--slug',
      'geforce-rtx-5070-12gb',
      '--output',
      output,
    ])

    expect(await readFile(sentinel)).toEqual(sentinelBytes)
    expect((await stat(output)).isFile()).toBe(true)
    expect(await readdir(curated)).toEqual(['keep.txt', 'primary.webp'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('la política de G.Skill permite ampliación controlada sin cambiar los valores predeterminados', () => {
  expect(getProductCutoutPolicy('gskill-trident-z5-neo-32gb-6000')).toEqual({
    canvas: 1600,
    occupancy: 0.84,
    allowEnlargement: true,
    maxEnlargementRatio: 1.87,
  })
  expect(getProductCutoutPolicy('corsair-vengeance-ddr5-32gb-6000')).toEqual({
    canvas: 1600,
    occupancy: 0.84,
  })
})

test('los recortes GPU revisados permiten una ampliación mínima y localizada', () => {
  expect(getProductCutoutPolicy('geforce-rtx-4060-8gb')).toEqual({
    canvas: 1600,
    occupancy: 0.84,
    allowEnlargement: true,
    maxEnlargementRatio: 1.7,
  })
  expect(getProductCutoutPolicy('arc-b580-12gb')).toEqual({
    canvas: 1600,
    occupancy: 0.84,
    allowEnlargement: true,
    maxEnlargementRatio: 1.12,
  })
  expect(getProductCutoutPolicy('geforce-rtx-5070-12gb')).toEqual({
    canvas: 1600,
    occupancy: 0.84,
  })
})

test('cada fuente de plataforma ampliada tiene un límite por slug medido y tolerado', () => {
  const expectedLimits = {
    'ryzen-7-9800x3d': 1.5,
    'ryzen-7-7800x3d': 1.571,
    'core-ultra-7-265k': 1.34,
    'core-i5-14600k': 1.36,
    'msi-mag-b850-tomahawk-wifi': 1.94,
    'msi-pro-b650m-a-wifi': 1.9,
    'gigabyte-b760m-ds3h': 1.51,
  }

  for (const [slug, maxEnlargementRatio] of Object.entries(expectedLimits)) {
    expect(getProductCutoutPolicy(slug)).toEqual({
      canvas: 1600,
      occupancy: 0.84,
      allowEnlargement: true,
      maxEnlargementRatio,
    })
  }

  for (const slug of ['ryzen-5-9600x']) {
    expect(getProductCutoutPolicy(slug)).toEqual({
      canvas: 1600,
      occupancy: 0.84,
    })
  }
})

test('cada componente ampliado tiene un límite mínimo por slug y Kingston conserva el valor predeterminado', () => {
  const expectedLimits = {
    'samsung-990-pro-2tb': 1.45,
    'crucial-p3-plus-1tb': 2.29,
    'samsung-870-evo-1tb': 1.33,
    'seasonic-focus-gx-850': 1.37,
  }

  for (const [slug, maxEnlargementRatio] of Object.entries(expectedLimits)) {
    expect(getProductCutoutPolicy(slug)).toEqual({
      canvas: 1600,
      occupancy: 0.84,
      allowEnlargement: true,
      maxEnlargementRatio,
    })
  }

  expect(getProductCutoutPolicy('kingston-fury-beast-ddr5-16gb-5600')).toEqual({
    canvas: 1600,
    occupancy: 0.84,
  })
})
