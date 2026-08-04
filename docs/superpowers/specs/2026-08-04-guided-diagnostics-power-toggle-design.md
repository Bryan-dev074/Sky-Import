# Diagnóstico guiado y control de energía

## Objetivo

Convertir el fallo de encendido del armador en una guía clara de reparación. La escena debe señalar solamente las piezas implicadas, llevar al usuario hacia la pieza que conviene cambiar y mostrar primero las alternativas que funcionan con el resto del armado. El mismo control debe encender y apagar la PC.

## Dirección visual

- El estado correcto conserva el cian de Sky Import.
- Todo fallo de arranque usa amarillo técnico `#E8B23A`; se elimina el rojo herrumbre del laboratorio.
- Se eliminan las cajas `BoxHelper`, porque ocultan la PC y representan volúmenes completos en vez de piezas concretas.
- Cada ranura implicada recibe un borde y un punto amarillo discretos.
- La ranura principal del diagnóstico recibe una llamada con flecha `Cambiar esta pieza`.
- En 3D, una línea amarilla con punta y un halo puntual indican el centro de cada componente implicado. No se encierra la geometría.
- El movimiento del marcador es sutil y se vuelve estático con `prefers-reduced-motion`.

## Flujo de reparación

1. La PC completa queda apagada y muestra `Encender PC`.
2. Al pulsar, se ejecuta el escaneo de dos segundos.
3. Si falla, solo se marcan las ranuras implicadas y se ofrece `Ver opciones compatibles`.
4. La acción abre el selector de la primera ranura implicada, considerada la corrección principal por la regla de compatibilidad.
5. Cada alternativa se evalúa sustituyendo temporalmente esa ranura en el armado actual.
6. Las opciones sin bloqueos ni fuente insuficiente relacionados con esa ranura aparecen primero y muestran `Compatible con tu armado`.
7. Las opciones que mantienen el conflicto muestran `Requiere otro cambio`.
8. Si el encendido es correcto, el mismo botón pasa a `Apagar PC`. Al apagar se detienen RGB, ventiladores y pulsos eléctricos, y se oculta la compra rápida hasta volver a encender.

## Lógica

La evaluación de candidatos será una función pura e independiente de React. Recibe el armado actual, la ranura y el producto candidato; ejecuta las reglas existentes sobre una copia del armado y clasifica solo los problemas relacionados con esa ranura. Un bloqueo o `psu-under` es conflicto; sin ellos, la opción es compatible.

El diagnóstico conserva todas las ranuras implicadas para el marcado, pero usa la primera como destino de la guía y del botón de reparación.

## Accesibilidad y móvil

- Los significados no dependen solo del color: incluyen texto, icono y atributos de estado.
- La guía es un botón real con foco visible, no un elemento decorativo clicable.
- El selector conserva el foco atrapado y anuncia las etiquetas de compatibilidad.
- En móvil la llamada se mantiene dentro del laboratorio y no altera la cuadrícula 4 por 2.
- El apagado se ofrece con un nombre accesible explícito.

## Verificación

- Pruebas unitarias para candidatos compatibles e incompatibles.
- E2E para fallo de fuente: dos piezas amarillas, una guía hacia la fuente y RM1000x marcada como compatible.
- E2E para encendido y apagado: estado 3D, textos, compra rápida y efectos dependientes de energía.
- E2E móvil para cuadrícula 4 por 2 y ausencia de desbordamiento.
- Revisión visual en escritorio y teléfono, además de lint, tipos, unitarias y build.
