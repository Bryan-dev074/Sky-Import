# SkyImport: portada cercana y armador con encendido manual

**Fecha:** 2026-08-04  
**Estado:** dirección aprobada por el titular para ejecución directa

## Objetivo

Convertir la portada y el configurador en una experiencia comercial más convincente sin
romper la identidad de manifiesto técnico de SkyImport. La RTX 5090 debe sentirse como un
producto físico cercano; el acceso a «Arma tu PC» debe explicar visualmente el ensamblaje;
y el laboratorio 3D debe esperar una acción humana, diagnosticar el equipo y recién entonces
encenderse y ofrecer el conjunto.

## Principio rector

El único momento extraordinario será la secuencia **armar → comprobar → diagnosticar →
encender**. El resto de la interfaz permanece preciso y sereno. El movimiento comunica
jerarquía o estado, usa la materialidad de una placa de circuito y se apaga por completo
con `prefers-reduced-motion`.

## 1. RTX 5090 de la portada

- Mantener el recorte transparente actual de 2048 × 2048 y su fotografía real, porque ya
  ofrece más resolución que la presentación visible.
- Acercar el arte aproximadamente un 28 % en escritorio y un 18 % en teléfono mediante un
  contenedor específico del hero. El producto conserva todos sus extremos visibles.
- Mantener el tilt y el desplazamiento fino con el puntero; el acercamiento base no debe
  competir con la transformación interactiva del producto.
- Conservar cotas y etiqueta de modelo, pero asegurar que nunca tapen los ventiladores ni
  el conector de la tarjeta.

## 2. Invitación animada «Arma tu PC»

- Sustituir el botón filete simple del hero por una pieza compuesta que sigue siendo un
  único enlace semántico.
- Tres miniaturas reales y transparentes —CPU, RAM y GPU— entran por un rail corto, se
  reducen levemente y se desvanecen al llegar al nodo de ensamblaje junto al rótulo.
- Las piezas se turnan; nunca se animan las tres a la vez. El recorrido es ambiental y
  tiene reposo largo entre ciclos. El foco de teclado y el texto permanecen quietos.
- En movimiento reducido se muestran las tres piezas estáticas, sin traslación ni pulso.
- La misma pieza puede reutilizarse en el segundo CTA de la portada, pero solo el CTA del
  hero corre de forma autónoma; el secundario permanece quieto hasta interacción.

## 3. Máquina de estados del encendido

El laboratorio usa estos estados observables:

| Estado | Entrada | Representación | Acción disponible |
| --- | --- | --- | --- |
| `assembling` | faltan una o más piezas | montaje progresivo y siguiente ranura | elegir componente |
| `ready` | 8/8 piezas, aún sin prueba | PC apagada y símbolo de encendido visible | encender PC |
| `checking` | el usuario pulsa encendido | barrido técnico de compatibilidad y energía | ninguna durante la prueba |
| `failed` | existe un fallo de arranque | pieza implicada marcada y explicación exacta | corregir o probar otra vez |
| `powered` | la prueba no encuentra fallos | RGB controlado, ventiladores y pulsos por cables | comprar armado |

Reglas:

- Completar 8/8 nunca enciende automáticamente.
- Cualquier cambio, eliminación o reinicio de una pieza apaga el sistema y devuelve el
  estado a `assembling` o `ready` según corresponda.
- La comprobación dura lo suficiente para entenderse, aproximadamente 1,1 segundos, y
  puede cancelarse de forma segura si cambia el armado o se desmonta el componente.
- Los bloqueos existentes impiden arrancar. La advertencia `psu-under` también impide el
  arranque porque una fuente insuficiente puede apagar el equipo en picos de carga.
- Los avisos no críticos, como una GPU que entra con poco margen, se conservan en el
  resumen pero no impiden encender.
- El primer fallo según el orden técnico actual se presenta como diagnóstico principal;
  todas sus ranuras se marcan en el dock, la lista y la escena 3D.

## 4. Diagnóstico dentro de la escena

- Durante `checking`, una línea de inspección recorre la escena y el estado se anuncia en
  una región `aria-live`.
- En `failed`, un marco industrial herrumbre rodea las representaciones 3D implicadas. La
  miniatura y el rail de cada ranura reciben el mismo estado.
- El mensaje usa el `title` y `detail` reales de `checkBuild`; no se inventan motivos ni
  se reduce el error a «incompatible».
- La tarjeta de diagnóstico vive dentro del laboratorio y nombra cómo recuperarse:
  cambiar las piezas señaladas y volver a probar.
- El botón de encendido sigue disponible después de un fallo para que el usuario pueda
  repetir la prueba tras corregir el armado.

## 5. Encendido y acción comercial

- `PcBuildScene` deja de inferir corriente a partir de 8/8. Recibe `powered` explícito
  desde el controlador de la interfaz.
- Solo en `powered` se activan el material RGB, la rotación de ventiladores y los pulsos
  eléctricos por los cables de placa madre y GPU.
- Al encender, aparece en la esquina superior derecha del laboratorio el CTA «Comprar
  armado» con el apoyo «Precio especial por conjunto».
- Al pulsarlo, se agregan una unidad de las ocho piezas elegidas y se abre el carrito en
  el mismo gesto. La acción reutiliza una sola función para evitar duplicados entre el
  laboratorio y el resumen lateral.
- No se presenta un porcentaje ni un ahorro numérico que el catálogo no pueda sostener.

## 6. Composición responsive del armador

### Escritorio

- La escena conserva prioridad visual y la PC ocupa el centro óptico.
- El título queda arriba a la izquierda; estado y CTA quedan arriba a la derecha.
- El dock de ocho piezas permanece al pie, en una sola fila, con objetivos de al menos
  48 × 48 px.
- El encendido aparece en la zona inferior derecha sin tapar la PC ni el texto de avance.

### Teléfono

- El laboratorio deja de comportarse como un escritorio recortado: título compacto,
  escena más grande y centrada, y controles debajo del chasis.
- Las ocho ranuras forman una cuadrícula táctil 4 × 2; cada celda muestra miniatura o
  índice y se puede tocar tanto vacía como ocupada para elegir o cambiar la pieza.
- El diagnóstico ocupa el ancho disponible sobre el dock y nunca desborda la pantalla.
- Encendido y compra usan todo el ancho disponible, con objetivos táctiles ≥ 44 px.
- El selector de producto continúa como bottom sheet y mantiene navegación por teclado,
  cierre por Escape y trampa de foco.

## 7. Movimiento, rendimiento y accesibilidad

- Las transiciones de controles duran menos de 300 ms y usan `--ease-rail`; la prueba de
  1,1 segundos es una secuencia de estado, no una transición que bloquee respuesta.
- Por cuadro se animan `transform` y `opacity`; el barrido puede usar una máscara estable.
- El fondo de la sección «Arma tu PC» incrementa claramente su velocidad sin superar el
  presupuesto de nodos ni distraer de la selección.
- El WebGL continúa montándose solo cerca del viewport, pausa fuera de vista y libera el
  contexto al desmontar.
- Todos los estados importantes tienen texto; color, RGB o movimiento nunca son la única
  señal.
- `prefers-reduced-motion` muestra cambios instantáneos, PC estática y cero desplazamiento
  ambiental.

## 8. Arquitectura de implementación

- `src/lib/pcAssemblyPlan.ts`: solo decide progreso, piezas visibles y siguiente ranura;
  deja de decidir si la PC está encendida.
- `src/lib/pcBootSequence.ts`: función pura que clasifica el resultado de la prueba,
  eleva `psu-under` a fallo de arranque y devuelve el diagnóstico y ranuras señaladas.
- `src/components/builder/Configurator.tsx`: posee el estado de encendido, controla el
  temporizador cancelable, unifica la compra del armado y compone los controles.
- `src/components/builder/PcBuildScene.tsx`: recibe encendido, barrido y ranuras de
  diagnóstico; activa energía y marcos 3D de forma explícita.
- `src/components/home/BuildInviteCta.tsx`: encapsula el enlace con miniaturas reales y
  deja a HomeView decidir si es la instancia autónoma.
- `src/app/globals.css`: contiene el acercamiento del hero, la coreografía de piezas, los
  estados del laboratorio y sus breakpoints/reduced-motion.
- `src/lib/i18n/dictionary.ts`: incorpora todas las nuevas etiquetas en español y
  portugués brasileño.

## 9. Criterios de aceptación

1. La RTX 5090 ocupa visiblemente más área y sigue completa y nítida en 390, 768, 1280 y
   1440 px.
2. El CTA del hero enseña piezas reales entrando al ensamblaje y sigue siendo operable
   con teclado y movimiento reducido.
3. Al elegir la octava pieza la PC permanece apagada y aparece el encendido manual.
4. Una combinación con socket incompatible o fuente insuficiente no arranca, marca las
   piezas correctas y explica el motivo exacto.
5. Una combinación válida enciende RGB, ventiladores y cableado solo después del clic.
6. «Comprar armado» aparece únicamente encendida, agrega el conjunto una sola vez y abre
   el carrito.
7. En teléfono las ocho ranuras son visibles como 4 × 2, no existe scroll horizontal
   obligatorio y el selector conserva su comportamiento accesible.
8. Unit tests, E2E relevantes, lint, TypeScript, validación de imágenes y build pasan sin
   errores; la revisión visual no presenta desbordes ni regresiones de movimiento.
