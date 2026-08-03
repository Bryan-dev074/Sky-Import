import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import {
  PRODUCT_CUTOUT_RECIPES,
  TASK_6_PRODUCT_SLUGS,
  rebuildProductCutout,
  removeWhiteBackground,
} from '../../scripts/lib/product-cutout-recipes.mjs'

function sha256(bytes: Buffer) {
  return createHash('sha256').update(bytes).digest('hex').toUpperCase()
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

  for (const slug of TASK_6_PRODUCT_SLUGS) {
    const primary = await readFile(join(process.cwd(), 'public', 'products', slug, 'primary.webp'))
    const recipe = PRODUCT_CUTOUT_RECIPES[slug]
    expect(recipe, slug).toBeDefined()
    if (!recipe) throw new Error(`Falta receta para ${slug}.`)
    expect(sha256(primary), slug).toBe(recipe.expectedOutputSha256)
  }
})
