import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const output = resolve(process.argv[2] ?? 'artifacts/intro')
const url = process.argv[3] ?? 'http://localhost:3200/es'
await mkdir(output, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
await page.goto(url, { waitUntil: 'domcontentloaded' })

let elapsed = 0
for (const at of [180, 760, 1450, 2350, 3050, 3950]) {
  await page.waitForTimeout(at - elapsed)
  elapsed = at
  await page.screenshot({ path: resolve(output, `intro-${String(at).padStart(4, '0')}.png`) })
}

await browser.close()
