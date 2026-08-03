# Task 9 — verificación visual y automatizada completa

Fecha: 2026-08-03
Branch: `codex/premium-store-3d`
Base inicial: `a8182b614d70a24270e2005d0de55c497bbef542`

## Resultado

La verificación completa queda verde: 38/38 medios válidos, lint y typecheck sin errores, 102/102 pruebas unitarias, build de producción con 100 rutas estáticas y Playwright con 73 pruebas aprobadas más un skip intencional de cursor fino en táctil. La intro móvil no presentó el flake documentado.

Se hicieron dos correcciones necesarias y separadas antes de cerrar la matriz:

1. `013e16f69b49cb7ae1e6bc4fd4b3c6f2ddd58928` — `fix: type product media script imports`.
2. `d03b577e1efa114688887477b7c2d2cc54f7228f` — `fix: release invalid media files after validation`.

No se hizo push.

## TS7016 — diagnóstico sistemático y RED/GREEN

### Reproducción RED

`npm run typecheck` salió 1 con exactamente cinco TS7016:

- `tests/unit/product-credits.test.ts:5` y `:30` para `scripts/lib/product-credits.mjs`;
- `tests/unit/product-cutout.test.ts:12` para `scripts/lib/product-cutout.mjs`;
- `tests/unit/product-cutout.test.ts:13` para `scripts/product-cutout-policy.mjs`;
- `tests/unit/product-media-validation.test.ts:5` para `scripts/lib/product-media-validation.mjs`.

Son cinco diagnósticos sobre cuatro módulos: créditos se importa una vez de forma estática y otra dinámica. Con `allowJs: false`, TypeScript no infiere contratos para `.mjs`. Los helpers adyacentes que sí resolvían (`product-cutout-recipes.mjs` y `product-source-sync.mjs`) tienen un `.d.mts` hermano con el mismo basename; los cuatro módulos fallidos no lo tenían.

Hipótesis única: las cuatro declaraciones hermanas exactas debían resolver el error sin wildcard, `any`, `@ts-ignore`, exclusiones ni cambios de strictness. Se añadieron:

- `scripts/lib/product-credits.d.mts`;
- `scripts/lib/product-cutout.d.mts`;
- `scripts/product-cutout-policy.d.mts`;
- `scripts/lib/product-media-validation.d.mts`.

Los contratos reflejan los exports reales, incluidos `SharpInput`, `Metadata`, bounds anulables, opciones de normalización, entradas de manifiesto/crédito, políticas readonly y `Promise<void>`.

El primer GREEN expuso un consumidor inseguro real: `measureOpaqueBounds` puede devolver `null`, pero el test desreferenciaba sin comprobarlo. Se añadió una aserción y guard explícitos en el test; no se falseó el contrato como non-null.

### GREEN enfocado

- `npm run typecheck`: exit 0.
- `npm test -- --run tests/unit/product-cutout.test.ts tests/unit/product-credits.test.ts tests/unit/product-media-validation.test.ts`: 3 archivos, 18/18.
- `npm run lint`: exit 0.
- búsqueda enfocada: sin `declare module '*.mjs'`, `any` ni `@ts-ignore` en las declaraciones.
- `git diff --cached --check`: exit 0.
- commit: `013e16f69b49cb7ae1e6bc4fd4b3c6f2ddd58928`.

## Flake unitario EBUSY — causa y corrección

La primera suite completa posterior a los tipos no falló una aserción de negocio: 100 pruebas pasaron y el teardown de `product-media-validation` falló al borrar un `primary.webp` corrupto con `EBUSY` en Windows.

Investigación:

- reproducción aislada con la ruta directa hacia Sharp: 40 corridas, 11 bloqueos `EBUSY`;
- control leyendo el archivo y pasando un `Buffer` a Sharp: 40 corridas, 0 bloqueos;
- regresión nueva `libera cada archivo corrupto al terminar el diagnóstico`: RED inmediato; también reprodujo el EBUSY del caso anterior.

Raíz: al inspeccionar por path un formato inválido, Sharp/libvips puede conservar transitoriamente el handle del archivo en Windows después de rechazar metadata. La corrección mínima fue `readFile(output)` y `inspectProductCutout(buffer)`, de modo que Sharp nunca posee el path. No se añadieron waits, retries ni tolerancia al error.

GREEN:

- test enfocado: 4/4;
- `npm run typecheck`: exit 0;
- `npm test`: 14 archivos, 102/102;
- `npm run lint`: exit 0;
- `npm run media:validate`: 38/38;
- `git diff --cached --check`: exit 0;
- commit: `d03b577e1efa114688887477b7c2d2cc54f7228f`.

## Verificación de medios

### Comandos

- `npm run media:validate`: exit 0; salida actual exacta: `OK: 38 productos tienen imagen WebP local, fuente y crédito.`
- `npm run media:sheet -- artifacts/product-cutouts-final.webp`: exit 0.
- `view_image` a detalle original sobre `artifacts/product-cutouts-final.webp`.
- auditoría Sharp independiente sobre todo el manifiesto: 38 entradas únicas, 38 WebP, 38 con alfa real (`alphaMin=0`, `alphaMax>0`), 37 lienzos 1600×1600 y la RTX 5090 2048×2048; cero fallos.

La frase del script difiere de la expectativa histórica del plan (`imagen WebP local` frente a `recorte WebP transparente`), pero el conteo 38/38 y la auditoría de alfa confirman explícitamente transparencia en los 38.

### Inspección visual de la hoja

La hoja final muestra las 38 piezas sobre matte oscuro y claro. Se comprobaron siluetas completas, escala coherente dentro de cada categoría, ausencia visible de packaging, props ajenos, halo o matte residual y correspondencia de modelo.

- Los cuatro kits de memoria muestran dos módulos y el catálogo declara `modules: 2`: Corsair Vengeance DDR5 2×16, G.Skill Trident Z5 Neo 2×16, Kingston FURY Beast 2×8 y Corsair Vengeance LPX 2×8.
- `P12 PWM PST — pack de 5` muestra exactamente cinco ventiladores.
- La RTX 5090 usa el slug exacto, 2048×2048, `alphaMin=0`, `alphaMax=255`, el asset `RTX5090-3QTR-Back-Left.png` y la página oficial de NVIDIA Marketplace para Founders Edition.

## Matriz estática, unitaria y producción

Cadena fresca posterior a ambos commits:

```text
npm run media:validate  -> 38/38, exit 0
npm run lint            -> exit 0
npm run typecheck       -> exit 0
npm test                -> 14 archivos, 102/102, exit 0
npm run build           -> 100 páginas estáticas, exit 0
```

El build compiló, ejecutó TypeScript y generó las rutas ES/PT de home, catálogo, producto, carrito, checkout, guías y armador.

## Playwright completo

`npm run e2e`: 74 casos enumerados, 73 passed, 1 skipped intencional, exit 0, 5,2 min.

- Proyectos: Desktop Chrome y Pixel 7.
- Skip: el retículo de cursor fino se omite por diseño en táctil.
- Intro móvil: todas las pruebas pasaron; no ocurrió el flake documentado y no se modificaron timeouts ni retries.
- Movimiento normal, táctil y reduced-motion: verde.
- Axe, compra completa, ausencia de requests de cobro, idiomas, monedas, teclado, carrito, armador, filtros y 404: verde en ambos proyectos.

El servidor de Playwright imprimió `Internal: NoFallbackError` al pedir deliberadamente la ruta inexistente en cada proyecto; el response fue 404, la página de la casa se renderizó y ambas pruebas pasaron. No apareció overlay ni error de página cliente.

## Verificación de navegador y movimiento

Se ejecutó el build con `npm run start -- --port 3200`. El binario global `agent-browser` no estaba en `PATH`; `npx --yes agent-browser` funcionó y se cargó su skill versionada antes de navegar.

### Agent-browser

- Home: 6.775 caracteres de contenido significativo, H1 correcto, snapshot interactivo completo, `overlay=false`, consola sin errores y `errors` vacío.
- Navegación/interacción: home → catálogo → detalle RTX 5090 → agregar/abrir carrito → armador → abrir selector/elegir Ryzen 7 9800X3D.
- RTX 5090 hero: src exacto local, alt exacto, `naturalWidth=2048`, `filter=none`, `background=none`, cero aura.
- Hover hero fine-pointer: el `img` llegó a `scale=1.055`, `x=-1.648`, `y=0.096`; permaneció dentro del panel.
- Hover primera card: el `img` llegó a `scale=1.055`, `y=9.146`; `filter=none`, `background=none`, cero aura. La captura hover muestra la traslación/escala y cotas sin borde de canvas, matte, halo ni bounds transparentes visibles.
- Reduced motion: `prefers-reduced-motion=true`, `data-intro=skip`, intro 0, H1 visible y hero `x=0`, `y=0`, `scale=1` incluso con el puntero encima.
- No hubo Next overlay ni console errors. El armador WebGL emitió sólo warnings del compilador D3D por precisión y la deprecación de `PCFSoftShadowMap`; `agent-browser errors` quedó vacío.

### Touch real

La emulación de viewport de agent-browser conserva puntero fino, por lo que la evidencia móvil final se recapturó con el perfil real `devices['Pixel 7']` usado por la suite:

```json
{
  "viewport": [412, 839],
  "finePointer": false,
  "coarsePointer": true,
  "customCursorCount": 0,
  "overflowX": 0,
  "overlay": false,
  "consoleErrors": [],
  "pageErrors": []
}
```

El drawer móvil del carrito se capturó después de comprobar por condición que su rect era exactamente `x=0`, `width=412` y `transform=none`, evitando documentar un cuadro intermedio de la transición.

## Evidencia visual local

Todos estos archivos están bajo `artifacts/`, ignorados por `.git/info/exclude` y no forman parte de los commits:

- `artifacts/product-cutouts-final.webp` — hoja 38 productos, dos mattes.
- `artifacts/task-9/desktop-home-hero.png`.
- `artifacts/task-9/desktop-catalog-grid.png`.
- `artifacts/task-9/desktop-catalog-hover.png`.
- `artifacts/task-9/desktop-product-detail.png`.
- `artifacts/task-9/desktop-cart-line-item.png`.
- `artifacts/task-9/desktop-builder-selector.png`.
- `artifacts/task-9/desktop-builder-preview.png`.
- `artifacts/task-9/desktop-reduced-motion.png`.
- `artifacts/task-9/mobile-home-hero.png`.
- `artifacts/task-9/mobile-catalog-grid.png`.
- `artifacts/task-9/mobile-product-detail.png`.
- `artifacts/task-9/mobile-cart-line-item.png`.
- `artifacts/task-9/mobile-builder-selector.png`.
- `artifacts/task-9/mobile-builder-preview.png`.

Todas las capturas requeridas se inspeccionaron a detalle original. No se observó overflow horizontal móvil, pérdida de silueta, halo, sombra CSS del producto, fondo propio, packaging, props extra ni exposición de un rectángulo transparente durante hover.

## Warnings y límites explícitos

- Vite avisa que `vitest.config.ts` usa ESM en un archivo cargado como CommonJS de cara a un futuro `configLoader: native`; no afecta la suite actual.
- Next advierte sobre múltiples lockfiles y la inferencia de root entre el repositorio principal y el worktree; build/start terminan correctamente.
- Los warnings WebGL de precisión/deprecación no son errores de consola ni overlays.
- Esta verificación confirma trazabilidad técnica, source pages y créditos registrados; no constituye autorización legal independiente de derechos de imagen, marca o redistribución.
- La reproducción EBUSY dejó 13 carpetas diagnósticas: once `sky-import-lock-repro-*` y dos `sky-import-media-validation-*` bajo `C:\Users\Bryan\AppData\Local\Temp`. Se verificó que son directorios normales creados por esta tarea, pero la política del entorno rechazó la orden de borrado antes de ejecutar `Remove-Item`. Permanecen fuera del worktree y no están versionados.
- Las sesiones de browser se cerraron. El servidor se detuvo. Verificación final: `NO_LISTENERS_3100_3200` y `NO_WORKTREE_SERVER_PROCESSES`.
- No se hizo push ni merge.
