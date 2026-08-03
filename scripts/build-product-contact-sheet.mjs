import { mkdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  await readFile(join(ROOT, 'public', 'products', 'manifest.json'), 'utf8'),
)
const output = resolve(process.argv[2] ?? join(ROOT, 'artifacts', 'product-contact-sheet.webp'))
const columns = 4
const cellWidth = 400
const cellHeight = 248
const previewWidth = 172
const previewHeight = 160
const previewGap = 12
const darkMatte = { r: 18, g: 25, b: 32, alpha: 1 }
const lightMatte = { r: 234, g: 238, b: 241, alpha: 1 }
const rows = Math.ceil(manifest.length / columns)

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

const composites = []
for (const [index, entry] of manifest.entries()) {
  const product = join(ROOT, 'public', 'products', entry.slug, 'primary.webp')
  const previews = await Promise.all(
    [darkMatte, lightMatte].map((matte) =>
      sharp(product)
        .resize({ width: previewWidth, height: previewHeight, fit: 'contain', background: matte })
        .flatten({ background: matte })
        .png()
        .toBuffer(),
    ),
  )
  const label = await sharp(
    Buffer.from(`
      <svg width="356" height="46" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="17" fill="#f1f5f7" font-family="Arial, sans-serif" font-size="13" font-weight="700">
          ${String(index + 1).padStart(2, '0')} · ${escapeXml(entry.slug)}
        </text>
        <text x="0" y="37" fill="#55c8f5" font-family="Arial, sans-serif" font-size="11">
          ${escapeXml(entry.credit)}
        </text>
      </svg>`),
  ).png().toBuffer()
  const left = (index % columns) * cellWidth + 22
  const top = Math.floor(index / columns) * cellHeight + 14
  composites.push({ input: previews[0], left, top })
  composites.push({ input: previews[1], left: left + previewWidth + previewGap, top })
  composites.push({ input: label, left, top: top + previewHeight + 12 })
}

await mkdir(dirname(output), { recursive: true })
await sharp({
  create: {
    width: columns * cellWidth,
    height: rows * cellHeight,
    channels: 4,
    background: { r: 7, g: 12, b: 16, alpha: 1 },
  },
})
  .composite(composites)
  .webp({ quality: 88 })
  .toFile(output)

console.log(output)
