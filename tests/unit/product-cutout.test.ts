import sharp from 'sharp'
import { expect, test } from 'vitest'
import {
  measureOpaqueBounds,
  normalizeProductCutout,
  readCornerAlpha,
} from '../../scripts/lib/product-cutout.mjs'

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
