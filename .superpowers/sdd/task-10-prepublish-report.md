# Task 10 — correcciones finales antes de publicar

Fecha: 2026-08-04
Worktree: `D:\CODE\SkyImport\.worktrees\premium-store-3d`
Branch: `codex/premium-store-3d`
Base de revisión: `1bce77b..bc90dcd`

## Resultado

Se corrigieron las cuatro divergencias de catálogo/tipos y el whitespace indicado, sin modificar los 38 `primary.webp` ni las carpetas TEMP. La ficha y compatibilidad de RTX 5080 ahora corresponden a la Founders Edition, la Corsair corresponde al SKU `CMK32GX5M2B6000C36` CL36, y el runtime consume la procedencia de los 38 productos desde el manifest aprobado.

## TDD: RED → GREEN

1. Se preservaron las tres pruebas RED existentes. Antes de producción se corrigió solamente la forma de lectura del manifest en `catalog-media.test.ts`: `manifest.json` es un array, no `{ products: [] }`.
2. RED focal confirmado:
   - `npm test -- tests/unit/catalog-media.test.ts tests/unit/compat.test.ts`: 7 fallos reales (RTX, Corsair y paridad), 28 pruebas restantes correctas.
   - `npm run typecheck`: 9 errores de contrato por tipos exportados/unión inexistentes.
3. GREEN focal:
   - catálogo y compatibilidad: 35/35;
   - `npm run typecheck`: exit 0.

## Implementación y fuentes

- `src/lib/catalog/products.ts`: RTX 5080 `Founders Edition`, 304 mm, `2` slots, copy ES/PT y compatibilidad exacta. Fuente primaria declarada: [NVIDIA RTX 5080](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/).
- `src/lib/catalog/products.ts`: Corsair `CMK32GX5M2B6000C36`, CL36, SKU y timings `36-38-38-76` en copy/ficha/compatibilidad. Fuente primaria declarada: [Corsair Vengeance CMK32GX5M2B6000C36](https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mhz-c36-memory-kit-black-cmk32gx5m2b6000c36).
- `src/lib/catalog/media.ts`: `MANIFEST_SOURCE_BY_SLUG` reemplaza la antigua constante que implicaba procedencia oficial. El runtime deriva `sourcePage` y `credit` de `public/products/manifest.json`; la prueba compara exactamente los 38 slugs.
- `scripts/lib/product-cutout-recipes.d.mts`: `ProductCutoutRecipe` es una unión discriminada; `StoredProductCutoutRecipe` exige procedencia y prohíbe `policy`; `ExecutableProductCutoutRecipe` exige `policy`; los campos de operación ajenos están prohibidos. El lookup admite slug desconocido como `undefined` y el CLI existente continúa rechazándolo antes de escribir.
- `docs/superpowers/specs/2026-08-03-transparent-product-images-design.md`: retirada la whitespace final de la línea 3.

## Verificación completa

| Comando o recorrido | Resultado |
| --- | --- |
| `npm run media:validate` | 38 productos con WebP local, fuente y crédito OK |
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | 14 archivos, 113/113 pruebas OK |
| `npm run build` | exit 0, compilación/TypeScript/rutas OK |
| `npm run e2e` fresco | exit 0, 73 pasadas, 1 omitida (cursor sólo de puntero en móvil), 4.7 min |
| Navegador manual Playwright, escritorio y Pixel 7 | RTX 5080 FE/304 mm, Corsair CL36, armador y consola/pageerror sin errores |

La ejecución E2E inicial combinada no es la evidencia final: falló con 47 pasadas y 26 `ERR_CONNECTION_REFUSED` después de reutilizar un servidor `next` huérfano. La configuración permite eso con `reuseExistingServer: !CI`; los logs de esa corrida no tenían bloque `[WebServer]`. Tras verificar `PORT_3100_FREE`, la corrida final arrancó su propio WebServer (PID 5660 en su log) y completó las 74 pruebas. Al finalizar, el puerto 3100 quedó libre. La comprobación manual usó el servidor propio temporal del puerto 3101 y se cerró tras validar su PID; el puerto también quedó libre.

Durante las pruebas aparecen avisos preexistentes/no bloqueantes: Vite avisa sobre carga nativa de `vitest.config.ts`, Next detecta dos lockfiles al inferir su raíz, y Next escribe `Internal: NoFallbackError` al servir la ruta 404 que el E2E espera y aprueba. Ninguno produjo fallo en la matriz final.

## Integridad final

- No se cambiaron imágenes de producto ni se borraron TEMP.
- `git diff --check` del worktree queda limpio antes del commit; tras el commit se verificó `git diff --check 1bce77b..HEAD` limpio.
- No se hizo push ni deploy.

## Addendum de revisión — 2026-08-04

Se atendieron los dos hallazgos Important posteriores a `3f8f832`.

### Copy Corsair: RED → GREEN

1. Se amplió `tests/unit/catalog-media.test.ts` para exigir `Intel XMP 3.0` en ES/PT y rechazar cualquier `EXPO` serializado.
2. RED: `npm test -- tests/unit/catalog-media.test.ts` falló 1/9 porque el copy decía `Perfil EXPO/XMP`.
3. GREEN: se cambió únicamente el copy ES/PT del SKU `CMK32GX5M2B6000C36` a `Perfil Intel XMP 3.0`; la prueba focal pasó 9/9.

### Optional exacto de recetas: RED → GREEN

1. Se añadieron contratos que rechazan `policy: undefined` en una receta almacenada, `matte: undefined` en `native-alpha` y `tone: undefined` en `white-flood-matte`.
2. RED: sin optional exacto, `npm run typecheck` emitió 3 errores de `Expect<false>` porque los opcionales con `never` aún aceptaban `undefined`.
3. Impacto investigado primero con `npx tsc --noEmit --exactOptionalPropertyTypes`: 11 errores, limitados a seis call sites de UI que pasaban props opcionales como `undefined`; no afectó recetas, rutas, datos ni APIs públicas.
4. GREEN: se activó `exactOptionalPropertyTypes: true` y los call sites omiten las props inexistentes; los toasts construyen la propiedad `action` sólo cuando existe. `npm run typecheck` pasó sin casts, `any` ni ignores.

### Verificación del addendum

| Comando | Resultado |
| --- | --- |
| `npm test -- tests/unit/catalog-media.test.ts` | 9/9 OK |
| `npm run media:validate` | 38 productos OK |
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | 14 archivos, 113/113 pruebas OK |
| `npm run build` | exit 0 |

No se repitió E2E por este addendum: los cambios son copy/contrato TypeScript y no existe una prueba E2E focal de la ficha Corsair; la suite existente cubre la selección Vengeance en el armador. No hubo push ni deploy.
