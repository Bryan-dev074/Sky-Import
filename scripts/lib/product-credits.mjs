import { writeFile } from 'node:fs/promises'

export const PRODUCT_MEDIA_WORKFLOW =
  'Flujo seguro y repetible: (1) `npm run media:sync -- --slug <slug>` solicita la representación `sourceMediaType`, exige `sourceSha256` antes de escribir y publica únicamente material bruto en `artifacts/product-sources/<slug>/source.<ext>`; (2) `npm run media:rebuild -- --slug <slug>` ejecuta la receta versionada en `scripts/lib/product-cutout-recipes.mjs`, verifica el hash final y reemplaza solo `public/products/<slug>/primary.webp`; (3) `npm run media:validate` revisa los assets curados; y (4) `npm run media:sheet` crea una hoja de contacto con fondos oscuro y claro para revisar el matte. `media:sync` nunca toca `primary.webp`; ejecute `npm run media:sync -- --slug <slug> --write-credits` para regenerar este listado.'

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
        `- \`${entry.slug}\` — [${entry.credit}](${entry.sourcePage}) — [archivo original](${entry.imageUrl})${entry.sourceSha256 ? ` — SHA-256: \`${entry.sourceSha256}\`` : ''}${entry.identityEvidenceUrl ? ` — [evidencia de identidad](${entry.identityEvidenceUrl})${entry.identityEvidenceSha256 ? ` — SHA-256 evidencia: \`${entry.identityEvidenceSha256}\`` : ''}` : ''}`,
    ),
    '',
  ].join('\n')
}

export async function writeProductCredits(output, manifest) {
  await writeFile(output, renderProductCredits(manifest), 'utf8')
}
