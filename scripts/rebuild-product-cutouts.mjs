import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  PRODUCT_CUTOUT_RECIPES,
  rebuildProductCutout,
  sha256,
} from './lib/product-cutout-recipes.mjs'
import { inspectProductCutout } from './lib/product-cutout.mjs'
import { getProductCutoutPolicy } from './product-cutout-policy.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function readArguments(args) {
  const slugs = []
  let sourceRoot = join(ROOT, 'artifacts', 'product-sources')
  let outputRoot = join(ROOT, 'public', 'products')
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]
    const value = args[index + 1]
    if (flag === '--slug' && value && !value.startsWith('--')) {
      slugs.push(value)
      index += 1
      continue
    }
    if (flag === '--source-root' && value && !value.startsWith('--')) {
      sourceRoot = resolve(value)
      index += 1
      continue
    }
    if (flag === '--output-root' && value && !value.startsWith('--')) {
      outputRoot = resolve(value)
      index += 1
      continue
    }
    throw new Error(
      'Uso: node scripts/rebuild-product-cutouts.mjs --slug <slug> [--source-root <dir>] [--output-root <dir>]',
    )
  }
  if (slugs.length === 0) throw new Error('Declare al menos un --slug para reconstruir.')
  return { slugs, sourceRoot, outputRoot }
}

async function rebuild(slug, roots) {
  const recipe = PRODUCT_CUTOUT_RECIPES[slug]
  const policy = getProductCutoutPolicy(slug)
  if (!recipe || !policy) throw new Error(`No existe receta/política para ${slug}.`)
  const input = join(roots.sourceRoot, slug, `source.${recipe.sourceExtension}`)
  const source = await readFile(input)
  const sourceHash = sha256(source)
  if (sourceHash !== recipe.sourceSha256) {
    throw new Error(
      `[${slug}] fuente local ${sourceHash}; se esperaba ${recipe.sourceSha256}. No se escribió el primario.`,
    )
  }

  const output = await rebuildProductCutout(source, { ...recipe, policy })
  const outputHash = sha256(output)
  if (outputHash !== recipe.expectedOutputSha256) {
    throw new Error(
      `[${slug}] salida ${outputHash}; se esperaba ${recipe.expectedOutputSha256}. Revise el matte antes de aprobar nuevos bytes.`,
    )
  }
  const metadata = await sharp(output).metadata()
  const inspection = await inspectProductCutout(output)
  if (
    metadata.format !== 'webp' ||
    metadata.hasAlpha !== true ||
    !inspection.bounds ||
    inspection.bounds.safeMarginRatio < 0.06 ||
    !inspection.cornerAlpha.every((alpha) => alpha === 0)
  ) {
    throw new Error(`[${slug}] la salida reproducida no cumple el contrato de recorte.`)
  }

  const destination = join(roots.outputRoot, slug, 'primary.webp')
  await mkdir(dirname(destination), { recursive: true })
  const temporary = `${destination}.tmp-${process.pid}-${randomUUID()}`
  try {
    await writeFile(temporary, output, { flag: 'wx' })
    await rename(temporary, destination)
  } finally {
    await rm(temporary, { force: true })
  }
  return { slug, destination, sourceHash, outputHash }
}

const { slugs, sourceRoot, outputRoot } = readArguments(process.argv.slice(2))
for (const slug of slugs) {
  const result = await rebuild(slug, { sourceRoot, outputRoot })
  console.log(`${result.slug}: ${result.outputHash} <- ${result.sourceHash}`)
}
