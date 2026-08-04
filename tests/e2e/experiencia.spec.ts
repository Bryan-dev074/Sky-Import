import { expect, test, type Page } from '@playwright/test'
import { INTRO_TIMING } from '../../src/lib/introTiming'

type BuildSlot = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'cooling' | 'case'

const INTRO_EXIT_TIMEOUT = 8_000

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
    // La secuencia premium completa dura 3,86 s. El tope incluye margen para
    // equipos lentos y CI: mide que se va sola, no el reloj exacto.
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: INTRO_EXIT_TIMEOUT })
  })

  test('deja de capturar el puntero en cuanto la cortina se abre', async ({ page }) => {
    await page.goto('/es')
    // Lo que de verdad importa no es cuándo desaparece el nodo, sino desde
    // cuándo la tienda es usable. En el instante en que la primera lama se
    // mueve, el panel suelta el puntero aunque siga desmontándose.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const nodo = document.querySelector('.intro')
            return !nodo || getComputedStyle(nodo).pointerEvents === 'none'
          }),
        { intervals: [50], timeout: INTRO_TIMING.curtainMs + 500 },
      )
      .toBe(true)
  })

  test('no vuelve a aparecer al navegar entre páginas', async ({ page, isMobile }) => {
    await page.goto('/es')
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: INTRO_EXIT_TIMEOUT })

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

  test('el producto de portada no se desplaza ni escala', async ({ page }) => {
    await page.goto('/es')
    await expect(page.locator('.intro')).toHaveCount(0)

    const hero = page.locator('.u-hero-product')
    const image = hero.locator('img.u-product-media__asset')
    await expect(image).toBeVisible()

    const box = await hero.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height * 0.3)

    await expect
      .poll(() =>
        image.evaluate((node) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform)
          return {
            x: matrix.m41,
            y: matrix.m42,
            scale: Math.hypot(matrix.a, matrix.b),
          }
        }),
      )
      .toEqual({ x: 0, y: 0, scale: 1 })
  })
})

test('el producto de portada es transparente y conserva movimiento fino', async ({
  page,
  isMobile,
}) => {
  await page.goto('/es')
  await expect(page.locator('.intro')).toHaveCount(0, { timeout: INTRO_EXIT_TIMEOUT })

  const hero = page.locator('.u-hero-product')
  const image = hero.locator('img.u-product-media__asset')
  await expect(image).toBeVisible()
  await expect(page.locator('.u-product-media__aura')).toHaveCount(0)
  await expect
    .poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
    .toBeGreaterThanOrEqual(1600)
  await expect.poll(() => image.evaluate((node) => getComputedStyle(node).filter)).toBe('none')

  const transition = await image.evaluate((node) => {
    const styles = getComputedStyle(node)
    const durations = styles.transitionDuration.split(',').map((value) => {
      const duration = Number.parseFloat(value)
      return value.trim().endsWith('ms') ? duration : duration * 1000
    })
    return {
      properties: styles.transitionProperty.split(',').map((value) => value.trim()),
      longestDurationMs: Math.max(...durations),
    }
  })
  expect(transition.properties).toEqual(['transform'])
  expect(transition.longestDurationMs).toBeLessThan(300)

  const box = await hero.boundingBox()
  expect(box).not.toBeNull()

  if (isMobile) {
    const initialTransform = await image.evaluate((node) => getComputedStyle(node).transform)
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.waitForTimeout(300)
    await expect.poll(() => image.evaluate((node) => getComputedStyle(node).transform)).toBe(
      initialTransform,
    )
    return
  }

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect
    .poll(() =>
      image.evaluate((node) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform)
        return Math.hypot(matrix.a, matrix.b)
      }),
    )
    .toBeGreaterThan(1.04)

  await page.mouse.move(box!.x + box!.width * 0.25, box!.y + box!.height * 0.3)
  await expect
    .poll(() =>
      image.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41),
    )
    .toBeLessThan(-2)

  await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height * 0.7)
  await expect
    .poll(() =>
      image.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41),
    )
    .toBeGreaterThan(2)
})

test('la portada acerca la 5090 e invita a ensamblar con piezas reales', async ({ page }) => {
  await page.goto('/es')

  const heroArt = page.locator('.u-hero-product__art')
  await expect(heroArt).toBeVisible()
  await expect(page.locator('[data-build-invite="ambient"] img')).toHaveCount(3)

  const ratio = await heroArt.evaluate(
    (node) =>
      node.getBoundingClientRect().width /
      (node.parentElement?.getBoundingClientRect().width ?? Number.POSITIVE_INFINITY),
  )
  expect(ratio).toBeGreaterThan(1)
})

test.describe('cursor propio', () => {
  test('se dibuja con puntero fino y no existe en táctil', async ({ page, isMobile }) => {
    await page.goto('/es')
    await page.mouse.move(400, 400)

    if (isMobile) {
      await expect(page.locator('html')).not.toHaveAttribute('data-pointer', 'hidden')
      await expect(page.locator('.cur-dot')).toHaveCount(0)
    } else {
      await expect(page.locator('html')).toHaveAttribute('data-pointer', 'hidden')
      await expect(page.locator('.cur-dot')).toBeAttached()
    }
  })

  test('el retículo nunca se traga la pantalla', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no hay cursor propio en táctil')
    await page.goto('/es')

    // Sobre una ficha de producto —el elemento grande donde antes el retículo
    // adoptaba el rectángulo del objetivo y ocupaba media ventana.
    const ficha = page.locator('[data-cursor="product"]').first()
    await ficha.scrollIntoViewIfNeeded()
    await ficha.hover()

    const caja = await page.locator('.cur-ring').boundingBox()
    expect(caja).not.toBeNull()
    expect(caja!.width).toBeLessThan(120)
    expect(caja!.height).toBeLessThan(120)
  })
})

test.describe('teclado', () => {
  test('el enlace de salto es el primer destino del tabulador', async ({ page }) => {
    await page.goto('/es')
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: INTRO_EXIT_TIMEOUT })

    await page.keyboard.press('Tab')
    const enfocado = page.locator('.skip-link')
    await expect(enfocado).toBeFocused()
    await expect(enfocado).toBeVisible()
  })

  test('el foco del producto sigue usable sin movimiento decorativo', async ({ page }) => {
    await page.goto('/es/catalogo')
    await expect(page.locator('.intro')).toHaveCount(0, { timeout: INTRO_EXIT_TIMEOUT })

    const productLink = page.locator('article').first().getByRole('link').first()
    const image = productLink.locator('img.u-product-media__asset')
    await productLink.focus()

    await expect(productLink).toBeFocused()
    await expect
      .poll(() =>
        image.evaluate((node) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform)
          return {
            x: matrix.m41,
            y: matrix.m42,
            scale: Math.hypot(matrix.a, matrix.b),
          }
        }),
      )
      .toEqual({ x: 0, y: 0, scale: 1 })
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

  test('cambiar de idioma NO recarga la página: traduce en el sitio', async ({ page, isMobile }) => {
    await page.goto('/es/catalogo')
    await expect(page.getByRole('article').first()).toBeVisible()

    // Se marca la ventana para detectar cualquier recarga o navegación real.
    await page.evaluate(() => {
      ;(window as unknown as { __vivo: boolean }).__vivo = true
    })

    await abrirControles(page, isMobile)
    await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'PT' }).click()

    await expect(page.getByPlaceholder('Buscar por modelo, marca ou código')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page).toHaveURL(/\/pt\/catalogo$/)

    // La marca sigue ahí: no hubo recarga, solo cambió el idioma.
    const vivo = await page.evaluate(() => (window as unknown as { __vivo?: boolean }).__vivo === true)
    expect(vivo, 'la página no debe recargarse al cambiar de idioma').toBe(true)
  })

  test('el idioma sobrevive a una recarga porque queda en la ruta', async ({ page, isMobile }) => {
    await page.goto('/es')
    await abrirControles(page, isMobile)
    await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: 'PT' }).click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  })

  test('quien entra sin prefijo de idioma cae en español', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/es$/)
  })
})

test.describe('configurador', () => {
  const validBuild: Record<BuildSlot, string> = {
    cpu: 'ryzen-7-9800x3d',
    motherboard: 'msi-mag-b850-tomahawk-wifi',
    ram: 'corsair-vengeance-ddr5-32gb-6000',
    gpu: 'geforce-rtx-5080-16gb',
    storage: 'samsung-990-pro-2tb',
    psu: 'corsair-rm1000x',
    cooling: 'arctic-liquid-freezer-iii-360',
    case: 'lian-li-lancool-216',
  }

  const seedBuild = async (page: Page, picks: Record<BuildSlot, string>) => {
    await page.addInitScript((seededPicks) => {
      localStorage.setItem(
        'sky-import:build:v1',
        JSON.stringify({ state: { picks: seededPicks }, version: 0 }),
      )
    }, picks)
  }

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

  test('espera el botón, prueba el equipo y recién entonces lo enciende', async ({ page }) => {
    await seedBuild(page, validBuild)
    await page.goto('/es/armar')

    await expect(page.getByRole('button', { name: 'Encender PC' })).toBeVisible()
    await expect(page.getByText('Sistema encendido')).toHaveCount(0)
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { __pcBuilderState?: { powered?: boolean } }).__pcBuilderState
              ?.powered ?? false,
        ),
      )
      .toBe(false)

    await page.getByRole('button', { name: 'Encender PC' }).click()
    await expect(
      page.getByRole('status').filter({ hasText: 'Comprobando energía y compatibilidad' }),
    ).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: 'Sistema encendido' })).toBeVisible({
      timeout: 4000,
    })
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { __pcBuilderState?: { powered?: boolean } }).__pcBuilderState
              ?.powered ?? false,
        ),
      )
      .toBe(true)

    const purchase = page.getByRole('button', { name: 'Comprar armado' })
    await expect(purchase).toBeVisible()
    await purchase.click()
    await expect(page.getByRole('dialog', { name: 'Carrito' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Abrir carrito' })).toContainText('08')
  })

  test('una fuente insuficiente bloquea el arranque y marca sus piezas', async ({ page }) => {
    await seedBuild(page, { ...validBuild, psu: 'msi-mag-a650bn' })
    await page.goto('/es/armar')

    await page.getByRole('button', { name: 'Encender PC' }).click()
    await expect(page.getByText('La fuente está por debajo de lo recomendado').last()).toBeVisible({
      timeout: 4000,
    })
    await expect(page.locator('[data-diagnostic="error"]')).toHaveCount(2)
    await expect(page.getByRole('button', { name: 'Comprar armado' })).toHaveCount(0)
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { __pcBuilderState?: { powered?: boolean } }).__pcBuilderState
              ?.powered ?? false,
        ),
      )
      .toBe(false)
  })

  test('el laboratorio móvil muestra las ocho piezas en una cuadrícula 4 por 2', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'esta geometría pertenece al armador táctil')
    await page.goto('/es/armar')

    const cells = page.locator('[data-pc-dock] [data-pc-slot]')
    await expect(cells).toHaveCount(8)
    const boxes = await cells.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect()
        return { top: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) }
      }),
    )

    expect(new Set(boxes.slice(0, 4).map((box) => box.top)).size).toBe(1)
    expect(new Set(boxes.slice(4).map((box) => box.top)).size).toBe(1)
    expect(boxes[4]!.top).toBeGreaterThan(boxes[0]!.top)
    expect(Math.min(...boxes.map((box) => box.width))).toBeGreaterThanOrEqual(44)
    expect(Math.min(...boxes.map((box) => box.height))).toBeGreaterThanOrEqual(44)
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true)
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
