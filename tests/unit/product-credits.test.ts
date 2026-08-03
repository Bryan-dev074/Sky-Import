import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { PRODUCT_MEDIA_WORKFLOW, writeProductCredits } from '../../scripts/lib/product-credits.mjs'

test('incluye el SHA-256 de una fuente dinámica cuando el manifiesto lo declara', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sky-import-credits-'))
  const output = join(directory, 'SOURCES.md')
  const sourceSha256 = 'a'.repeat(64)

  try {
    await writeProductCredits(output, [
      {
        slug: 'producto-dinamico',
        credit: 'Fotografía del comercio',
        sourcePage: 'https://example.com/producto',
        imageUrl: 'https://example.com/imagen-dinamica',
        sourceSha256,
      },
    ])

    await expect(readFile(output, 'utf8')).resolves.toContain(`SHA-256: \`${sourceSha256}\``)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('la regeneración de créditos conserva el flujo y todas las entradas del manifiesto', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sky-import-credits-'))
  const output = join(directory, 'SOURCES.md')
  const manifest = JSON.parse(
    await readFile(join(process.cwd(), 'public', 'products', 'manifest.json'), 'utf8'),
  )

  try {
    await writeProductCredits(output, manifest)
    const generated = await readFile(output, 'utf8')

    expect(generated).toContain(PRODUCT_MEDIA_WORKFLOW)
    expect(generated).toContain('artifacts/product-sources/<slug>/source.<ext>')
    expect(generated).toContain('artifacts/product-cutouts/<slug>.png')
    expect(generated.match(/^- `[^`]+` — /gm)).toHaveLength(manifest.length)
    for (const entry of manifest) {
      expect(generated).toContain(`- \`${entry.slug}\` — [${entry.credit}](${entry.sourcePage})`)
      expect(generated).toContain(`[archivo original](${entry.imageUrl})`)
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
