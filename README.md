# Sky Import

Tienda de componentes para PC de Ciudad del Este, Paraguay. Catálogo tipado,
configurador de compatibilidad, carrito persistente y checkout simulado, en
**español y portugués** y con precios en **dólares, guaraníes y reales**.

> **Sobre el checkout.** El flujo de compra es completo hasta el último paso.
> Al pulsar «Procesar pago», la acción se intercepta **antes de cualquier
> operación** y aparece una pantalla que aclara que se trata de una experiencia
> demostrativa. En ningún momento se solicitan, se transmiten ni se almacenan
> datos de pago: no existe una sola petición de red de escritura en todo el
> proyecto, y hay una prueba end-to-end que lo verifica.

---

## Vista previa

| | |
|---|---|
| **Entrada** | La cortina se desarma en lamas verticales que se retiran en secuencia |
| **Fondo vivo** | Retícula de vías que se abomba al acercarse el puntero, con onda de energía |
| **Inicio** | Hilos de ruido reactivos, titular por palabras, índice en celdas que responden por proximidad |
| **Ensamblaje** | Una placa de video construida en código con three.js que se arma al hacer scroll |
| **Catálogo** | 37 piezas con dibujo propio, búsqueda sin tildes, filtros en la URL |
| **Arma tu PC** | Tablero que compara zócalo, generación DDR, vataje y milímetros |
| **Checkout** | Tres pasos, sin un solo campo de datos sensibles |

**El idioma cambia sin recargar.** Español y portugués conviven en el paquete del
cliente: pulsar `PT` retraduce la tienda en el sitio, corrige la URL y deja el
scroll, el carrito y el armado donde estaban.

---

## Tecnologías

| Herramienta | Versión | Rol |
|---|---|---|
| [Next.js](https://nextjs.org) (App Router) | 16.2.12 | Marco, generación estática de las dos versiones de idioma |
| [React](https://react.dev) | 19.2.8 | Interfaz |
| [TypeScript](https://www.typescriptlang.org) | 5.9.3 | Modo estricto, con `noUncheckedIndexedAccess` |
| [Tailwind CSS](https://tailwindcss.com) | 4.3.3 | Sistema de estilos con los tokens en `@theme` |
| [Zustand](https://zustand.docs.pmnd.rs) | 5.0.14 | Carrito y armado, persistidos en `localStorage` |
| [three.js](https://threejs.org) | 0.185.1 | La pieza de ensamblaje y el fondo de haces, cargados dinámicamente |
| [ogl](https://github.com/oframe/ogl) | 1.0.11 | El fondo de hilos del primer viewport |
| [Vitest](https://vitest.dev) | 4.1.10 | Pruebas unitarias |
| [Playwright](https://playwright.dev) | 1.62.1 | Pruebas end-to-end |
| [axe-core](https://github.com/dequelabs/axe-core) | 4.x | Auditoría de accesibilidad |
| [sharp](https://sharp.pixelplumbing.com) | 0.35 | Generación de la imagen social |

Sin backend, sin base de datos, sin autenticación y sin servicios externos.

---

## Requisitos

- Node.js **20.9 o superior** (probado en 24.17).
- npm 10 o superior. El proyecto usa **npm** de forma consistente; hay
  `package-lock.json` en el repositorio.

---

## Instalación local

```bash
npm install
```

```bash
npm run dev
```

La aplicación queda en `http://localhost:3000` y redirige a `/es` o `/pt` según
el idioma del navegador.

---

## Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Sirve la compilación de producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run e2e` | Pruebas end-to-end (Playwright) |
| `npm run a11y` | Auditoría de accesibilidad con axe (WCAG 2.1 AA) |
| `npm run e2e:install` | Descarga el navegador que usa Playwright |
| `npm run assets` | Regenera `public/og.png` |
| `npm run verify` | lint + tipos + unitarias + build, en ese orden |

### Pruebas

```bash
npm test
```

```bash
npm run e2e:install && npm run e2e
```

Las pruebas end-to-end levantan solas la compilación de producción en el puerto
3100. Cubren el recorrido completo de compra, la aparición de la advertencia
final, la ausencia de peticiones de pago, la intro, el cursor, el movimiento
reducido, el teclado, el cambio de moneda e idioma, el configurador y los
estados vacíos.

`npm run a11y` pasa **axe** sobre diez rutas en los dos idiomas y falla si
aparece cualquier infracción de WCAG 2.1 AA.

---

## Estructura

```
src/
  app/
    [locale]/            layout raíz + páginas (la ruta lleva el idioma)
      page.tsx           inicio
      catalogo/          catálogo con filtros
      producto/[slug]/   ficha de producto
      armar/             configurador
      carrito/           carrito a pantalla completa
      checkout/          checkout de tres pasos
      guias/[slug]/      sección editorial
    global-not-found.tsx 404 de la casa
    globals.css          el sistema visual completo
    robots.ts · sitemap.ts
  components/
    background/          campo de vías, hilos y haces (los tres diferidos)
    brand/ chrome/ intro/ cursor/ motif/
    catalog/ product/ builder/ cart/ checkout/ home/
    motion/              primitivas: entrada, imán, vitrina, celdas, canto energizado
    render/              el dibujo propio de cada pieza + los degradados compartidos
    three/               la pieza de ensamblaje
    ui/ views/           las vistas de cada página
  config/site.ts         contacto, tipo de cambio y umbrales comerciales
  content/guides.ts      la sección editorial
  lib/
    catalog/             tipos, productos, categorías y estados derivados
    i18n/                idiomas y diccionario
    motion.ts            el bucle de animación compartido y sus ganchos
    cart.ts build.ts compat.ts money.ts search.ts prefs.ts ui.ts
  proxy.ts               resuelve el idioma de quien entra sin prefijo
tests/
  unit/                  carrito, moneda, compatibilidad, búsqueda
  e2e/                   recorrido de compra y experiencia
scripts/
  build-assets.mjs       genera la imagen social
  shots.mjs              capturas de verificación en los cinco tamaños
```

---

## Cómo editar el contenido

### Productos

Todo el catálogo vive en [`src/lib/catalog/products.ts`](src/lib/catalog/products.ts).
Cada pieza declara nombre, marca, modelo, código de referencia, precio en USD,
unidades, descripción en los dos idiomas, ficha técnica y un objeto `compat` que
es lo que consume el configurador.

Tres reglas que conviene no romper:

1. **`units` es la única fuente de la disponibilidad.** No existe un campo
   «agotado»: `0` unidades da agotado, `≤ 3` da «últimas unidades». Cambiá el
   umbral en `RULES.lowStockAt`.
2. **La oferta se deriva de `listPriceUsd`.** Si es mayor que `priceUsd`, la
   interfaz calcula y muestra el porcentaje. Si no existe, no hay oferta.
3. **`compat` cambia el comportamiento del configurador.** Un milímetro o un
   vatio distinto ahí cambia las advertencias; no hay una segunda copia del dato.
4. **`render.variant` cambia el dibujo.** No es un matiz: elige entre diseños
   distintos dentro de la familia (tres carcasas de placa de video, tres frentes
   de gabinete, disipador de una torre o de dos). `render.seed` desplaza los
   detalles menores de forma determinista.

Para agregar una pieza basta con añadir un objeto al array: el catálogo, los
filtros, el buscador, el configurador, el sitemap y las rutas estáticas se
actualizan solos.

### Precios y tipo de cambio

En [`src/config/site.ts`](src/config/site.ts):

```ts
export const FX = {
  PYG: 7400,   // guaraníes por dólar
  BRL: 5.4,    // reales por dólar
  reference: '2026-07',
}
```

El **dólar es la fuente de verdad** de todo precio. Guaraní y real se derivan con
esa tasa fija y se redondean «de vitrina» (al millar en guaraníes, al décimo en
reales). La interfaz los rotula siempre como **referenciales** y nunca afirma que
sean una cotización en vivo. Cambiar estos dos números actualiza toda la tienda.

### WhatsApp

En el mismo archivo:

```ts
export const CONTACT = {
  whatsapp: '595982064334',        // formato internacional, sin signos
  whatsappDisplay: '+595 982 064 334',
}
```

Si `whatsapp` queda como cadena vacía, **la interfaz oculta por completo todo
CTA de WhatsApp** en lugar de publicar un enlace roto. No hace falta tocar
ningún componente.

### Textos de la interfaz

En [`src/lib/i18n/dictionary.ts`](src/lib/i18n/dictionary.ts). El español es la
fuente y el portugués está tipado como `Record<DictKey, string>`: si falta una
clave en portugués, **falla la comprobación de tipos**. Ningún texto puede quedar
en un solo idioma sin que se note.

---

## Desplegar en Vercel

1. En el panel de Vercel, **Add New → Project → Import Git Repository** y elegí
   este repositorio.
2. Vercel detecta Next.js solo. No hace falta cambiar el comando de compilación
   (`next build`), el directorio de salida ni el gestor de paquetes.
3. **No hay variables de entorno.** El proyecto no usa ninguna, así que no existe
   `.env.example`.
4. Desplegá.

Si más adelante se le pone un dominio propio, conviene actualizar `SITE.origin`
en `src/config/site.ts` para que las URLs absolutas de la metadata y el sitemap
apunten al dominio real.

### Sobre la indexación

Mientras la tienda no sea un comercio operativo, **está configurada para no
indexarse**: `robots.txt` con `Disallow: /`, cabecera `X-Robots-Tag: noindex,
nofollow` en todas las respuestas y `noindex` en la metadata. Cuando pase a ser
real, se levanta desde dos sitios: `src/app/robots.ts` y el bloque `robots` del
layout. No hay ninguna otra copia de esa decisión.

---

## Documentación del proyecto

- [`PRODUCT.md`](PRODUCT.md) — verdad de producto: quién compra, en qué contexto,
  qué no se puede inventar.
- [`DESIGN.md`](DESIGN.md) — el sistema visual, con el rol y la prohibición de
  cada token.
- [`docs/decisiones-tecnicas.md`](docs/decisiones-tecnicas.md) — qué se evaluó,
  qué se instaló, qué se descartó y por qué.
- [`CREDITS.md`](CREDITS.md) — licencias y recursos de terceros.

---

## Licencias y recursos de terceros

Todo el material gráfico del proyecto es **autoral**: los renders de componentes
son SVG dibujados a mano, la pieza 3D es geometría generada en código y el motivo
de las pistas de circuito se genera a partir de una semilla. No se reproduce
ninguna marca, logotipo ni fotografía de terceros.

Las tipografías (Archivo y Azeret Mono) son de licencia SIL Open Font License 1.1
y se sirven desde el propio dominio a través de `next/font`. El detalle completo
está en [`CREDITS.md`](CREDITS.md).
