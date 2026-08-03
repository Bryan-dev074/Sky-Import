import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { validateProductMedia } from '../../scripts/lib/product-media-validation.mjs'

let fixtureRoot: string

beforeEach(async () => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'sky-import-media-validation-'))
})

afterEach(async () => {
  await rm(fixtureRoot, { recursive: true, force: true })
})

test('rechaza un crédito vacío con un diagnóstico por slug', async () => {
  await expect(
    validateProductMedia(fixtureRoot, [
      {
        slug: 'sin-credito',
        imageUrl: 'https://example.com/image.webp',
        sourcePage: 'https://example.com/product',
        credit: '   ',
      },
    ]),
  ).rejects.toThrow('[sin-credito] crédito faltante o vacío.')
})

test('identifica por slug cuando falta primary.webp', async () => {
  await expect(
    validateProductMedia(fixtureRoot, [
      {
        slug: 'sin-imagen',
        imageUrl: 'https://example.com/image.webp',
        sourcePage: 'https://example.com/product',
        credit: 'Example manufacturer',
      },
    ]),
  ).rejects.toThrow('[sin-imagen] falta primary.webp.')
})

test('identifica por slug cuando primary.webp no es una imagen legible', async () => {
  const output = join(fixtureRoot, 'public', 'products', 'imagen-corrupta', 'primary.webp')
  await mkdir(join(fixtureRoot, 'public', 'products', 'imagen-corrupta'), { recursive: true })
  await writeFile(output, 'esto no es una imagen WebP')

  await expect(
    validateProductMedia(fixtureRoot, [
      {
        slug: 'imagen-corrupta',
        imageUrl: 'https://example.com/image.webp',
        sourcePage: 'https://example.com/product',
        credit: 'Example manufacturer',
      },
    ]),
  ).rejects.toThrow('[imagen-corrupta] primary.webp no se puede leer como imagen:')
})

test('libera cada archivo corrupto al terminar el diagnóstico', async () => {
  for (let index = 0; index < 40; index += 1) {
    const slug = `imagen-corrupta-${index}`
    const directory = join(fixtureRoot, 'public', 'products', slug)
    const output = join(directory, 'primary.webp')
    await mkdir(directory, { recursive: true })
    await writeFile(output, 'esto no es una imagen WebP')

    await expect(
      validateProductMedia(fixtureRoot, [
        {
          slug,
          imageUrl: 'https://example.com/image.webp',
          sourcePage: 'https://example.com/product',
          credit: 'Example manufacturer',
        },
      ]),
    ).rejects.toThrow(`[${slug}] primary.webp no se puede leer como imagen:`)
    await expect(rm(output)).resolves.toBeUndefined()
  }
})
