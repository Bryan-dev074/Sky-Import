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

## 3 bis · Accesibilidad medida

`npm run a11y` pasa **axe-core** con las etiquetas `wcag2a`, `wcag2aa`,
`wcag21a` y `wcag21aa` sobre diez rutas, en los dos idiomas y en escritorio y
teléfono: **20 comprobaciones, cero infracciones**.

La primera pasada encontró **19 nodos con contraste insuficiente**, todos por el
mismo motivo: `--text-low` estaba demasiado apagado (3,62:1). Se corrigió la
escala entera con medición real en vez de a ojo:

| Token | Antes | Después | Sobre |
|---|---|---|---|
| `--text-low` (carbón) | 3,62:1 | **5,4:1** | `--carbon` |
| `--text-low` en panel | 4,46:1 | **4,9:1** | `--carbon-lift` |
| `--text-low` (aluminio) | 4,57:1 | **5,1:1** | `--aluminio` |
| `--rust` | 4,34:1 | **5,4:1** | `--carbon` |

Y se corrigió un error de rol: **`--steel` no es un color de texto** (4,41:1). Es
material — filetes, marcos, cotas, trazos de SVG. La etiqueta neutra de
disponibilidad, que lo usaba, pasó a `--text-low`.

El par que decide la escala resultó ser `--text-low` sobre `--carbon-lift`, no
sobre `--carbon`: el panel elevado es más claro que la superficie, así que un
valor que pasa sobre el fondo puede no pasar dentro de un panel. Ese detalle no
se ve leyendo código; salió de la medición.

Lo que axe no puede comprobar está en `experiencia.spec.ts`: trampa de foco en
el carrito con retorno al abridor, `prefers-reduced-motion` apagando la intro, el
enlace de salto como primer destino del tabulador y el cursor propio ausente en
puntero grueso.

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

---

## 6 · Segunda vuelta: movimiento, fondos y renders por producto

El titular pidió una revisión con más movimiento en todo, fondos reactivos al
cursor, intro que se desarme, idioma sin recarga, logo animado y un dibujo por
producto. Además indicó cinco componentes concretos de React Bits para integrar:
`DotField`, `Threads`, `Beams`, `BorderGlow` y `MagicBento`.

### 6.1 · Sobre React Bits, ahora sí

En la primera vuelta se descartó copiar componentes por su **Commons Clause** en
un repositorio público. El titular respondió indicando la integración y
aportando el código fuente. **Esa es su decisión y se ejecutó**, con el criterio
de siempre: adaptados a la paleta y a las reglas del proyecto, y acreditados en
`CREDITS.md`.

| Componente | Cómo entró |
|---|---|
| `DotField` | Reescrito como **campo de vías** (`CircuitField`): canvas 2D, los puntos son pads de placa, se abomban al acercarse el puntero y una onda de energía cruza cada ~9 s. |
| `Threads` | Portado a TypeScript, paleta de la casa, resolución interna acotada y **guardián de cuadros** propio. |
| `Beams` | **Portado a three.js plano.** El original necesita `@react-three/fiber` y `@react-three/drei`; este proyecto ya usa `three` a secas, y traerse dos bibliotecas más —más de 150 KB— para un fondo habría sido la dependencia pesada que el brief prohíbe. |
| `BorderGlow` | Reducido a **un solo color** (el cian de instrumento), radio de 3 px en vez de 28 (la casa no tiene píldoras) y sin el degradado de malla multicolor. Vive en una sola acción por vista. |
| `MagicBento` | Reescrito **sin GSAP** sobre el bucle de animación propio, y **sin las partículas flotantes**: doce partículas por celda con temporizadores encadenados es exactamente el presupuesto de animaciones que `DESIGN.md` prohíbe reventar. El brillo por proximidad y la chispa al pulsar dan la misma vida por una fracción del coste. |

Ninguna de las cinco entró como copia: en todas hubo que decidir qué se
conservaba de la técnica y qué se tiraba por peso, por licencia o por
contradecir el sistema visual.

### 6.2 · Un solo `requestAnimationFrame` para todo

Cursor, imán, inclinación, paralaje, contadores, campo de vías y celdas
comparten **un único bucle** (`src/lib/motion.ts`). La alternativa —un `rAF` por
componente— multiplica el trabajo por elemento en pantalla: con doce fichas
visibles serían doce bucles disputándose el mismo hilo. El bucle además se apaga
solo cuando no queda nadie suscrito o la pestaña se oculta.

### 6.3 · Idioma sin recarga

El idioma sigue **en la ruta** —para que las dos versiones se generen
estáticamente y el primer pintado llegue traducido— pero **cambiarlo ya no
navega**: es estado de cliente que se inicializa con el segmento de la URL. Al
cambiarlo, todo el texto se relee del diccionario (que ya está en el paquete del
cliente), la URL se corrige con `replaceState` y se guarda una cookie para la
próxima visita. El scroll, el carrito y el armado se quedan donde estaban.

La consecuencia de diseño es que **todo componente con texto traducible pasó a
ser de cliente** y lo lee del contexto; ninguno recibe `locale` por prop. Las
páginas siguen siendo de servidor: mantienen la metadata por idioma y la
generación estática de las 96 rutas.

Hay una prueba que lo verifica de la única forma fiable: marca la ventana antes
de cambiar el idioma y comprueba que la marca sigue ahí después.

### 6.4 · La intro se desarma

La cortina pasó de subir en bloque a **doce lamas verticales que se retiran en
secuencia**, alternando arriba y abajo. La tienda empieza a verse por franjas
antes de que termine la salida. Sigue siendo CSS puro: si la hidratación fallara,
las lamas se van igual y el script solo desmonta el nodo.

### 6.5 · El cursor, arreglado

El problema real de la primera versión no era el retardo: era que **solo
reaccionaba a los pocos elementos con `data-cursor` escrito a mano**, así que la
mayor parte de la interfaz no le decía nada y el retículo flotaba sin sentido.
Ahora el estado se **deduce del elemento** (`a`, `button`, `label`, campos) y el
retículo **se acopla al objetivo**: adopta su rectángulo como una mira que
engancha. `data-cursor` queda solo para los casos con vocabulario propio.

### 6.6 · Un dibujo por producto

`variant` entra en la ficha de render y elige entre diseños **genuinamente
distintos** dentro de la familia: tres carcasas de placa de video, tres frentes
de gabinete, disipador de una torre o de dos, SSD con disipador o desnudo, fuente
modular o de cableado fijo. La semilla sigue desplazando los detalles menores.

El sombreado salió a `RenderDefs`: un `<svg>` oculto montado **una sola vez** con
todos los degradados y patrones. Dos ganancias a la vez — la luz cae igual en
todas las piezas (registro unificado) y el peine de aletas pasó de 44 líneas en
el marcado a una referencia a un patrón.

**Sobre fotografía real.** El titular pidió «la foto correspondiente» de cada
producto. No hay fotografía de producto con derechos para este proyecto, y usar
imágenes de prensa de terceros en un repositorio público es exactamente el
problema de marcas que el resto del trabajo evita. Lo que se entregó en su lugar
es lo más cercano defendible: **cada pieza tiene su propio dibujo**, distinto del
de sus vecinas y derivado de su propia ficha. Si en algún momento hay fotografía
propia con derechos, el sistema de renders se reemplaza pieza por pieza sin tocar
nada más.

### 6.7 · Mediciones de la segunda vuelta

Compilación de producción, cuerpos decodificados (sobre la red van comprimidos a
aproximadamente un tercio).

| Página | Antes | Después | LCP | CLS | Tareas largas |
|---|---|---|---|---|---|
| Inicio | 1715 KB | **1205 KB** | 1484 ms | 0 | 0 |
| Catálogo | 1109 KB | **942 KB** | 1180 ms | 0 | 0 |
| Producto | 1378 KB | **997 KB** | 988 ms | 0 | 0 |
| Inicio (390 px) | — | **1193 KB** | 1368 ms | 0 | 0 |

La transferencia **bajó** pese a añadir tres fondos animados, por el dibujo único
por pieza y los degradados compartidos.

**Cuadros por segundo**, midiendo deltas de `requestAnimationFrame`:

| Vista | Mediana | p95 | Cuadros > 33 ms |
|---|---|---|---|
| Portada 1440 px | 16,7 ms | 83,3 ms | 28/150 |
| Portada 390 px | 16,7 ms | 16,7 ms | **0/150** |
| Catálogo | 16,7 ms | 16,7 ms | **0/150** |
| Movimiento reducido | 16,7 ms | 16,8 ms | **0/150** |

Los picos de la portada a 1440 px vienen del sombreador de hilos **bajo
rasterizado por software**: el navegador de las pruebas corre sin GPU y usa
SwiftShader. Se comprobó bloqueando la creación de contextos WebGL — con el resto
del movimiento intacto (campo de vías, cursor, imanes, cinta) la portada da
16,7 ms de mediana y ni un cuadro lento. **No se midió en un equipo con GPU
real**, así que el dato honesto es: todo lo que no es WebGL va a 60 cuadros, y el
fondo de hilos trae su propio guardián que lo degrada si el equipo no lo sostiene.

### 6.8 · Accesibilidad tras el rediseño

`npm run a11y` vuelve a dar **cero infracciones** en las diez rutas, los dos
idiomas y los dos dispositivos. En el camino aparecieron dos defectos reales que
el rediseño introdujo:

- **`aria-prohibited-attr`**: la marca denominativa llevaba `aria-label` sobre un
  `<span>` genérico, que ARIA prohíbe. Las letras van partidas para poder
  animarlas una a una, así que son decoración: ahora el conjunto es
  `aria-hidden` y el nombre accesible lo pone quien la envuelve.
- **Dos `<h1>` en el checkout**: el encabezado de página y el del paso. El paso
  pasó a `<h2>`, que es lo que era.

### 6.9 · El fallo que solo se ve mirando

La clase del lienzo de fondo se llamó `.u-field` — el mismo nombre que el campo
de formulario de la casa. Resultado: cada `input` y cada `select` heredaba
`position: fixed; inset: 0` y se volvía un elemento a pantalla completa. El
catálogo quedó con el buscador invisible y el selector de orden atravesando la
columna de filtros.

Ni los tipos, ni el lint, ni las 64 pruebas lo detectaron: los elementos existían
y respondían. **Salió de mirar una captura**, que es exactamente para lo que está
el barrido visual de `scripts/shots.mjs`.
