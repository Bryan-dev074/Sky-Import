/**
 * Generación de material gráfico estático.
 *
 * Produce `public/og.png` (1200 × 630) a partir de un SVG compuesto acá mismo,
 * con la tipografía dibujada como trazos para no depender de que el motor de
 * rasterizado tenga la fuente instalada. Es reproducible: `npm run assets`.
 *
 * No hay ninguna descarga: todo el material del proyecto es local.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '..', 'public')

const CARBON = '#0B0E12'
const SKY = '#55C8F5'
const STEEL = '#6E7A85'
const PAPER = '#F2F0EC'

/** Trazado de pistas determinista, el motivo de la casa. */
function traces(width, height, lines, seed) {
  let state = (seed * 1103515245 + 12345) & 0x7fffffff
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
  const lane = height / (lines + 1)
  const out = []
  for (let i = 0; i < lines; i += 1) {
    let x = 0
    let y = +(lane * (i + 1)).toFixed(2)
    let d = `M0 ${y}`
    let guard = 0
    while (x < width && guard < 20) {
      guard += 1
      const nx = +Math.min(width, x + width * (0.08 + next() * 0.2)).toFixed(2)
      d += ` H${nx}`
      x = nx
      if (x >= width) break
      const up = next() > 0.5
      const step = +(lane * (0.35 + next() * 0.5)).toFixed(2)
      const ny = +Math.max(4, Math.min(height - 4, y + (up ? -step : step))).toFixed(2)
      const dx = +Math.abs(ny - y).toFixed(2)
      const ex = +Math.min(width, x + dx).toFixed(2)
      d += ` L${ex} ${ny}`
      x = ex
      y = ny
    }
    if (x < width) d += ` H${width}`
    out.push(d)
  }
  return out
}

/** Letras del sello dibujadas como rectángulos: cero dependencia tipográfica. */
function glyph(letter, x, y, unit) {
  const s = (...segments) =>
    segments
      .map(([gx, gy, gw, gh]) =>
        `<rect x="${(x + gx * unit).toFixed(2)}" y="${(y + gy * unit).toFixed(2)}" width="${(gw * unit).toFixed(2)}" height="${(gh * unit).toFixed(2)}" fill="${PAPER}"/>`,
      )
      .join('')

  switch (letter) {
    case 'S':
      return s([0, 0, 5, 1], [0, 0, 1, 3], [0, 2.6, 5, 1], [4, 2.6, 1, 3], [0, 5.2, 5, 1])
    case 'K':
      return s([0, 0, 1, 6.2], [1.6, 2.6, 1.6, 1], [3.2, 0, 1.2, 2.6], [3.2, 3.6, 1.2, 2.6])
    case 'Y':
      return s([0, 0, 1, 2.6], [4, 0, 1, 2.6], [1, 2.6, 3, 1], [2, 3.6, 1, 2.6])
    case 'I':
      return s([0, 0, 1, 6.2])
    case 'M':
      return s([0, 0, 1, 6.2], [1.3, 1, 1, 2], [2.3, 2, 1, 2], [3.3, 1, 1, 2], [4.6, 0, 1, 6.2])
    case 'P':
      return s([0, 0, 1, 6.2], [0, 0, 4.4, 1], [3.4, 0, 1, 3.2], [0, 2.2, 4.4, 1])
    case 'O':
      return s([0, 0, 5, 1], [0, 0, 1, 6.2], [4, 0, 1, 6.2], [0, 5.2, 5, 1])
    case 'R':
      return s([0, 0, 1, 6.2], [0, 0, 4.4, 1], [3.4, 0, 1, 3.2], [0, 2.2, 4.4, 1], [3.4, 3.2, 1, 3])
    case 'T':
      return s([0, 0, 5, 1], [2, 0, 1, 6.2])
    default:
      return ''
  }
}

function word(text, x, y, unit, gap) {
  let cursor = x
  let out = ''
  for (const letter of text) {
    if (letter === ' ') {
      cursor += unit * 4
      continue
    }
    out += glyph(letter, cursor, y, unit)
    cursor += unit * 5 + gap
  }
  return out
}

async function buildOg() {
  const W = 1200
  const H = 630
  const unit = 15
  const gap = 13

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CARBON}"/>
  <g stroke="${STEEL}" stroke-opacity="0.14" stroke-width="1">
    ${Array.from({ length: Math.ceil(W / 32) }, (_, i) => `<line x1="${i * 32}" y1="0" x2="${i * 32}" y2="${H}"/>`).join('')}
    ${Array.from({ length: Math.ceil(H / 32) }, (_, i) => `<line x1="0" y1="${i * 32}" x2="${W}" y2="${i * 32}"/>`).join('')}
  </g>
  <g stroke="${SKY}" stroke-opacity="0.4" stroke-width="1.5" fill="none">
    ${traces(W, 240, 5, 19)
      .map((d) => `<path d="${d}" transform="translate(0 ${H - 250})"/>`)
      .join('')}
  </g>
  <g>
    ${word('SKY IMPORT', 96, 236, unit, gap)}
  </g>
  <rect x="96" y="196" width="220" height="2" fill="${SKY}"/>
  <text x="96" y="176" fill="${STEEL}" font-family="monospace" font-size="20" letter-spacing="6">CIUDAD DEL ESTE · PARAGUAY</text>
  <text x="96" y="382" fill="${PAPER}" font-family="sans-serif" font-size="30" opacity="0.86">Componentes para PC · Ficha tecnica delante del precio</text>
  <text x="96" y="424" fill="${STEEL}" font-family="monospace" font-size="20" letter-spacing="4">USD · PYG · BRL</text>
</svg>`

  await mkdir(publicDir, { recursive: true })
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(resolve(publicDir, 'og.png'))
  await writeFile(resolve(publicDir, 'og.svg'), svg, 'utf8')
  console.log('· public/og.png y public/og.svg generados')
}

await buildOg()
