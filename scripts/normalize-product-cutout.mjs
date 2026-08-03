import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { inspectProductCutout, normalizeProductCutout } from './lib/product-cutout.mjs'
import { getProductCutoutPolicy } from './product-cutout-policy.mjs'

function readArguments(args) {
  const values = {}
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]
    const value = args[index + 1]
    if (!['--input', '--slug', '--output'].includes(flag) || !value || values[flag]) {
      throw new Error('Uso: node scripts/normalize-product-cutout.mjs --input <archivo> --slug <slug> --output <archivo>')
    }
    values[flag] = value
  }

  if (Object.keys(values).length !== 3 || args.length !== 6) {
    throw new Error('Uso: node scripts/normalize-product-cutout.mjs --input <archivo> --slug <slug> --output <archivo>')
  }

  return { input: resolve(values['--input']), slug: values['--slug'], output: resolve(values['--output']) }
}

async function validateNormalizedCutout(output, policy) {
  const { metadata, cornerAlpha, bounds } = await inspectProductCutout(await readFile(output))
  if (metadata.format !== 'webp' || metadata.hasAlpha !== true) {
    throw new Error('El resultado debe ser un WebP con canal alfa.')
  }
  if (metadata.width !== policy.canvas || metadata.height !== policy.canvas) {
    throw new Error(`El resultado debe medir ${policy.canvas}×${policy.canvas}.`)
  }
  if (!bounds || bounds.safeMarginRatio < 0.06) {
    throw new Error('El resultado no conserva el margen transparente seguro.')
  }
  if (!cornerAlpha.every((alpha) => alpha === 0)) {
    throw new Error('El resultado debe conservar las cuatro esquinas totalmente transparentes.')
  }
}

async function main() {
  const { input, slug, output } = readArguments(process.argv.slice(2))
  const policy = getProductCutoutPolicy(slug)
  if (!policy) throw new Error(`No existe una política de recorte para ${slug}.`)

  await mkdir(dirname(output), { recursive: true })
  const temporaryOutput = `${output}.tmp-${process.pid}-${randomUUID()}`
  try {
    const normalized = await normalizeProductCutout(input, policy)
    await writeFile(temporaryOutput, normalized)
    await validateNormalizedCutout(temporaryOutput, policy)
    await rename(temporaryOutput, output)
  } finally {
    await rm(temporaryOutput, { force: true })
  }

  console.log(`Normalizado ${slug}: ${output}`)
}

await main()
