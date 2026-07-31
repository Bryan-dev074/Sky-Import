import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Auditoría automática con axe sobre las rutas principales, en los dos idiomas.
 *
 * Cubre lo que una máquina puede comprobar: contraste, nombres accesibles,
 * roles, etiquetas de formulario, orden de encabezados y atributos ARIA. Lo que
 * no cubre —trampa de foco, movimiento reducido, orden real de tabulación— está
 * verificado en `experiencia.spec.ts`.
 */

const RUTAS = [
  '/es',
  '/es/catalogo',
  '/es/producto/geforce-rtx-5080-16gb',
  '/es/armar',
  '/es/carrito',
  '/es/checkout',
  '/es/guias',
  '/es/guias/el-zocalo-decide',
  '/pt',
  '/pt/catalogo',
]

for (const ruta of RUTAS) {
  test(`sin infracciones de accesibilidad en ${ruta}`, async ({ page }) => {
    await page.goto(ruta)
    // La cortina de entrada cubre la página durante 1,25 s.
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 4000 })

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const resumen = violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)
    expect(resumen, resumen.join('\n')).toEqual([])
  })
}
