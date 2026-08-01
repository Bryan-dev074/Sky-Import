# DESIGN.md — Sistema visual de Sky Import

Este archivo es la autoridad visual del proyecto. Los tokens viven en
`src/app/globals.css` bajo `@theme`; aquí viven **los roles y las prohibiciones**, que
es lo que de verdad sostiene el sistema. Qué color es importa menos que dónde se permite
y dónde se prohíbe.

---

## 1 · Contrato de dirección

**TESIS.** Sky Import se hojea como el **manifiesto técnico de una importación**: cada
pieza llega con su ficha de despacho — código de referencia, origen, especificación
tabulada — impresa sobre grafito. Rechaza la convención del rubro: la grilla de tarjetas
redondeadas con foto lavada, precio en píldora y un «¡OFERTA!» en rojo encima.

**MUNDO PROPIO.** Dos superficies que alternan a página completa: **carbón** (la nave, el
depósito) y **aluminio** (la hoja técnica). Filetes de 1 px en lugar de tarjetas. Un cian
de instrumento racionado a seis contextos exactos. Ámbar reservado a advertencias de
compatibilidad. Retícula y trazado de pistas de PCB como motivo gráfico único. Cifras en
monoespaciada tabular. Esquinas casi rectas: 1 y 3 px, jamás una píldora.

**HISTORIA.** El visitante entiende que aquí las piezas se publican con la ficha delante;
cree que puede decidir sin adivinar porque socket, vataje y milímetros están declarados y
comprobables; y arma su equipo en el configurador o compra la pieza exacta que le faltaba.

**PRIMER VIEWPORT.** Carbón a sangre con la retícula de placa apenas visible. A la
izquierda, sobre ocho de doce columnas, el titular en Archivo a `clamp(2.6rem, 7vw, 6rem)`
con tracking cerrado; encima, el antetítulo mono `CIUDAD DEL ESTE · PARAGUAY` precedido
de un guion cian de 24 px. Debajo, una línea de valor de dos renglones a 62ch y dos
acciones rectangulares: **Ver catálogo** (sólida) y **Arma tu PC** (filete). A la derecha,
desbordando el margen, el render de una placa de video de tres cuartos con sus cotas
anotadas; sobre ella cruza una luz cada ~7 s. Al pie del viewport, un filete de 1 px con
cuatro pares etiqueta/valor en mono — el manifiesto empieza antes del scroll.

**FORMA.** Dirección fijada por el brief del titular (grafito + carbón + metálico, cian
controlado, tipografía técnica, composición editorial asimétrica). El trabajo no fue
elegir el mundo sino **rendirlo fuera del cliché**: el par carbón/aluminio y el trazado de
PCB como sistema gráfico son la traducción específica, en lugar del «negro con neón y
bordes que brillan» que el brief prohíbe explícitamente.

---

## 2 · Concepto de marca

**Sky Import** es una casa de importación. El nombre trae aire, ruta y aduana. La marca no
se apoya en la estética gamer (RGB, tipografías angulares, dragones) sino en la estética
del **hardware como objeto industrial fabricado**: la placa de circuito, la cota, el
número de parte, la hoja de especificación, el aluminio anodizado.

Ciudad del Este no es decorado: es la razón de que existan tres monedas y dos idiomas. La
frontera está en el producto, no en un banner.

---

## 3 · Principios visuales

1. **Filetes, no tarjetas.** Lo que separa es una línea de 1 px, no una caja con sombra.
   Los productos flotan sobre la superficie.
2. **El acento se raciona.** Un color que aparece en todos lados no significa nada.
3. **Toda cifra comparable es tabular y monoespaciada.** El ojo tiene que poder recorrer
   una columna de precios sin saltos.
4. **Asimetría con retícula.** Composición editorial de 12 columnas; los bloques ocupan 5,
   7 u 8 — casi nunca 6 y 6.
5. **La materialidad manda sobre el efecto.** Antes de añadir un brillo, preguntarse qué
   hace ese material en la vida real.
6. **Nada se mueve sin decir algo.** Movimiento = jerarquía, estado o respuesta.

---

## 4 · Superficies y color

### 4.1 Dos superficies a página completa

| Token | Valor | Rol | Prohibición |
|---|---|---|---|
| `--carbon` | `#0B0E12` | Superficie base: home, catálogo, ficha, carrito, checkout | No puede aparecer como panel flotante dentro de una página de aluminio |
| `--carbon-lift` | `#131920` | Elevación **real**: drawer, bottom sheet, modal, fila activa | Nunca como fondo de sección |
| `--carbon-sunk` | `#070A0E` | Hundido: campos de formulario, celdas de código, pozo del intro | Nunca como texto |
| `--aluminio` | `#E4E7EA` | Segunda superficie a página completa: guías, configurador | No puede aparecer como tarjeta dentro de carbón |
| `--aluminio-sunk` | `#D3D8DD` | Hundido sobre aluminio: filas alternas, campos | — |

Cada componente compartido acepta la prop/atributo `data-surface="aluminio"` que lo
traduce a la superficie clara con reglas fijas: el cian baja a `--sky-deep` para conservar
contraste AA, y el texto secundario se tinta **desde el carbón**, nunca con un gris de
sistema, porque un gris neutro rompe la temperatura del par.

### 4.2 Texto

| Token | Sobre carbón | Sobre aluminio | Rol |
|---|---|---|---|
| `--text-hi` | `#F2F0EC` (blanco cálido) | `#0B0E12` | Títulos, valores, cuerpo principal |
| `--text-mid` | mezcla 64 % hi + superficie | ídem | Cuerpo secundario, descripciones |
| `--text-low` | mezcla 42 % hi + superficie | ídem | Etiquetas, metadatos, pie |

`--text-low` nunca se usa para texto operativo (nada que el visitante deba leer para
decidir). Contraste mínimo AA en todos los pares; el par `--text-low` sobre `--carbon`
está medido en 4.7:1.

### 4.3 El acento (esto es la mitad del carácter)

`--sky: #55C8F5` sobre carbón · `--sky-deep: #0B6E97` sobre aluminio.

**Permitido en exactamente seis contextos, siempre los mismos:**

1. Filete de estado de 1 px (segmento activo de una barra, subrayado de pestaña activa).
2. Numeración e índices (`01`, `02`, número de paso, contador del carrito).
3. Anillo de foco de teclado (`outline: 2px solid var(--sky); outline-offset: 3px`).
4. Subrayado del enlace activo, que **crece desde la izquierda** en 320 ms.
5. El punto del cursor propio.
6. El guion de 24 px que precede a todo antetítulo mono.

**Prohibido:** como fondo de área, como color de párrafo, dentro de un gradiente, como
halo o glow alrededor de nada, y en cualquier texto de más de una línea.

### 4.4 Semánticos reservados

- `--amber: #E8B23A` — advertencia de compatibilidad y «últimas unidades». **Nunca convive
  con `--sky` en el mismo bloque**: si un bloque tiene ámbar, el cian se retira.
- `--rust: #C4553D` — incompatibilidad dura y «sin stock». Solo estado, jamás decoración.

### 4.5 Metal y materiales

`--steel: #6E7A85` es el gris frío de los filetes, marcos y cotas. `--rule` es
`--steel` al 45 % de opacidad y es el separador por defecto de toda la casa.

`--copper: #B87A4E` **solo existe dentro de los renders**, porque los caños de
calor son de cobre de verdad. No es un color de interfaz: no puede aparecer en
texto, borde, fondo ni estado. Es material, no señal.

### 4.6 Cómo se declaran los tokens (esto costó un bug)

Los alias `--color-*` que consume el framework se declaran **dentro de cada
bloque de superficie**, nunca una sola vez en `:root`. Una propiedad
personalizada se sustituye en el elemento donde se **declara**: escribir
`--color-surface: var(--bg)` solo en `:root` la congela con el valor del carbón y
hereda ese valor hacia abajo, así que la segunda superficie no llega nunca —
`data-surface="aluminio"` cambia `--bg` pero el alias ya está resuelto. Se
detectó en una captura: las guías salían sobre carbón.

---

## 5 · Tipografía

### 5.1 Dos familias con roles estrictos

**Archivo** (variable, 400–800) — display, navegación, botones, cuerpo.
Grotesca industrial de proporciones sólidas; aguanta tamaños grandes con tracking cerrado
sin volverse decorativa.

- Escala display con `clamp()`: a más tamaño, más apretado.
  De `-0.01em` / `line-height 1.28` en 22 px a `-0.04em` / `0.94` en 96 px.
- Regla dura: **display nunca por debajo de 22 px**. Por debajo de eso el rol es cuerpo.
- Peso: 400 cuerpo, 500 subtítulos y botones, 700 display. Sin 800 salvo el sello.

**Azeret Mono** (variable, 400–600) — códigos, precios, especificaciones, etiquetas.
Monoespaciada geométrica con carácter propio y cifras de caja fuerte.

- Etiquetas: 10–11 px, `text-transform: uppercase`, tracking `0.16em`, peso 500.
- Toda cifra comparable lleva `font-variant-numeric: tabular-nums`.
- Longitud máxima en mono: una línea. Nunca un párrafo.

### 5.2 Reglas de lectura

- Medida de lectura: 62–70ch en cuerpo largo.
- Cuerpo móvil: 16 px. Nunca menos en texto operativo.
- La marca denominativa **SKY IMPORT** es intocable: Archivo 700, tracking `0.22em`,
  versalitas, jamás degradada, jamás con sombra.

---

## 6 · Escala de espaciado y retícula

Base 4 px: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160`.

- Retícula de 12 columnas, canal 24 px (16 px en móvil).
- Márgenes de página: 20 px móvil · 40 px tablet · 64 px escritorio · máximo 1440 px de contenido.
- Ritmo vertical: **siempre más espacio encima de un título que debajo** (típico 96 / 24).
- Secciones: 96 px móvil, 160 px escritorio.

---

## 7 · Radios, bordes y sombras

- `--r-hair: 1px` — campos, chips, celdas.
- `--r-part: 3px` — botones, paneles, renders. Es el radio de una pieza mecanizada.
- **PROHIBIDO** cualquier radio mayor a 3 px y en particular `border-radius: 999px`.
- Borde por defecto: `1px solid var(--rule)`. Los productos en grilla **no llevan borde
  completo**: llevan un filete superior y otro inferior que los separa del vecino.
- Sombra única, solo con elevación real (drawer, sheet, modal, ficha en hover):
  `--shadow-lift: 0 18px 40px -24px rgb(3 5 8 / .9)`. Siempre desplazada hacia abajo y
  tintada con el carbón de la casa.
- **PROHIBIDO**: halo, glow, sombra centrada sin dirección, sombra de color.

**Un botón sólido deshabilitado no se atenúa con opacidad**: un blanco a media
luz sobre carbón sigue leyéndose como disponible. Se vacía — fondo transparente,
texto `--text-low`, borde `--rule`.

**Un panel cerrado se oculta de verdad.** Desplazarlo fuera de la pantalla no
alcanza: seguiría siendo alcanzable con el tabulador y con el puntero. Se apaga
con `visibility`, pero **retrasada hasta el final del recorrido al cerrar** y
inmediata al abrir; si se «transicionara» en ambos sentidos, el navegador no
dejaría enfocar nada durante la primera mitad de la animación de apertura.

---

## 8 · Textura y motivo

### 8.1 La retícula de placa

Sobre carbón, una retícula de 32 px dibujada con dos `linear-gradient` a
`rgb(110 122 133 / .055)`. No se ve; se siente. Da al negro la lectura de material en vez
de la de pantalla apagada.

### 8.2 EL TRAZADO — el motivo cultural convertido en sistema

El patrón de la casa no es genérico: es el **trazado de pistas de una placa de circuito**,
con codos a 45° y pads de vía en los quiebres. Dibujado como trazos SVG, nunca como imagen.

Aparece en exactamente cuatro lugares, siempre con la misma gramática:

1. **Intro** — la energía recorre el trazado y enciende el sello.
2. **Separador de sección** — un tramo corto con una vía en el quiebre.
3. **Fondo del configurador** — la placa sobre la que se montan las piezas.
4. **Pie de página** — el trazado sale del sello hacia los bordes.

Regla fija: 1 px siempre, `--steel` en reposo, `--sky` **solo** en el segmento activo.
Presupuesto: como máximo 30 nodos animados a la vez; en pantallas táctiles el dibujado
trazo a trazo se sustituye por un único fundido del grupo.

### 8.3 EL MANIFIESTO — el patrón compositivo

Todo dato comparable vive como **par etiqueta/valor separado por filete**, en mono, y toda
pieza declara un código de referencia estable (`SI-GPU-0142`). Es el patrón que se repite
del hero al carrito: se lee como una hoja de despacho impresa.

---

## 9 · Estilo de imágenes

No hay fotografía con derechos, así que el material es **autoral y vectorial**, lo cual
además garantiza registro unificado y cero marcas ajenas.

- **Un solo registro por grupo**: vista frontal ligeramente elevada, luz desde
  arriba-izquierda, mismo ángulo y misma escala relativa dentro de una categoría.
- Paleta limitada a la de la casa; el color propio del producto entra solo como acento del
  disipador o del PCB.
- **Segundo plano ≠ otra foto**: es la *vista anotada* de la misma pieza (cotas en mm,
  puertos, conectores de alimentación). Es lo que cruza en hover, en 400 ms.
- Ninguna marca, logotipo o tipografía de fabricante se reproduce.
- Los SVG se sirven como componentes React con `viewBox` fijo y `aria-hidden` cuando son
  decorativos; el `alt` útil vive en el contenedor.

---

## 10 · Reglas de movimiento

Dos curvas con nombre, y **ninguna animación fuera de ellas**:

```
--ease-rail  cubic-bezier(0.22, 0.61, 0.36, 1)   salida sedosa · 140–400 ms · casi todo
--ease-clamp cubic-bezier(0.65, 0, 0.35, 1)      entra y sale con peso · 320–620 ms · cortinas, paneles, máscaras
```

1. **Sin rebote.** Nunca.
2. Solo `transform` y `opacity` por cuadro. Nada que recalcule layout.
3. Entrada desde un estado ya legible (opacidad 0 → 1 con 20 px), **una sola vez**.
4. Escalonado 60–80 ms entre hermanos, tope 8 elementos; después, todos juntos.
5. `prefers-reduced-motion` **apaga**, no acorta: la intro se salta antes del primer
   pintado, el WebGL muestra el render estático, las entradas son instantáneas.
6. Ninguna vista anima más de ~30 nodos simultáneos.
7. Lo caro (WebGL) se monta al acercarse y se libera de verdad al irse
   (`forceContextLoss()` **antes** de `dispose()`).
8. **Un efecto que está en todas partes deja de ser un efecto.** El campo de
   vías estuvo un tiempo como lienzo fijo detrás de toda la tienda; funcionaba
   y se quitó igual, porque a la tercera pantalla ya era papel pintado. Ahora
   vive en **dos tramos** de la portada —las piezas destacadas y el
   configurador— y en ningún otro sitio. La misma regla gobierna la corriente
   del botón: una por vista se mueve sola, las demás esperan al puntero.

### Momentos firma (siete, y el resto sereno)

1. **Energización** — la intro de marca. El sello se escribe, la corriente lo
   recorre una vez —ese compás de sostén es lo que la separa de un parpadeo— y
   la cortina se desarma en lamas desde 1,36 s hasta ~2,3 s. **Desde que la
   primera lama se mueve, el panel ya no captura el puntero**: el tiempo en
   pantalla no se paga en usabilidad.
2. **La luz que cruza el render** del hero cada ~7 s.
3. **La ficha como manifiesto** — en hover, los filetes se dibujan de izquierda a derecha
   y cruza la vista anotada en 400 ms.
4. **La placa de video en código** — pieza WebGL procedural que se ensambla al hacer scroll.
5. **El tablero de compatibilidad** — el trazado que conecta las piezas elegidas y se
   vuelve ámbar en el segmento con problema.
6. **El titular vivo** — una luz cruza «Cada pieza / con su ficha / delante.»
   cada ~7 s, palabra a palabra, con reposo largo entre pasadas. Va **por
   palabra**, no por bloque: el recorte a glifos necesita que el elemento
   contenga el texto directamente.
7. **La acción principal energizada** — carga recorriendo el perímetro, halo que
   responde al lado por el que llega el puntero, relleno que entra barriendo y
   escuadras que encuadran. Es la misma pieza en «Ver catálogo», en «Agregar al
   carrito» y en «Pasar el armado al carrito», en dos niveles: **una sola por
   vista se mueve sola** (`data-lead`); las repetidas —una por tarjeta de
   catálogo— son la misma pieza **quieta**, que arranca cuando el puntero llega.
   Es la excepción documentada a la prohibición de brillo, no una licencia
   general.

---

## 11 · Componentes fundamentales

| Componente | Forma | Regla |
|---|---|---|
| `Button` sólido | Rectángulo `--r-part`, fondo `--text-hi`, texto `--carbon` | Una sola acción primaria por vista |
| `Button` filete | Borde `--rule`, hover: borde a `--steel` | Nunca dos filetes juntos compitiendo |
| `Rule` | 1 px `--rule` | Es el separador por defecto de la casa |
| `SpecRow` | Par etiqueta/valor con filete inferior | Etiqueta mono 10 px, valor tabular |
| `Tag` | Rectángulo 1 px, mono 10 px | `--amber` últimas unidades · `--rust` agotado · `--steel` resto |
| `ProductRow` | Sin borde; filete arriba y abajo | El render desborda su celda 8 px |
| `Panel` | `--carbon-lift` + `--shadow-lift` | Solo con elevación real |
| `Field` | `--carbon-sunk`, filete inferior 1 px | Foco: filete a `--sky`, 2 px |
| `Trace` | SVG 1 px, codos 45° | Ver §8.2 |
| `PriceStack` | Tres valores, uno visible | Ver §12 |
| `Cta` | Anillo de 2 px con carga recorriéndolo, superficie `--carbon-lift` | Lo único que brilla es el canto: el interior nunca, o se pierde el rótulo. **Una `data-lead` por vista**; las repetidas van quietas y despiertan con el puntero |
| `Cell` | Celda del índice; el **canto** se enciende por proximidad | El interior se aclara de forma uniforme, sin mancha centrada. Una mancha sobre el texto es un fallo, no un efecto |

---

## 12 · Moneda e idioma

- **USD es fuente de verdad**; PYG y BRL se derivan con tasas fijas centralizadas en
  `src/config/site.ts` y se rotulan siempre como **referenciales**.
- El precio se imprime **en las tres monedas dentro del DOM** y solo una queda visible,
  gobernada por `html[data-currency]`. Un script en línea previo al pintado fija el
  atributo desde `localStorage`. Resultado: cero parpadeo, cero desajuste de hidratación,
  página totalmente estática.
- El dinero se formatea **a mano**, sin `Intl`: servidor y navegador deben producir la
  misma cadena exacta. `US$ 1.249` · `₲ 9.242.600` · `R$ 6.744,60`.
- El idioma vive **en la ruta** (`/es`, `/pt`), no en una cookie: ambas versiones se
  generan estáticamente, `<html lang>` es correcto y la URL se puede compartir.

---

## 13 · Patrones visuales prohibidos

Fijados por el brief y ampliados por este sistema:

- Gradientes morados o de dos tonos saturados. **Única excepción documentada:**
  la luz que cruza el render cada ~7 s (`.u-sweep`) es un degradado, pero no es
  decoración de fondo — es la luz de un estudio pasando sobre una pieza, y es
  el efecto que más vida aporta por peso en todo el proyecto.
- Neón, glow, halo, `box-shadow` de color, bordes que brillan. **Única
  excepción documentada:** el canto energizado (`.u-edge`) de la acción
  principal de una vista, en cian y por proximidad del puntero. Es el canto de
  una pieza recibiendo corriente, vive en **una sola acción por vista** y está
  pedido explícitamente por el titular.
- Glassmorphism (`backdrop-filter: blur` como lenguaje general).
- Páginas compuestas únicamente de tarjetas redondeadas.
- `border-radius` mayor a 3 px; botones en forma de píldora.
- Blobs decorativos, manchas orgánicas, fondos con formas aleatorias.
- RGB exagerado, arcoíris, ciclos de color.
- Carruseles automáticos.
- Texto animado sin propósito (máquina de escribir, letras que rebotan).
- Estadísticas, testimonios, logos de clientes o reseñas inventadas.
- Contadores de urgencia falsos y stock «verificado».
- Cualquier efecto que dificulte leer, navegar o comprar.
- Iconografía de librería genérica donde corresponde un dibujo propio.

---

## 14 · Lista de control

**Mundo**
- [ ] ¿Se reconoce la página con todo el texto borrado?
- [ ] ¿El cian aparece en menos de siete contextos, siempre los mismos?
- [ ] ¿Hay UN motivo propio convertido en sistema (el trazado)?

**Movimiento**
- [ ] ¿Dos curvas con nombre y ninguna animación fuera de ellas?
- [ ] ¿Cinco momentos firma y el resto sereno?
- [ ] ¿`prefers-reduced-motion` apaga de verdad cada pieza?
- [ ] ¿Alguna vista anima más de 30 nodos a la vez?

**Realismo**
- [ ] ¿Cada dato visible tiene una lógica interna que lo sostiene?
- [ ] ¿Los estados (agotado, últimas unidades) se derivan de los datos?
- [ ] ¿El flujo completo funciona con teclado?

**Salud**
- [ ] ¿Cero errores de hidratación en consola?
- [ ] ¿Solo se cargan los cortes tipográficos usados?
- [ ] ¿Lo caro se monta al acercarse y se libera al irse?
