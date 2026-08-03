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

const execFileAsync = promisify(execFile)

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
