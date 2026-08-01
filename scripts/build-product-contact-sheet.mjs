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
const cellWidth = 360
const cellHeight = 250
const rows = Math.ceil(manifest.length / columns)

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

const composites = []
for (const [index, entry] of manifest.entries()) {
  const thumb = await sharp(join(ROOT, 'public', 'products', entry.slug, 'primary.webp'))
    .resize({ width: 318, height: 176, fit: 'contain', background: { r: 11, g: 17, b: 22, alpha: 1 } })
    .toBuffer()
  const label = await sharp(
    Buffer.from(`
      <svg width="318" height="42" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="17" fill="#f1f5f7" font-family="Arial, sans-serif" font-size="13" font-weight="700">
          ${String(index + 1).padStart(2, '0')} · ${escapeXml(entry.slug)}
        </text>
        <text x="0" y="36" fill="#55c8f5" font-family="Arial, sans-serif" font-size="11">
          ${escapeXml(entry.credit)}
        </text>
      </svg>`),
  ).png().toBuffer()
  const left = (index % columns) * cellWidth + 21
  const top = Math.floor(index / columns) * cellHeight + 16
  composites.push({ input: thumb, left, top })
  composites.push({ input: label, left, top: top + 188 })
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
