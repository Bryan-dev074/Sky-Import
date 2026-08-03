# Task 8 — productos sin fondos decorativos

Fecha: 2026-08-03
Branch: `codex/premium-store-3d`
Base inicial: `6535e123bacf0925660799862c46e47c18ed077f`
Commit funcional: `08209d7` (`refactor: present products without decorative backdrops`)

## Resultado

La fotografía de producto ya no crea un fondo propio: se eliminó el nodo `u-product-media__aura`, todas sus reglas, los dos `drop-shadow` y la transición de `filter`. La imagen declara explícitamente `filter: none`; no se tocaron la placa, la luz del panel hero, la iluminación de página ni el Tilt del contenedor.

El héroe usa `fullResolution` de forma explícita y exclusiva. La fuente RTX 5090 es WebP 2048 × 2048, 1.085.078 B, y el navegador expone `naturalWidth=2048` tanto en Desktop Chrome como Pixel 7. El contenedor conserva su relación de aspecto, por lo que no introduce layout shift. Catálogo, carrito, checkout, producto y armador conservan la optimización responsive de Next.

## Movimiento exacto

- Estado base: `translate3d(0, 0, 0) scale(1)`.
- Sólo dentro de `@media (hover: hover) and (pointer: fine)`, el hover usa `translate3d(calc(--product-x * 16px), calc(--product-y * 10px), 18px) scale(1.055)`.
- La única transición del asset es `transform 220ms var(--ease-rail)`; la curva de casa es `cubic-bezier(0.22, 0.61, 0.36, 1)`. No se anima `filter` ni ninguna propiedad de layout.
- `useTilt` conserva perspectiva, rotación, escala y glare del panel. Para el producto consulta una sola vez `.u-product-media__asset` y escribe `--product-x/y` en esa imagen, no en el padre. Los eventos táctiles no escriben posición; no hay estado React ni render por frame.
- `prefers-reduced-motion: reduce` desactiva traslación y escala del producto y retira `will-change`; el hook Tilt ya se omite bajo esa preferencia.
- `focus-within` ya no fuerza escala ni desplazamiento. El enlace de producto conserva foco y outline normales.

## TDD — RED

1. Se añadieron primero aserciones de carga, resolución, ausencia global del aura, `filter: none`, transición transform-only menor a 300 ms, escala de hover, traslación por puntero, estabilidad táctil, reduced-motion y foco.
2. `npm run e2e -- experiencia --grep "producto de portada"` falló en las cuatro combinaciones iniciales.
3. La ejecución mínima `npx playwright test experiencia --grep "es transparente" --project=escritorio --workers=1` falló específicamente con **16** nodos `.u-product-media__aura`; esperado: 0.
4. Al adelantar la aserción de resolución, el baseline entregaba `naturalWidth=742`; esperado: al menos 1600.
5. Se probó conservar `srcset` con un candidato de 2048 px: escritorio cumplió, pero Pixel 7 expuso `naturalWidth=1092` por corrección de densidad. Se rechazó y se dejó el opt-in full-resolution sólo en el héroe.

## GREEN y verificación

- `npm test -- tests/unit/catalog-media.test.ts`: **5/5**.
- `npm run e2e -- experiencia --grep "producto de portada"`: **4/4** en desktop/móvil, movimiento normal/reducido.
- `npm run e2e -- experiencia --grep "producto"`: **6/6**, incluyendo foco de teclado sin movimiento.
- `npm test`: **101/101**, 14 archivos.
- `npm run lint`: **OK**.
- `npm run build`: **OK**, 100 páginas estáticas generadas.
- `git diff --check`: **OK**.
- Ausencia enfocada por `rg`: `NO_FORBIDDEN_PRODUCT_EFFECTS` para aura, drop-shadow y transición de filtro en ProductImage/CSS/motion.
- Suite completa `npm run e2e -- experiencia`: **44 pass, 1 skip, 1 fallo preexistente/flaky** en el reloj fijo de la intro móvil (`deja de capturar el puntero...`). La repetición aislada exacta pasó **1/1**. Las seis pruebas nuevas de producto pasaron dentro de la suite completa.
- `npm run typecheck`: conserva exactamente los cinco TS7016 ya documentados en `progress.md`, todos en imports de helpers `.mjs` de tests (`product-credits`, `product-cutout`, `product-cutout-policy`, `product-media-validation`). Task 8 no agrega diagnósticos.

## Inspección visual

Se revisaron capturas de producción del fold y página completa de home y catálogo en Desktop Chrome y Pixel 7. El héroe y las primeras tarjetas muestran recortes transparentes limpios, sin aura ni sombra CSS; se conservan grid, placa, cotas y luces del panel. No se observó salto de layout, recorte de la RTX 5090 ni falso hover táctil. Las capturas diagnósticas quedan ignoradas bajo `test-results/task8-*` y no se committean.

## Revisión de animación (`review-animations`)

| Antes | Después | Motivo |
|---|---|---|
| `540ms`, `filter`, hover no acotado y `focus-within` decorativo | `transform 220ms var(--ease-rail)` sólo en fine hover | Respuesta sub-300 ms, GPU-only, sin movimiento de teclado ni falso hover táctil |
| Variables `--product-x/y` en el Tilt padre | Variables escritas en `.u-product-media__asset` | Limita el recálculo al elemento que se mueve; no agrega renders |
| Movimiento bajo reduced-motion | `transform: none; will-change: auto` | Elimina posición/escala decorativa para esa preferencia |

**Veredicto: Approve.** No quedan regresiones de sensación, animaciones que deban eliminarse, propiedades no GPU, recálculo desde el padre ni incumplimientos de accesibilidad en el movimiento modificado.

## Límites

- La resolución mínima contractual obliga al héroe a transferir su WebP 2048 px de 1.085.078 B sin `srcset`; es un costo medido, limitado a una imagen LCP prioritaria. El resto del sitio sigue responsive/optimizado.
- No se corrigieron los cinco TS7016 transversales ni la prueba flaky de intro móvil porque pertenecen a Task 9/infraestructura, no a la limpieza visual de Task 8.
- No se hizo push ni merge.
