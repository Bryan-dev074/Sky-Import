/**
 * Capturas de verificación.
 *
 * Recorre las rutas principales en los cinco tamaños del brief y guarda las
 * imágenes fuera del repositorio. Además informa de cualquier error de consola
 * y de cualquier desbordamiento horizontal, que es el defecto móvil más común y
 * el más fácil de no ver leyendo código.
 *
 *   node scripts/shots.mjs <carpetaDeSalida> [baseUrl]
 */

import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const outDir = resolve(process.argv[2] ?? './.shots')
const base = process.argv[3] ?? 'http://127.0.0.1:3100'

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1366x768', width: 1366, height: 768, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
]

const ROUTES = [
  ['home', '/es'],
  ['catalogo', '/es/catalogo'],
  ['producto', '/es/producto/geforce-rtx-5080-16gb'],
  ['armar', '/es/armar'],
  ['carrito', '/es/carrito'],
  ['checkout', '/es/checkout'],
  ['guias', '/es/guias'],
  ['guia', '/es/guias/el-zocalo-decide'],
  ['home-pt', '/pt'],
]

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const problems = []

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    hasTouch: viewport.mobile,
    isMobile: viewport.mobile,
    locale: 'es-PY',
  })

  for (const [name, path] of ROUTES) {
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))

    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
    // La intro dura como mucho 1,75 s.
    await page.waitForTimeout(2200)

    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth
      const scrollWidth = document.documentElement.scrollWidth
      return { docWidth, scrollWidth, overflow: scrollWidth - docWidth }
    })

    if (overflow.overflow > 1) {
      problems.push(`SCROLL-X ${viewport.name} ${path}: +${overflow.overflow}px`)
    }
    for (const error of consoleErrors) {
      problems.push(`CONSOLA ${viewport.name} ${path}: ${error}`)
    }

    await page.screenshot({
      path: resolve(outDir, `${name}--${viewport.name}.png`),
      fullPage: false,
    })
    await page.close()
  }

  await context.close()
}

await browser.close()

if (problems.length === 0) {
  console.log('· Sin desbordamiento horizontal ni errores de consola en ninguna combinación.')
} else {
  console.log(`· ${problems.length} problema(s):`)
  for (const problem of problems) console.log(`  - ${problem}`)
}
console.log(`· Capturas en ${outDir}`)
