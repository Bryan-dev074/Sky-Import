# Decisiones técnicas

Qué se evaluó, qué entró, qué se descartó y por qué. Cada entrada dice también
qué habría que reconsiderar si el contexto cambia.

---

## 1 · Recursos evaluados antes de escribir código

### Impeccable — <https://impeccable.style>

**Qué ofrece.** Vocabulario de diseño para agentes: 23 comandos con nombre, 58
comprobaciones de «slop» y un flujo que lee `PRODUCT.md` y escribe `DESIGN.md`.
Creado por Paul Bakaus; gratuito, distribuido como plugin/skill.

**Decisión: usado como skill principal de criterio visual. No requirió
instalación: ya estaba disponible en el entorno** (`~/.claude/skills/impeccable`).

**Por qué.** El brief pedía «una sola skill principal de criterio visual». De las
tres candidatas es la que impone un procedimiento y no solo un estilo: obliga a
escribir la verdad de producto antes que el layout, a comprometerse con un
contrato de dirección (TESIS / MUNDO / HISTORIA / PRIMER VIEWPORT / FORMA) y a
auditar el resultado contra ese contrato. Ese procedimiento es el que produjo la
alternancia carbón/aluminio y el racionamiento del acento, que son las dos
decisiones que más sostienen la identidad.

El contrato de dirección resultante está en el encabezado de
`src/app/[locale]/layout.tsx` y desarrollado en `DESIGN.md`.

### Emil Kowalski — <https://emilkowal.ski/skill>

**Qué ofrece.** Colección de skills de animación (crítica, auditoría, detección
de oportunidades, principios de movimiento de Apple). Se instala con
`npx skills add emilkowalski/skill`.

**Decisión: NO se instaló. Se aplicaron sus principios de forma directa.**

**Por qué.** La página no publica reglas concretas —remite a animations.dev para
formar criterio—, así que instalarla habría añadido un segundo cuerpo de
instrucciones sobre movimiento junto al de Impeccable, con riesgo de
contradicción. El brief pedía explícitamente evitar instrucciones duplicadas.
Lo que sí se adoptó, y está escrito en `DESIGN.md` §10 como regla del proyecto:
dos curvas con nombre y ninguna animación fuera de ellas, nada de rebote, solo
`transform` y `opacity` por cuadro, escalonado con tope y `prefers-reduced-motion`
que **apaga** en vez de acortar.

**Cuándo reconsiderarlo.** Si el proyecto creciera a un equipo, tener la skill
instalada daría un lenguaje común para revisar animaciones en pull requests.

### Taste Skill — <https://www.tasteskill.dev>

**Qué ofrece.** SKILL.md con variantes de estilo (brutalista, minimalista, suave),
lista de comprobación previa al envío y generación de imagen a código.

**Decisión: NO se instaló.**

**Por qué.** Funciona eligiendo entre lanes estéticos preconfigurados. Este brief
ya fijaba el mundo visual (grafito, carbón, metálicos, cian controlado,
tipografía técnica, composición editorial asimétrica), así que una segunda
autoridad de estilo solo podía competir con el brief o con Impeccable. Se
descartó por la misma razón que la anterior: una sola voz sobre criterio visual.

### React Bits — <https://reactbits.dev>

**Qué ofrece.** Más de 140 componentes animados que se copian al proyecto con
`npx shadcn@latest add @react-bits/<Nombre>`. Licencia **MIT + Commons Clause**.

**Decisión: NO se copió ningún componente. Se usó como referencia de dos ideas,
reimplementadas desde cero en el sistema de la casa.**

**Por qué, en dos frentes:**

- **Licencia.** La Commons Clause prohíbe «vender, sublicenciar o redistribuir
  los componentes en sí, ni solos, ni en un paquete, ni como versión portada».
  Este repositorio es público; copiar sus componentes dentro habría sido, como
  mínimo, un área gris que no vale la pena en una pieza de portafolio.
- **Coherencia.** Sus componentes traen su propia estética (glow, gradientes,
  bordes que brillan) — exactamente lo que este brief prohíbe. Adaptarlos habría
  costado más que escribirlos.

**Qué se tomó como inspiración, dicho con precisión:**

| Idea de React Bits | Cómo aparece acá |
|---|---|
| Fondos de retícula / campo de puntos | `.u-plate`: dos `linear-gradient` de 32 px al 5,5 % de opacidad. Cuatro líneas de CSS, cero JavaScript. |
| Cursor personalizado con estados | `src/components/cursor/Cursor.tsx`: punto + retículo **cuadrado** con retardo, estados declarados con `data-cursor` en el marcado. |

Ambas piezas son código propio y siguen los tokens y las curvas de `DESIGN.md`.

### Uiverse — <https://uiverse.io>

**Decisión: NO se usó.** La página respondió `403` a la consulta automatizada y
no se pudo verificar de primera mano el estado actual de sus condiciones de uso
por elemento. **No se inventa lo que no se pudo comprobar**: en lugar de asumir
una licencia, se descartó la fuente. Tampoco hacía falta: los controles de esta
tienda (botones rectangulares de 3 px de radio, campos hundidos con filete,
chips, casillas dibujadas) son deliberadamente austeros y son el sistema, no
adornos intercambiables.

### GSAP — <https://gsap.com>

**Qué ofrece.** v3.15.0. Desde el respaldo de Webflow es **gratuito por completo,
incluidos los plugins que antes eran de Club GSAP** (SplitText, MorphSVG,
ScrollTrigger). Licencia estándar «sin cargo».

**Decisión: se instaló, se evaluó contra el trabajo real y se DESINSTALÓ.**

**Por qué.** Se buscó honestamente el sitio donde aportara una diferencia
perceptible, y no apareció:

- **La intro** es una línea temporal fija de cuatro compases. Con `@keyframes` y
  `animation-delay` se expresa exacta, y —esto es lo decisivo— **sigue
  funcionando si el JavaScript falla**. Con GSAP, el marcado del servidor
  quedaría en pantalla tapando la tienda si la hidratación no llegara a
  ejecutarse. La cortina de este proyecto sube por CSS pase lo que pase, y el
  script solo la adelanta y desmonta el nodo.
- **La pieza WebGL** necesita leer su avance del rectángulo **dentro del mismo
  `requestAnimationFrame` que ya está renderizando**. ScrollTrigger haría por
  fuera lo que ese bucle hace por dentro, con un observador más y sin control
  sobre el orden.
- **Todo lo demás** son transiciones de estado: hover, foco, entradas de sección,
  apertura de paneles. CSS las resuelve mejor y sin coste de JavaScript.

Añadir ~24 KB comprimidos a la ruta crítica para no usarlos habría sido
exactamente la «dependencia pesada que no aporta valor» que el brief prohíbe.

**Cuándo reconsiderarlo.** Si apareciera una animación con línea temporal
compleja e interrumpible (un recorrido guiado del configurador, un scrollytelling
de varias secciones sincronizadas), GSAP sería la respuesta correcta y su licencia
ya no es un obstáculo.

### img2threejs — <https://github.com/img2threejs/img2threejs>

**Qué ofrece.** Skill en Python (Apache 2.0, ~8,7k estrellas) que reconstruye el
objeto de **una fotografía de referencia** como modelo three.js procedural: TypeScript
diffeable en vez de mallas binarias, jerarquía lista para animar, control de
calidad antes de generar el código.

**Decisión: NO se instaló. Se adoptó su enfoque y se escribió el modelo a mano.**

**Por qué.** Su entrada obligatoria es una fotografía del objeto, y este proyecto
**no tiene fotografía de producto con derechos** — es justamente la restricción
que originó todo el sistema de renders vectoriales autorales. Alimentarlo con la
foto de una placa de video ajena habría metido por la puerta de atrás el problema
de marcas y derechos que el resto del proyecto evita con cuidado.

Lo que sí se adoptó es su tesis, que es la parte valiosa: **un modelo 3D que es
código legible y no un archivo binario**. `src/components/three/GpuAssembly.tsx`
construye PCB, backplate, peine de aletas instanciado, caños de calor, carcasa,
tres ventiladores y soporte con primitivas colocadas por geometría. Sin mallas
importadas, sin texturas, sin un solo byte binario, y con control exacto del
número de polígonos —que es lo que decide si funciona en un teléfono.

**Cuándo reconsiderarlo.** Si en el futuro hubiera fotografía propia de las
piezas, con derechos, la herramienta produciría variantes por producto mucho más
rápido de lo que se pueden dibujar a mano.

---

## 2 · Decisiones de arquitectura

### El idioma va en la ruta, no en una cookie

`/es` y `/pt` son segmentos reales. La alternativa —cookie leída en el servidor—
habría vuelto dinámica toda la aplicación.

Con el idioma en la ruta: las **96 páginas se generan estáticamente**, `<html lang>`
es siempre correcto, la URL se puede compartir y no hay parpadeo de traducción.
`src/proxy.ts` solo decide a cuál entra quien llega sin prefijo, mirando la cookie
de la última elección y, si no hay, la cabecera `Accept-Language`.

### La moneda se imprime tres veces y se muestra una

El precio de cada pieza se renderiza en el servidor en **las tres monedas**, y
`html[data-currency]` decide desde CSS cuál queda visible. Un script previo al
primer pintado fija el atributo desde `localStorage` (o desde el idioma: quien
lee en portugués razona en reales).

Se evaluó la alternativa obvia —convertir en el cliente— y se descartó: obliga a
un segundo render, produce parpadeo en el primer pintado y arriesga desajuste de
hidratación. Imprimir tres cadenas cortas cuesta bytes despreciables y elimina
las tres cosas de golpe.

Como corolario, **el dinero se formatea a mano**, sin `Intl`: dos entornos con
versiones distintas de ICU producen cadenas distintas y eso rompe la hidratación.
Hay una regla de ESLint que impide reintroducir `Intl` por descuido.

### El 404 es `global-not-found`, no `not-found`

Al vivir el layout raíz bajo un segmento dinámico (`app/[locale]/layout.tsx`),
Next.js no resuelve un `not-found.tsx` de segmento — se comprobó en desarrollo y
en producción, y respondía la pantalla por defecto del marco. La documentación de
Next señala exactamente este caso como el motivo de existir de
`global-not-found.tsx`, así que se habilitó (`experimental.globalNotFound`) y se
escribió un documento completo con las tipografías y el encabezado de la casa.
El idioma llega por una cabecera que escribe el proxy.

En consecuencia, `producto/[slug]` y `guias/[slug]` declaran
`dynamicParams = false`: un slug que no está en el catálogo no es una ruta, y el
404 global responde igual que para cualquier otra dirección inexistente.

### Los filtros se escriben con la History API, no con `router.replace`

Medido: al entrar en `/catalogo?q=algo` y escribir en el buscador, `router.replace`
hacia la misma ruta estática **se anulaba a sí mismo** — la URL no se movía y el
campo volvía al valor anterior. El buscador quedaba muerto para cualquiera que
llegara con un filtro ya puesto (por ejemplo, desde un enlace compartido).

`window.history.replaceState` está integrado con el enrutador de Next y
`useSearchParams` se sincroniza con él. Además elimina un viaje al servidor por
cada tecla, que en datos móviles no es un detalle.

### El carrito es de cliente, con compuerta de hidratación y saneo

`localStorage` mediante `zustand/persist`. Al rehidratar se **sanea**: una pieza
que ya no está en el catálogo se descarta y una cantidad mayor a las unidades
configuradas se recorta. Antes de que la hidratación termine se muestra un
marcador neutro, nunca un «flash de carrito vacío».

### Quitar del carrito ofrece deshacer en vez de preguntar

Un diálogo de confirmación por cada línea eliminada es fricción para el 95 % de
los casos. Un aviso con «Deshacer» que restituye la línea **en su posición
original** cuesta menos y perdona igual.

---

## 3 · Decisiones de rendimiento, con las mediciones que las provocaron

Todas medidas en compilación de producción, a 1440 × 900, sobre `localhost`.
Los tamaños son de **cuerpo decodificado**, no de transferencia comprimida: sobre
la red real, con `gzip`/`brotli`, el JavaScript ronda un tercio de lo indicado.

| Página | Transferencia antes | Después | LCP | CLS antes | CLS después |
|---|---|---|---|---|---|
| Inicio | 2054 KB | **1715 KB** | 1060 ms | 0 | 0 |
| Catálogo | 1730 KB | **1109 KB** | 104 ms | **0,467** | **0** |
| Producto | 1649 KB | **1378 KB** | 140 ms | 0 | 0 |
| Arma tu PC | 1197 KB | **1108 KB** | 112 ms | 0 | 0 |
| Catálogo (390 px) | — | **1030 KB** | 104 ms | — | 0 |

Tareas largas: **ninguna** en ninguna de las cinco medidas.

**De dónde salió cada ganancia:**

1. **El salto de layout del catálogo (0,467 → 0).** `useSearchParams` obliga a un
   `Suspense` para que la página siga siendo estática, y el respaldo era una
   línea de texto: al llegar la grilla, la página pegaba un salto enorme. Se
   sustituyó por un esqueleto que **reserva la misma geometría** (columna de
   filtros, barra de herramientas y nueve celdas con la proporción de la ficha).
2. **Precarga de rutas repetidas (−450 KB en el catálogo).** Next precarga todo
   `<Link>` visible. Con 37 fichas en pantalla eso eran 37 cargas de ruta que
   casi nadie iba a usar. Las fichas y los nueve enlaces de categoría —que apuntan
   a la **misma** ruta con otro parámetro— llevan `prefetch={false}`. La
   navegación principal sí precarga.
3. **El dibujo duplicado (−170 KB de HTML por página).** Cada ficha renderizaba la
   pieza dos veces: limpia y anotada. Ahora se dibuja **una** y la vista con cotas
   es una capa superpuesta que solo contiene las cotas.
4. **La malla del gabinete.** Eran 182 círculos en el marcado. Pasó a un
   `<pattern>` repetido: mismo dibujo, una fracción de los bytes.
5. **Lo caro se difiere de verdad.** `three` no entra en el paquete inicial: se
   importa cuando la sección está a 480 px de entrar en pantalla, y con
   `prefers-reduced-motion` no se pide nunca. Al desmontar se llama
   `forceContextLoss()` **antes** de `dispose()` — sin eso, el navegador sigue
   contando el contexto WebGL y tras una docena de montajes la pieza deja de
   aparecer.
6. **Tipografías: 60 KB en total.** Dos familias variables, subconjunto `latin`,
   servidas desde el propio dominio con `next/font`. El subconjunto `latin` cubre
   el español y el portugués completos.

**Sobre el LCP de 1060 ms en el inicio.** Es la cortina de entrada, y es
deliberado: el elemento mayor se pinta cuando el paño se va. Está muy por debajo
del umbral de 2,5 s, y con `prefers-reduced-motion` la intro no llega a pintarse.

---

## 4 · Decisiones de contenido

- **Los modelos son comerciales reales y sus especificaciones fueron verificadas**
  contra la ficha del fabricante antes de escribirlas (NVIDIA para las RTX 50,
  AMD para la RX 9070 XT, Intel para la Arc B580). Un dato que no se pudo
  verificar no se escribió.
- **Precio, unidades y condiciones comerciales son datos de esta tienda**, no
  información oficial del fabricante, y la interfaz lo dice en la ficha de
  producto y en el catálogo.
- **No se inventó** dirección física, RUC, años de trayectoria, cantidad de
  clientes, distribución oficial, acuerdos con fabricantes, garantías de terceros,
  reseñas ni stock verificado. La sección «Lo que sí podemos afirmar» de la
  portada existe precisamente para no rellenar ese hueco con cifras falsas.
- **Se añadió un gabinete Mini-ITX (Cooler Master NR200P, 330 mm de placa de
  video) porque las pruebas revelaron que el catálogo no tenía ningún gabinete lo
  bastante chico como para que la regla de longitud llegara a dispararse.** Un
  configurador cuyas reglas nunca se activan no demuestra nada.

---

## 5 · Lo que este proyecto NO tiene, a propósito

- **Sin backend, base de datos ni autenticación.** El catálogo funciona
  estáticamente; añadir persistencia habría sido complejidad sin usuario.
- **Sin pasarela de pago simulada con formularios de tarjeta.** Se evaluó y se
  descartó: la forma más creíble de prometer que no se transmiten datos sensibles
  es **no tener ni un campo donde escribirlos**. Hay una prueba end-to-end que
  verifica que no existe ningún `input` de contraseña, ningún `autocomplete="cc-*"`
  y ninguna petición de escritura en todo el recorrido.
- **Sin datos estructurados de producto (JSON-LD).** Presentarían la tienda como
  un comercio operativo con precios y disponibilidad reales ante los buscadores.
  Cuando lo sea, se derivan de los mismos datos del catálogo.
- **Sin biblioteca de iconos.** Los pocos iconos de interfaz están dibujados en el
  mismo peso de trazo y la misma gramática que el resto del sistema.
- **Sin scroll suave por JavaScript.** El `scroll-behavior: smooth` nativo alcanza
  y se apaga solo con movimiento reducido.
