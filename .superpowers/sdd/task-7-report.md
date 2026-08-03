# Task 7 — recortes de refrigeración, gabinetes y ventiladores

Fecha: 2026-08-03
Branch: `codex/premium-store-3d`
Base inicial revisada: `66f9647`; corrección de revisión sobre `94141d9`

## Resultado

Los siete medios del alcance representan el producto real y el contenido comprado: dos coolers completos, un AIO 360 completo, tres gabinetes vacíos y exactamente cinco ventiladores P12. No hay cajas, tarjetas de premios, accesorios, PC instalada ni sombras ambientales. Los siete `primary.webp` son lossless de 1600 × 1600, conservan alfa real, dejan 8% de margen seguro y tienen las cuatro esquinas transparentes.

No se usó ImageGen. Se prefirieron archivos directos de los fabricantes, inspeccionados a detalle original. Fuente y salida quedan fijadas por SHA-256; `media:sync` valida representación, hash y formato, y `media:rebuild` solo publica el hash aprobado por la receta versionada.

## Unidad comercial y procedencia

| Slug | Unidad exacta preservada | Archivo original | Original | SHA-256 original |
|---|---|---|---:|---|
| `noctua-nh-d15` | NH-D15 completo: doble torre, dos NF-A15 y heatpipes; sin kit ni caja | [Noctua](https://cdn.noctua.at/media/nh_d15_1.jpg) | JPEG 3018 × 2814, 3038626 B | `0293ACA1B0CBA40E204D8CB34EEF1D80F17423B4C098E34CBD80004C0A795068` |
| `thermalright-peerless-assassin-120-se` | Peerless Assassin 120 SE negro completo: doble torre y dos ventiladores | [Thermalright](https://www.thermalright.com/wp-content/uploads/2021/10/PA120-SE-%E4%B8%BB%E5%9B%BE-3.jpg) | JPEG 800 × 800, 215162 B | `B1084B27D34F736D8CB4443E77852355D8D58C43AA46F7F161FFA2B6DB53B411` |
| `arctic-liquid-freezer-iii-360` | Liquid Freezer III 360 negro: radiador, tres P12 instalados, tubos y pump/block | [ARCTIC](https://www.arctic.de/media/e0/ab/b6/1707469622/Liquid_Freezer_III_360_Black_G02_2.jpg) | JPEG 2000 × 2000, 393018 B | `BD98DF5C938824AD3492C168C30C8417ACD7EF32B65A9D04D1B19D382DF70ACE` |
| `lian-li-lancool-216` | LANCOOL 216 negro RGB vacío; dos ventiladores frontales de 160 mm y uno trasero de 140 mm intactos | [Lian Li](https://lian-li.com/wp-content/uploads/2022/11/216_1031-035.png) | PNG 790 × 790, 749956 B | `1124E866B9C697AC22DD6342DCD68860760AA9EE7498E8F68D4A5BC796455D59` |
| `nzxt-h5-flow` | H5 Flow 2022 negro `CC-H51FB-01`, vacío; sin GPU, motherboard, AIO ni cableado | [NZXT](https://nzxt.com/cdn/shop/files/h5-flow-left-side-empty-black_b05c6087-ed77-4dd8-b227-d6ecef3dff6a.png?v=1744863006) | PNG 2000 × 2000, 2343913 B | `29B9151B2717A5C5B1D25797948400F315BB14BFFE2A0E2221C4BC249E8C4B5C` |
| `cooler-master-nr200p` | MasterBox NR200P negro cerrado, vista oficial 3/4 frontal/superior | [Cooler Master](https://www.coolermaster.com/on/demandware.static/-/Sites-cooler-master-main/default/dwb92ce232/Assets/masterbox-nr200p/large/nr200p-gallery-10.png) | PNG 3648 × 3648, 3175601 B | `1B64481C0A7CF7F3E8645FD73C0C64A3CC65E74299EFD33A652DFFFD63F8335A` |
| `arctic-p12-pwm-pst-5-pack` | Cinco copias del P12 PWM PST negro oficial; la [página ACFAN00137A](https://www.arctic.de/P12-PWM-PST/ACFAN00137A) acredita el pack de cinco | [ARCTIC](https://www.arctic.de/media/51/49/e8/1583760048/P12_PWM_PST_Black_01.jpg) | JPEG 1200 × 1200, 292044 B | `4349D68E69267CA9E446D826E8923BE8B7AE5EA42E493A7D77AFA4C6E5D08EE8` |

`public/products/manifest.json`, el runtime de catálogo y `public/products/SOURCES.md` coinciden. El H5 apunta explícitamente a H5 Flow 2022, cuyas medidas y modelo de catálogo no corresponden al H5 actual.

## Receta determinista

- Noctua, Thermalright, Liquid Freezer y P12 usan matte blanco por flood-fill, feather de 3 px y despill. La extensión de Task 7 elimina también componentes blancos encerrados de al menos 48 px, como los huecos entre aspas.
- Regiones circulares versionadas protegen únicamente los hubs/logos blancos reales de Thermalright y ARCTIC. La prueba de regresión demuestra que un hueco blanco encerrado desaparece mientras una marca blanca protegida conserva RGB y alfa.
- Los WebP de Task 7 usan `exact: true`; los siete decodifican con RGB `0/0/0` en todo píxel de alfa 0. Esto elimina los bloques de RGB oculto que algunos inspectores mostraban aun cuando su alfa ya era cero.
- La revisión posterior detectó halo de matte blanco en tres productos negros: 4819 píxeles en Thermalright, 6373 en Liquid Freezer y 11335 en P12, medidos como borde adyacente a alfa 0 con luma `>= 180` y chroma `<= 24`. Una etapa post-normalización RGB-only propaga color desde vecinos interiores oscuros neutrales en una banda máxima de 8 px; la métrica final es `0 / 0 / 0`. No contrae, expande ni reestima alfa.
- El LANCOOL conserva alfa nativo y elimina solo el halo/sombra difusa: núcleo `alpha >= 160` más 2 px adyacentes para antialias. El contenido opaco previo queda en 558 × 702 px.
- H5 Flow y NR200P reciben una curva gamma RGB-only de 1.45 y 1.70. La prueba comprueba que alfa no cambia; no hay recorte geométrico, expansión, contenido nuevo ni alteración de puertos o mesh.
- El P12 se extrae una vez y se compone cinco veces en una grilla 3 + 2 de 1440 × 960, con piezas de 440 px. Los huecos entre aspas son transparentes y el logo ARCTIC queda íntegro.
- Solo dos fuentes requieren ampliación: Peerless Assassin solicita 1.782493× y limita 1.79×; LANCOOL solicita 1.914530× y limita 1.93×. Los otros cinco conservan la política predeterminada sin ampliación.

## Métricas finales

| Producto | Contenido opaco | Márgenes L/R/T/B | Tamaño | SHA-256 final |
|---|---:|---:|---:|---|
| Noctua NH-D15 | 1344 × 1272 | 128 / 128 / 164 / 164 | 1289842 B | `697AB656BA897989A6421EB2F74AD2FAAA2E3CD6450CE9A0270A18E0692D8D12` |
| Peerless Assassin 120 SE | 1068 × 1344 | 266 / 266 / 128 / 128 | 660830 B | `5D3D11C89BCAEED40283F47458005B7DC768DEA3FF04AF709F9744E1EC02EE89` |
| Liquid Freezer III 360 | 873 × 1344 | 363 / 364 / 128 / 128 | 341154 B | `D4E5F6F04C7E71AA80CA84E2BEAE5BABB2531A42EF3F22D59FE96365ACA1D9C5` |
| LANCOOL 216 | 1068 × 1344 | 266 / 266 / 128 / 128 | 1150448 B | `9982250E12462F7E1CC73D78FC36E696822BEECF73BB75385A2E0812A8148B79` |
| NZXT H5 Flow 2022 | 1297 × 1344 | 151 / 152 / 128 / 128 | 1053736 B | `611DB7F2A63DA2DE4A38D69195898B2AFAC6B2B720E4901BE19D1D8D4F47FC78` |
| Cooler Master NR200P | 687 × 1344 | 456 / 457 / 128 / 128 | 1096088 B | `6F2A28A818C0E3C53DB96DF9F3504976AA7563822FF553E130A1CE29DD9CA85C` |
| ARCTIC P12 PWM PST 5-pack | 1344 × 883 | 128 / 128 / 358 / 359 | 542530 B | `926E5C2872E7A2EBA3175FE745E3F35EDD08D1A33003479851C35E6B156AD0C1` |

Las cuatro esquinas tienen alfa 0 y no existe RGB oculto bajo alfa 0 en ninguno. Frente a `66f9647`, cambiaron exactamente estos siete primarios; los otros 31 medios aprobados permanecen byte-identical. Frente al commit revisado `94141d9`, la corrección cambia únicamente Thermalright, Liquid Freezer y P12; los otros 35 primarios permanecen byte-identical.

Las máscaras alfa antes/después de la corrección son byte-identical en los 2560000 píxeles de cada canvas. Sus SHA-256 son `F094D0ADDD2B4C8EC1AE207CE9C32B70E04E9C751A707032674DE7EE69054A62`, `50F9FDC08043970629CC3C4E3FAC5279ACA83911981FE242A1DF9853459465DD` y `202154BA300830C016CC6C3C3C027ADF86CF92666A1FC4CAA1D06C22B97F1F92`. También permanecen idénticos los bounds, los conteos de píxeles con alfa y los conteos de alfa parcial.

## Verificación visual

- Se inspeccionaron los siete originales con detalle original y los siete outputs directos, además de mattes claros y oscuros.
- Noctua y Thermalright conservan aspas, aletas, clips, heatpipes y ambos ventiladores sin rayas de fondo.
- Liquid Freezer conserva tres ventiladores, logos, radiador, tubos y pump/block; no hay badge ni tarjeta.
- LANCOOL conserva mesh, RGB y los tres ventiladores incluidos; no queda sombra de piso.
- H5 es la vista oficial negra exacta que prueba interior vacío. Se rechazó el hero 3/4 porque contiene GPU, AIO, motherboard y cableado.
- NR200P usa la vista oficial cerrada 3/4; se rechazó la vista lateral plana y las vistas abiertas sin panel.
- P12 muestra exactamente cinco ventiladores idénticos, con aperturas transparentes y logo real preservado; sin packaging, badge ni iluminación inventada.
- Para la corrección se volvieron a inspeccionar los tres originales a detalle original, los tres outputs directos y comparaciones before/after en matte negro y claro. Se descartó un prototipo que propagaba tintes de compresión; la receta final usa exclusivamente semillas oscuras neutrales. No se observan halos blancos, tintes nuevos ni pérdida de blades, frames, aletas, tubos, cables, logos o aperturas.

Lámina final: `artifacts/product-cutouts-cooling.webp`, 1600 × 2480, 282558 B, SHA-256 `B8C16F26D8EDB9B7CF242F7CA1F21C938A4429A2ED40B1032643ED5616269F0E`. Comparaciones de auditoría de la corrección: `artifacts/task7-halo-fix-trial/comparison-dark.png` y `comparison-light.png`.

## Pruebas y límites

- TDD inicial RED: faltaban lista/recetas Task 7, poda de sombra, composición 5-up y límites de ampliación; 4 fallos esperados. GREEN: 18/18.
- TDD de procedencia RED: manifest sin pins y H5 apuntando a la generación actual; corregido.
- Regresión visual RED: hueco blanco encerrado quedó con alfa 255; RGB oculto detectó 327659 píxeles en Noctua. GREEN: huecos transparentes, logo protegido y `hiddenRGB=0` en los siete.
- Revisión de halo RED sobre assets reales: **4819 / 6373 / 11335** píxeles neutrales brillantes. GREEN: **0 / 0 / 0**. La regresión adicional fija las tres máscaras alfa históricas y demuestra que la propagación sintética modifica RGB sin cambiar un solo valor alfa.
- Suite enfocada de fuente, receta, recorte, crédito, catálogo y validación: **40/40**.
- Suite global: **101/101**.
- `npm run media:validate`: **OK, 38/38 productos**.
- `npm run lint`: **OK**.
- `npm run build`: **OK**, 100 páginas estáticas generadas.
- `git diff --check`: **OK**.
- `npm run typecheck`: conserva cinco TS7016 preexistentes sobre `product-credits.mjs`, `product-cutout.mjs`, `product-cutout-policy.mjs` y `product-media-validation.mjs`; Task 7 no agrega diagnósticos.

## Riesgos residuales explícitos

- Los SHA-256 y créditos demuestran identidad y reproducibilidad, no conceden por sí solos derechos de redistribución comercial. La licencia/autorización de los assets oficiales debe verificarse por separado.
- La fuente P12 es la fotografía oficial de una unidad del mismo modelo PWM PST; la cantidad comercial de cinco la acredita la página exacta ACFAN00137A y la receta compone cinco copias idénticas.
- No se hizo push ni merge.
