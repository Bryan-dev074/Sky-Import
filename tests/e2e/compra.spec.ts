import { expect, test, type Request } from '@playwright/test'

/**
 * Recorrido completo de compra, de punta a punta, como lo haría un cliente.
 *
 * La prueba clave no es que el flujo avance: es que al pulsar «Procesar pago»
 * aparezca la advertencia de experiencia demostrativa Y que no haya salido del
 * navegador ninguna petición que pudiera parecerse a un cobro.
 */

const MENSAJE_DEMO =
  'Esta es una experiencia demostrativa. No se procesó ningún pago ni se almacenaron datos.'

test('el recorrido completo termina en la advertencia y sin ninguna solicitud de pago', async ({
  page,
}) => {
  // ── vigilancia de red durante todo el recorrido ──
  const escrituras: Request[] = []
  const externas: Request[] = []
  page.on('request', (request) => {
    const method = request.method()
    if (method !== 'GET' && method !== 'HEAD') escrituras.push(request)
    const url = new URL(request.url())
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') externas.push(request)
  })

  // 1 · abrir el catálogo
  await page.goto('/es/catalogo')
  await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible()

  // 2 · buscar — sin tildes, que es como escribe casi todo el mundo
  await page.getByLabel('Buscar en el catálogo').fill('rtx 5070')
  await expect(page.getByRole('article').first()).toBeVisible()

  // 3 · abrir una pieza
  await page.getByRole('link', { name: 'GeForce RTX 5070 12 GB', exact: false }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('RTX 5070')
  await expect(page.getByText('SI-VGA-0124')).toBeVisible()

  // 4 · agregar al carrito
  await page.getByTestId('agregar').click()
  await expect(page.getByTestId('agregar')).toContainText('Agregado')
  await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('01')

  // 5 · modificar la cantidad desde el carrito
  await page.getByRole('button', { name: 'Abrir carrito' }).click()
  const panel = page.getByRole('dialog', { name: 'Carrito' })
  await expect(panel).toBeVisible()
  await panel.getByRole('button', { name: 'Sumar una unidad' }).first().click()
  await expect(panel.getByTestId('cantidad').first()).toHaveText('2')
  await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('02')

  // 6 · avanzar por el checkout
  await panel.getByRole('link', { name: 'Finalizar compra' }).click()
  await expect(page).toHaveURL(/\/es\/checkout$/)

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Resumen del pedido')
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Entrega y pago')
  // Los radios son `sr-only` y se operan por su etiqueta, igual que lo haría
  // cualquier visitante: se pulsa el texto, no el control invisible.
  await page.getByText('Envío dentro de Paraguay', { exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Envío dentro de Paraguay', exact: false })).toBeChecked()
  await page.getByText('Transferencia bancaria', { exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Transferencia bancaria', exact: false })).toBeChecked()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Confirmación')

  // Hasta acá, en ninguna pantalla se pidió un dato sensible.
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await expect(page.locator('input[autocomplete*="cc-"]')).toHaveCount(0)
  await expect(page.locator('form[action]')).toHaveCount(0)

  // 7 · pulsar finalizar
  await page.getByTestId('finalizar').click()

  // 8 · la advertencia aparece, con el texto exacto
  const revelacion = page.getByTestId('revelacion')
  await expect(revelacion).toBeVisible()
  await expect(revelacion).toContainText(MENSAJE_DEMO)
  await expect(revelacion.getByRole('link', { name: 'Volver a la tienda' })).toBeVisible()
  await expect(revelacion.getByRole('link', { name: 'Revisar el carrito' })).toBeVisible()
  await expect(revelacion.getByRole('button', { name: 'Empezar de nuevo' })).toBeVisible()

  // 9 · no se produjo NINGUNA solicitud de pago
  expect(escrituras, 'el proyecto no hace peticiones de escritura en ningún momento').toHaveLength(0)
  expect(externas, 'el proyecto no llama a ningún servicio externo').toHaveLength(0)

  // 10 · el carrito sigue intacto tras la revelación
  await revelacion.getByRole('link', { name: 'Revisar el carrito' }).click()
  await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('02')
})

test('la revelación es lo único que declara el carácter demostrativo', async ({ page }) => {
  const rutas = [
    '/es',
    '/es/catalogo',
    '/es/producto/geforce-rtx-5080-16gb',
    '/es/armar',
    '/es/guias',
    '/es/carrito',
    '/es/checkout',
  ]

  for (const ruta of rutas) {
    await page.goto(ruta)
    const texto = (await page.locator('body').innerText()).toLowerCase()
    for (const palabra of ['demostrativ', 'prototipo', 'ficticio', 'portafolio', 'portfólio']) {
      expect(texto, `«${palabra}» no debe aparecer en ${ruta}`).not.toContain(palabra)
    }
    expect((await page.title()).toLowerCase()).not.toContain('demo')
  }
})

test('el carrito sobrevive a una recarga completa', async ({ page }) => {
  await page.goto('/es/producto/corsair-rm750e')
  await page.getByTestId('agregar').click()
  await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('01')

  await page.reload()
  await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('01')
})

test('la tienda pide no ser indexada mientras no sea un comercio operativo', async ({ page }) => {
  const response = await page.goto('/es')
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  const robots = await page.request.get('/robots.txt')
  expect(await robots.text()).toContain('Disallow: /')
})
