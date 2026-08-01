# Sky Import — imágenes reales, portada RTX 5090 y armado 3D

Fecha: 2026-08-01
Estado: diseño aprobado en conversación; pendiente de revisión del documento por el titular.

## 1. Objetivo

Convertir Sky Import en una tienda de componentes que se perciba real y premium desde la
primera carga, sin perder su identidad técnica ni sacrificar el uso en celular.

La experiencia final debe cumplir cuatro promesas:

1. Cada producto del catálogo se reconoce por una imagen oficial del modelo real.
2. La RTX 5090 Founders Edition es el nuevo producto insignia y protagoniza la portada.
3. La sección de ensamblaje mantiene la pantalla fijada hasta completar visualmente una GPU.
4. «Arma tu PC» representa en 3D cómo cada selección entra en el equipo y celebra un armado
   compatible con encendido, ventiladores, RGB y corriente visible en los cables.

La fotografía y el 3D tienen roles distintos: la fotografía demuestra qué se compra; el 3D
explica cómo se arma. Ninguna imagen generada por IA se presentará como fotografía real de un
producto comercial.

## 2. Dirección escogida

Se adopta una solución híbrida:

- imágenes oficiales optimizadas en portada, categorías, catálogo, selectores y fichas;
- animación DOM/CSS para textos, logo, tarjetas y circuitos;
- Three.js procedimental únicamente en las dos experiencias donde aporta comprensión:
  ensamblaje de la RTX 5090 y configurador del equipo;
- degradación progresiva en móvil, movimiento reducido y ausencia de WebGL.

Se descarta hacer todo el catálogo en 3D porque elevaría la descarga, el consumo de batería y
el tiempo de render sin mejorar la identificación del modelo. Se descarta también una solución
solo fotográfica porque no cumpliría la experiencia de armado solicitada.

## 3. Nuevo producto insignia: RTX 5090 Founders Edition

El catálogo pasará de 37 a 38 productos. La nueva ficha se insertará al principio de
`tarjetas-graficas` y será el primer producto destacado.

Datos iniciales de la tienda:

- slug: `geforce-rtx-5090-founders-edition-32gb`;
- referencia interna: `SI-VGA-0101`;
- nombre: `GeForce RTX 5090 Founders Edition 32 GB`;
- marca: `NVIDIA`;
- precio configurado: `US$ 1.999`;
- unidades configuradas: `1`;
- destacada y llegada reciente: sí;
- memoria: `32 GB GDDR7`;
- bus de memoria: `512 bit`;
- núcleos CUDA: `21.760`;
- interfaz: `PCIe 5.0 ×16`;
- consumo de la placa: `575 W`;
- fuente recomendada: `1000 W`;
- alimentación: `1× cable PCIe Gen 5 de 16 pines, 600 W o superior`;
- longitud: `304 mm`;
- anchura: `137 mm`;
- altura: `61 mm`;
- ocupación declarada en el configurador: `2 ranuras`, manteniendo la recomendación de dejar
  una ranura adicional libre frente a los ventiladores.

La configuración comercial de precio y unidades pertenece a Sky Import y sigue siendo editable;
no se presenta como stock oficial de NVIDIA. Las especificaciones se basan en la página y guía
oficiales de NVIDIA:

- https://marketplace.nvidia.com/en-us/consumer/graphics-cards/geforce-rtx-5090-founders-edition/
- https://www.nvidia.com/content/geforce-gtx/geforce-rtx-5090-user-guide-r2.pdf

La 5090 reemplaza a la 5080 como `HERO_GPU`. La 5080 permanece en el catálogo y deja de ser el
recurso visual principal.

## 4. Sistema de imágenes reales

### 4.1 Datos y archivos

`Product` incorporará un bloque `media` con:

- imagen principal local;
- texto alternativo descriptivo;
- fuente oficial y etiqueta de crédito;
- encuadre opcional por producto;
- segunda vista oficial solo cuando esté disponible y aporte información.

Los recursos finales vivirán bajo `public/products/<slug>/`. Se convertirán a WebP conservando
transparencia cuando exista, con dimensiones suficientes para una ficha grande y versiones
responsivas generadas por Next.js. No se enlazarán imágenes remotas en tiempo de ejecución.

Cada uno de los 38 productos debe tener al menos una imagen principal oficial. Un control de
cobertura impedirá cerrar la implementación si falta alguna. `CREDITS.md` registrará fabricante,
página original y uso dentro del sitio.

Cuando la ficha existente nombra el chip pero no un ensamblador concreto, se usará la variante
oficial de referencia: Founders Edition para las GeForce que la posean, diseño de referencia para
Radeon y Limited Edition para Intel Arc. La interfaz no atribuirá a esas imágenes dimensiones o
acabados de un ensamblador distinto. Los demás productos conservarán exactamente la marca y el
modelo ya declarados en el catálogo.

Antes de incorporar esas GPU genéricas se volverán a contrastar longitud, ranuras, alimentación y
consumo con la variante de referencia escogida. Si un dato actual pertenecía implícitamente a un
ensamblador no identificado, se corregirán `specs` y `compat` para que fotografía, ficha y cálculo
de compatibilidad describan el mismo producto.

### 4.2 Uso en la interfaz

- Portada: RTX 5090 cargada con prioridad y sin desplazamiento de layout.
- Categorías: cada celda usa la imagen real de un producto representativo de esa categoría.
- Destacados y catálogo: imagen oficial sobre el pozo técnico actual.
- Selector del configurador: miniatura real para reconocer el modelo antes de elegirlo.
- Ficha: imagen oficial grande con cotas superpuestas; una segunda vista se muestra solo si existe.
- Carrito y resumen: miniatura real contenida y liviana.

El render vectorial actual permanece como respaldo de error y como recurso de cotas. Nunca debe
aparecer un hueco si una imagen no carga.

### 4.3 Movimiento de producto

En puntero preciso, cada fotografía se comportará como una pieza en una vitrina:

- escala máxima aproximada de `1.06`;
- inclinación de hasta 5 grados en X/Y según la posición del puntero;
- desplazamiento interno corto en sentido contrario para crear profundidad;
- reflejo de estudio ligado al puntero;
- regreso amortiguado al centro al salir;
- cotas y datos permanecen legibles por encima.

En dispositivos táctiles no se simula hover. La imagen tiene una entrada corta ligada a su primera
aparición y queda estable para no competir con el scroll. `prefers-reduced-motion` elimina tanto la
entrada como la respuesta al puntero.

## 5. Portada premium con RTX 5090

La portada conserva el manifiesto editorial, pero la fotografía real sustituye al dibujo. La pieza
se presenta en tres planos:

1. fotografía oficial de la 5090;
2. cotas técnicas y conectores como capa de instrumento;
3. circuito y corriente por detrás, sin tapar el producto.

La GPU responde al puntero con inclinación, desplazamiento y reflejo. Durante el scroll inicial
desciende más lentamente que el texto para aumentar la sensación de masa. El titular conserva la
frase «Cada pieza con su ficha delante», pero su secuencia se amplía: las palabras entran desde
raíles diferentes, ajustan ligeramente el tracking al asentarse y reciben un barrido de luz largo
cada siete segundos. No habrá rebotes ni texto ilegible.

## 6. Energización inicial ampliada

La intro aparecerá en una carga completa, recarga o entrada directa, pero no al navegar entre
páginas internas. Su duración total objetivo será de aproximadamente 3,8 segundos, frente a los
~2,3 segundos actuales.

Secuencia:

- `0–500 ms`: retícula y pads de circuito emergen desde negro;
- `350–1.150 ms`: varias corrientes recorren pistas y convergen en el isotipo;
- `800–1.750 ms`: el isotipo se arma por segmentos y el nombre SKY IMPORT aparece por letras;
- `1.450–2.450 ms`: el sello permanece visible mientras dos pulsos de luz recorren circuitos,
  contorno del logo y una silueta técnica de la RTX 5090;
- `2.350–3.800 ms`: las lamas se abren en una secuencia más continua y la silueta se alinea
  visualmente con la fotografía de la portada.

La animación usará el cian, acero y blanco cálido del sistema; no introducirá arcoíris ni estética
gamer genérica. El icono de marca del encabezado conservará después un pulso de circuito discreto
cada ocho segundos para que el logo no quede completamente quieto.

El botón «Omitir» aparece antes de los 600 ms. Escape y clic continúan funcionando. En cuanto
empieza la apertura, la intro deja de interceptar el puntero. Con movimiento reducido no se pinta
ningún cuadro de la intro.

## 7. Ensamblaje de RTX 5090 fijado al scroll

La sección actual de GPU se reemplazará por una reconstrucción procedimental aproximada de la RTX
5090 Founders Edition, creada y revisada con el proceso de `img2threejs`. La portada seguirá usando
la fotografía real; este modelo es una representación explicativa y se identificará internamente
como tal.

La sección tendrá cerca de `360vh` y un escenario `sticky` de `100svh`. El navegador seguirá usando
scroll nativo: la pantalla queda visualmente fijada por CSS, no mediante bloqueo de la rueda.

Fases de progreso:

1. PCB y contactos;
2. chips de memoria y cámara de vapor;
3. aletas y conducción térmica;
4. bastidor y backplate;
5. carcasa y conectores;
6. ventiladores;
7. cierre, giro de inspección y encendido.

La lista lateral activa el nombre de cada conjunto cuando entra en posición. Al llegar al 100 % la
GPU hace un giro corto, los ventiladores alcanzan velocidad de reposo y la sección libera el final
del recorrido. Con movimiento reducido se muestra la tarjeta terminada en una sección normal, sin
sticky prolongado.

## 8. Configurador «Arma tu PC» en 3D

### 8.1 Composición

En escritorio, el listado y las advertencias ocupan la columna izquierda y el gabinete 3D permanece
fijado en la derecha. En móvil, la escena ocupa un escenario compacto sobre los controles y deja de
ser sticky cuando su altura perjudique la selección.

La escena incluye grupos independientes para:

- gabinete abierto;
- placa madre;
- CPU;
- memoria RAM;
- almacenamiento;
- fuente;
- refrigeración por aire o líquida;
- GPU;
- ventiladores y cables.

Cada grupo tendrá posición de espera, trayectoria de entrada, posición final, pivote y metadatos de
selección. La escena consume directamente el estado existente de `useBuild`; no habrá una segunda
fuente de verdad.

### 8.2 Respuesta a las elecciones

Al seleccionar un producto:

- la miniatura real confirma qué modelo se eligió en la lista;
- su representación 3D entra en el gabinete;
- medidas conocidas alteran la representación cuando importa: largo y ventiladores de GPU,
  formato de placa, cantidad de módulos RAM, tipo de refrigeración y tamaño de gabinete;
- la cámara encuadra brevemente el punto de montaje y vuelve a la vista general;
- al retirar una pieza, su grupo sale siguiendo la trayectoria inversa.

Las representaciones no prometen geometría exacta de los 38 productos. Deben conservar la clase,
proporción útil y rasgos suficientes para explicar el armado.

### 8.3 Compatibilidad y encendido

Una incompatibilidad existente en `checkBuild` ilumina únicamente las piezas implicadas con ámbar
o herrumbre. El cian se retira de ese bloque, manteniendo la gramática actual.

Cuando las ocho ranuras están completas y no existen bloqueos:

- el botón de encendido responde;
- los ventiladores arrancan y estabilizan su velocidad;
- los módulos RAM reciben iluminación RGB moderada;
- el interior recibe un barrido RGB corto de celebración;
- pulsos emisivos recorren tubos que representan los cables de alimentación;
- la luz de estado vuelve después al cian de Sky Import.

Si las ocho ranuras están llenas pero existe un bloqueo, el equipo no completa el encendido y la
cámara señala la zona incompatible. Así, el espectáculo refuerza la utilidad del configurador.

## 9. Fondo y títulos

El fondo de haces del encabezado de «Arma tu PC» aumentará de `speed=1.4` a un valor objetivo de
`2.3`, con contraste ligeramente mayor. Se mantendrá apagado bajo movimiento reducido.

Los títulos de sección compartirán una nueva coreografía, no una colección de efectos distintos:

- antetítulo dibuja su guion;
- palabras entran por máscara con diferencia corta;
- el filete asociado se traza después;
- un barrido ocasional aporta vida sin reiniciar la entrada.

La portada y la intro reciben las secuencias más complejas. El resto de la tienda conserva reposo
para que los productos sigan siendo el foco.

## 10. Arquitectura de componentes

Nuevas responsabilidades previstas:

- `ProductImage`: selección de recurso, tamaños, fallback y texto alternativo;
- `ProductStage`: hover, tilt, profundidad y cotas para fotografías;
- `HeroProductStage`: versión de portada con paralaje y prioridad de carga;
- `ScrollAssemblySection`: calcula progreso de la sección sticky;
- `Rtx5090Assembly`: fábrica Three.js con partes nombradas y animables;
- `PcAssemblyScene`: escena y ciclo de vida WebGL del configurador;
- `createPcAssemblyModel`: jerarquía procedimental separada del renderizador;
- `BuildSceneBridge`: traduce `useBuild` y `checkBuild` a estados visuales;
- `KineticHeading`: entrada y barrido reutilizables para títulos.

Las fábricas 3D se mantendrán separadas de React y expondrán `THREE.Group`, partes seleccionables,
trayectorias y un método de actualización. Esto permite probar la traducción de estado sin depender
de un canvas real.

## 11. Rendimiento, accesibilidad y fallos

- Three.js seguirá en importación dinámica y solo se descargará cerca de cada escena.
- DPR máximo: 1,5 en escritorio y 1 en móvil; la escena reducirá luces y detalles según tamaño.
- Los bucles se detienen fuera de pantalla o con la pestaña oculta.
- Cada contexto libera geometrías, materiales, texturas y contexto WebGL al desmontar.
- WebGL fallido muestra un render estático completo y mantiene funcional el configurador.
- Imagen ausente o fallida muestra el render vectorial actual.
- Toda información operativa continúa disponible sin animación y con teclado.
- Los canvases decorativos no entran en el árbol de accesibilidad; el estado del armado se anuncia
  mediante las regiones de texto existentes.
- No se bloquea el scroll por JavaScript.

## 12. Verificación y criterios de aceptación

La implementación se hará con pruebas primero para comportamientos nuevos.

Pruebas automáticas mínimas:

- existen 38 productos y la 5090 es el primer producto insignia;
- cada producto posee recurso local, fuente oficial y alt;
- la 5090 participa correctamente en cálculos de fuente y gabinete;
- la portada usa la fotografía de la 5090;
- una tarjeta responde al puntero sin mover su caja de layout;
- la sección sticky alcanza el estado ensamblado antes de liberar el recorrido;
- cada elección del configurador activa el grupo 3D correspondiente;
- un armado completo y compatible alcanza `powered`;
- un armado completo incompatible no alcanza `powered`;
- movimiento reducido omite intro, hover animado y sticky prolongado;
- fallback de imagen y WebGL conserva contenido y controles;
- sin desbordamiento horizontal en 360, 390, 768, 1366 y 1440 px;
- auditoría axe sin infracciones nuevas;
- cero errores de consola o hidratación.

Comandos de cierre:

- lint;
- typecheck;
- pruebas unitarias;
- build de producción;
- pruebas end-to-end completas;
- auditoría de accesibilidad;
- capturas de portada, catálogo, ficha, ensamblaje y configurador en notebook y celular.

Solo después de esta evidencia se actualizarán `PRODUCT.md`, `DESIGN.md`, `README.md` y
`CREDITS.md`, se creará el commit de implementación y se publicará en `origin/main` sin force push.
