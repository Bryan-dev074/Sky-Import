import { expect, test, type Page } from '@playwright/test'

type BuildSlot = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'cooling' | 'case'

/**
 * Comprobaciones de la experiencia: intro, cursor, movimiento reducido, teclado,
 * moneda, idioma, configurador y estados vacíos. Son las promesas que un
 * recorrido de compra no toca.
 */

/** En teléfono los selectores de moneda e idioma viven dentro del menú. */
async function abrirControles(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'Abrir menú' }).click()
}

test.describe('intro de marca', () => {
  test('aparece en una carga completa y desaparece dentro del tope', async ({ page }) => {
    await page.goto('/es')
    // Está en el marcado del servidor: no depende de la hidratación.
    await expect(page.locator('.intro')).toBeAttached()
    // Y se va sola dentro del tope duro de 1,75 s, con margen de holgura.
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 4000 })
  })

  test('no vuelve a aparecer al navegar entre páginas', async ({ page, isMobile }) => {
    await page.goto('/es')
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 4000 })

    if (isMobile) await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.getByRole('banner').getByRole('link', { name: 'Catálogo' }).first().click()
    await expect(page).toHaveURL(/\/es\/catalogo$/)
    await expect(page.locator('.intro')).toHaveCount(0)
  })

  test('se puede omitir con Escape', async ({ page }) => {
    await page.goto('/es')
    await page.keyboard.press('Escape')
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 2000 })
  })
})

test.describe('movimiento reducido', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('la intro no se pinta y el titular está visible desde el primer cuadro', async ({ page }) => {
    await page.goto('/es')
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'skip')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.intro')).toHaveCount(0)
  })

  test('las entradas por scroll no dejan contenido invisible', async ({ page }) => {
    await page.goto('/es')
    await page.getByRole('heading', { name: 'Qué decide cada pieza' }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { name: 'Qué decide cada pieza' })).toBeVisible()
  })
})

test.describe('cursor propio', () => {
  test('se dibuja con puntero fino y no existe en táctil', async ({ page, isMobile }) => {
    await page.goto('/es')
    await page.mouse.move(400, 400)

    if (isMobile) {
      await expect(page.locator('html')).not.toHaveAttribute('data-cursor', 'on')
      await expect(page.locator('.cur-dot')).toHaveCount(0)
    } else {
      await expect(page.locator('html')).toHaveAttribute('data-cursor', 'on')
      await expect(page.locator('.cur-dot')).toBeAttached()
    }
  })
})

test.describe('teclado', () => {
  test('el enlace de salto es el primer destino del tabulador', async ({ page }) => {
    await page.goto('/es')
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: 4000 })

    await page.keyboard.press('Tab')
    const enfocado = page.locator('.skip-link')
    await expect(enfocado).toBeFocused()
    await expect(enfocado).toBeVisible()
  })

  test('el carrito atrapa el foco, cierra con Escape y lo devuelve a quien lo abrió', async ({
    page,
  }) => {
    await page.goto('/es/producto/thermal-grizzly-kryonaut-1g')
    await page.getByTestId('agregar').click()

    const abridor = page.getByRole('button', { name: 'Abrir carrito' })
    await abridor.click()

    const panel = page.getByRole('dialog', { name: 'Carrito' })
    await expect(panel).toBeVisible()
    await expect(panel.locator(':focus')).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expect(panel).not.toBeVisible()
    await expect(abridor).toBeFocused()
  })
})

test.describe('moneda e idioma', () => {
  test('cambiar de moneda cambia el importe sin recargar la página', async ({ page, isMobile }) => {
    await page.goto('/es/producto/geforce-rtx-5080-16gb')
    await expect(page.getByText('US$ 1.249').first()).toBeVisible()

    await abrirControles(page, isMobile)
    await page.getByRole('group', { name: 'Moneda' }).getByRole('button', { name: 'BRL' }).click()

    await expect(page.locator('html')).toHaveAttribute('data-currency', 'BRL')
    await expect(page.getByText('R$ 6.744,60').first()).toBeVisible()
    // El importe en dólares sigue impreso en el HTML —así no hay parpadeo—
    // pero deja de estar visible y sale del árbol de accesibilidad.
    await expect(page.getByText('US$ 1.249').first()).not.toBeVisible()
  })

  test('el idioma vive en la ruta y conserva la página', async ({ page, isMobile }) => {
    await page.goto('/es/catalogo')
    await abrirControles(page, isMobile)
    await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: 'PT' }).click()

    await expect(page).toHaveURL(/\/pt\/catalogo$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.getByPlaceholder('Buscar por modelo, marca ou código')).toBeVisible()
  })

  test('quien entra sin prefijo de idioma cae en español', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/es$/)
  })
})

test.describe('configurador', () => {
  const elegir = async (page: Page, ranura: BuildSlot, pieza: RegExp) => {
    await page
      .locator(`li[data-slot="${ranura}"]`)
      .getByRole('button', { name: /Elegir|Cambiar/ })
      .click()
    await page.getByRole('dialog').getByRole('button', { name: pieza }).click()
  }

  test('detecta un zócalo incompatible y lo explica en lenguaje llano', async ({ page }) => {
    await page.goto('/es/armar')
    await elegir(page, 'cpu', /Ryzen 7 9800X3D/)
    await elegir(page, 'motherboard', /B760M DS3H/)

    await expect(page.getByText('El procesador no entra en esta placa')).toBeVisible()
    await expect(page.getByText(/zócalo AM5 y la placa es LGA1700/)).toBeVisible()
    await expect(page.getByText('Hay piezas que no encajan')).toBeVisible()
  })

  test('avisa cuando la fuente queda corta para la placa de video', async ({ page }) => {
    await page.goto('/es/armar')
    await elegir(page, 'gpu', /GeForce RTX 5080/)
    await elegir(page, 'psu', /MAG A650BN/)

    await expect(page.getByText('La fuente está por debajo de lo recomendado')).toBeVisible()
    await expect(page.getByText('Hay algo que conviene revisar')).toBeVisible()
  })

  test('un armado coherente no levanta advertencias y pasa entero al carrito', async ({ page }) => {
    await page.goto('/es/armar')
    await elegir(page, 'cpu', /Ryzen 7 9800X3D/)
    await elegir(page, 'motherboard', /MAG B850 TOMAHAWK/)
    await elegir(page, 'ram', /Vengeance DDR5 32 GB/)
    await elegir(page, 'gpu', /GeForce RTX 5080/)
    await elegir(page, 'psu', /RM1000x/)
    await elegir(page, 'case', /LANCOOL 216/)

    await expect(page.getByText('Sin advertencias por ahora.')).toBeVisible()
    await expect(page.getByText('Todo lo comprobado encaja')).toBeVisible()

    await page.getByRole('button', { name: 'Agregar el armado al carrito' }).click()
    await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('06')
  })
})

test.describe('estados vacíos y errores', () => {
  test('el catálogo sin resultados ofrece salir del callejón', async ({ page }) => {
    await page.goto('/es/catalogo?q=zzzzzz')
    await expect(page.getByText('Ninguna pieza coincide')).toBeVisible()
    await page.getByRole('button', { name: 'Restablecer filtros' }).first().click()
    await expect(page).toHaveURL(/\/es\/catalogo$/)
    await expect(page.getByRole('article').first()).toBeVisible()
  })

  test('los filtros viven en la URL y se pueden compartir', async ({ page }) => {
    await page.goto('/es/catalogo?categoria=procesadores')
    const articulos = page.getByRole('article')
    await expect(articulos.first()).toBeVisible()
    const total = await articulos.count()
    expect(total).toBe(5)
  })

  test('una dirección inexistente muestra el 404 de la casa', async ({ page }) => {
    const response = await page.goto('/es/producto/no-existe')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('Esta dirección no existe')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver catálogo' })).toBeVisible()
  })
})
