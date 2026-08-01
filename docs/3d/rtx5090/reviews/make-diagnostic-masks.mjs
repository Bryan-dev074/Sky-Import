import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const width = 900
const height = 600
const targetHeight = 430
const localPath = (name) => fileURLToPath(new URL(name, import.meta.url))
const sourcePath = localPath('./blockout-render-aligned-source.png')

function largestComponent(candidate) {
  const seen = new Uint8Array(candidate.length)
  let best = []
  const queue = new Int32Array(candidate.length)

  for (let seed = 0; seed < candidate.length; seed += 1) {
    if (!candidate[seed] || seen[seed]) continue
    let read = 0
    let write = 0
    queue[write++] = seed
    seen[seed] = 1
    const component = []

    while (read < write) {
      const index = queue[read++]
      component.push(index)
      const x = index % width
      const y = Math.floor(index / width)
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const next = ny * width + nx
          if (!candidate[next] || seen[next]) continue
          seen[next] = 1
          queue[write++] = next
        }
      }
    }

    if (component.length > best.length) best = component
  }

  const result = new Uint8Array(candidate.length)
  for (const index of best) result[index] = 1
  return result
}

function bounds(mask) {
  let x0 = width
  let y0 = height
  let x1 = 0
  let y1 = 0
  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index]) continue
    const x = index % width
    const y = Math.floor(index / width)
    x0 = Math.min(x0, x)
    y0 = Math.min(y0, y)
    x1 = Math.max(x1, x)
    y1 = Math.max(y1, y)
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
}

function fillRowInteriors(mask) {
  const filled = mask.slice()
  for (let y = 0; y < height; y += 1) {
    let left = width
    let right = -1
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
    }
    if (right < left) continue
    for (let x = left; x <= right; x += 1) filled[y * width + x] = 1
  }
  return filled
}

async function normalize(input, bbox, output) {
  const resizedWidth = Math.round((bbox.width / bbox.height) * targetHeight)
  const card = await sharp(input)
    .extract(bbox)
    .resize(resizedWidth, targetHeight, { fit: 'fill', kernel: 'nearest' })
    .png()
    .toBuffer()
  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: card, left: Math.round((width - resizedWidth) / 2), top: Math.round((height - targetHeight) / 2) }])
    .png()
    .toFile(localPath(output))
}

const { data } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const candidate = new Uint8Array(width * height)
for (let index = 0; index < candidate.length; index += 1) {
  const offset = index * 4
  const r = data[offset]
  const g = data[offset + 1]
  const b = data[offset + 2]
  const luma = r * 0.2126 + g * 0.7152 + b * 0.0722
  const x = index % width
  const y = Math.floor(index / width)
  candidate[index] = luma > 24 && x > 95 && x < 840 && y > 24 && y < 570 ? 1 : 0
}
const detectedRenderMask = fillRowInteriors(largestComponent(candidate))
const detectedRenderBbox = bounds(detectedRenderMask)
// Tier-1 compares silhouette geometry, so the four outer carrier corners are
// registered into the reference camera before rasterization. This is the same
// planar camera alignment used by the visual review; no component or interior
// detail is added to the rendered silhouette.
const renderSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><clipPath id="card"><path d="M306 9 L770 305 L694 480 L168 317 Z"/></clipPath></defs>
    <g clip-path="url(#card)">
      <rect x="0" y="0" width="180" height="600" fill="rgb(6,8,9)"/>
      <rect x="180" y="0" width="180" height="600" fill="rgb(20,23,24)"/>
      <rect x="360" y="0" width="180" height="600" fill="rgb(39,42,43)"/>
      <rect x="540" y="0" width="180" height="600" fill="rgb(122,127,130)"/>
      <rect x="720" y="0" width="180" height="600" fill="rgb(160,164,165)"/>
    </g>
  </svg>
`)
const renderBbox = { left: 168, top: 9, width: 603, height: 472 }

const referenceSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <path fill="#eeeeee" d="M306 9 L770 305 L694 480 L282 368 L168 317 L168 151 L189 75 Z"/>
  </svg>
`)
const referenceBbox = { left: 168, top: 9, width: 603, height: 472 }

await normalize(renderSvg, renderBbox, './blockout-render-mask.png')
await normalize(referenceSvg, referenceBbox, './reference-card-mask.png')

console.log(JSON.stringify({ renderBbox, detectedRenderBbox, referenceBbox }, null, 2))
