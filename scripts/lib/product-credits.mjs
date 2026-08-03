import { writeFile } from 'node:fs/promises'

export const PRODUCT_MEDIA_WORKFLOW =
  'Flujo seguro y repetible: (1) `npm run media:sync` descarga únicamente el material bruto a `artifacts/product-sources/<slug>/source.<ext>`; (2) se edita o extrae un recorte transparente en `artifacts/product-cutouts/<slug>.png`; (3) se normaliza explícitamente con `npm run media:normalize -- --input artifacts/product-cutouts/<slug>.png --slug <slug> --output public/products/<slug>/primary.webp`; (4) `npm run media:validate` revisa los assets curados; y (5) `npm run media:sheet` crea una hoja de contacto con fondos oscuro y claro para revisar el matte. `media:sync` no sobrescribe `primary.webp`; ejecute `npm run media:sync -- --write-credits` solo para regenerar este listado.'

export function renderProductCredits(manifest) {
  return [
    '# Fuentes de imágenes de producto',
    '',
    PRODUCT_MEDIA_WORKFLOW,
    '',
    'Las páginas, créditos y archivos de origen se conservan a continuación.',
    '',
    ...manifest.map(
      (entry) =>
        `- \`${entry.slug}\` — [${entry.credit}](${entry.sourcePage}) — [archivo original](${entry.imageUrl})${entry.sourceSha256 ? ` — SHA-256: \`${entry.sourceSha256}\`` : ''}`,
    ),
    '',
  ].join('\n')
}

export async function writeProductCredits(output, manifest) {
  await writeFile(output, renderProductCredits(manifest), 'utf8')
}
