# Créditos y avisos de terceros

## Material gráfico

**Todo el material gráfico de este proyecto es autoral.** No se reproduce
ninguna fotografía, logotipo, tipografía de marca ni recurso visual de terceros.

- **Renders de componentes** (`src/components/render/ComponentRender.tsx`) —
  SVG dibujados a mano para este proyecto. Placa de video, procesador, placa
  madre, memoria, SSD M.2 y SATA, fuente, disipador de aire, refrigeración
  líquida, gabinete, ventiladores y pasta térmica.
- **Pieza 3D** (`src/components/three/GpuAssembly.tsx`) — geometría generada en
  código con primitivas de three.js. Sin mallas importadas, sin texturas, sin
  archivos binarios.
- **Motivo de pistas de circuito** (`src/components/motif/Trace.tsx`) — generado
  a partir de una semilla con un generador determinista propio.
- **Marca gráfica y denominativa** (`src/components/brand/Wordmark.tsx`,
  `public/icon.svg`) — dibujadas para este proyecto.
- **Imagen social** (`public/og.png`) — generada por `scripts/build-assets.mjs`,
  con las letras del sello dibujadas como rectángulos para no depender de que el
  rasterizador tenga la tipografía instalada.

Los nombres de fabricantes y modelos que aparecen en el catálogo (NVIDIA, AMD,
Intel, ASUS, MSI, Gigabyte, ASRock, Corsair, G.Skill, Kingston, Samsung, Western
Digital, Crucial, Seasonic, Noctua, Thermalright, ARCTIC, Lian Li, NZXT, Cooler
Master, Thermal Grizzly) son **marcas de sus respectivos titulares** y se usan
únicamente para identificar el producto al que se refiere cada ficha. No se
reproduce ningún logotipo ni recurso gráfico de esas marcas, y este proyecto no
está afiliado a ninguna de ellas.

---

## Tipografías

| Familia | Autoría | Licencia |
|---|---|---|
| **Archivo** | Omnibus-Type | SIL Open Font License 1.1 |
| **Azeret Mono** | Displaay Type Foundry | SIL Open Font License 1.1 |

Ambas se obtienen a través de `next/font/google`, que las **descarga en tiempo de
compilación y las sirve desde el propio dominio**: no hay ninguna petición del
navegador a un tercero, ni en tiempo de ejecución ni de forma diferida. Se carga
únicamente el subconjunto `latin`, que cubre por completo el español y el
portugués.

La SIL OFL permite el uso, la modificación y la redistribución, incluida la
comercial, siempre que las tipografías no se vendan por sí solas y que los
archivos derivados no usen los nombres reservados. Este proyecto solo las
incrusta; no las modifica ni las redistribuye por separado.

---

## Dependencias

| Paquete | Licencia |
|---|---|
| next | MIT |
| react · react-dom | MIT |
| zustand | MIT |
| three | MIT |
| tailwindcss · @tailwindcss/postcss | MIT |
| typescript | Apache-2.0 |
| eslint · eslint-config-next | MIT |
| vitest | MIT |
| @playwright/test | Apache-2.0 |
| sharp | Apache-2.0 |

---

## Recursos evaluados y no incorporados

Se revisaron durante la fase de investigación y **no se copió código ni recursos
de ninguno**. El razonamiento completo está en
[`docs/decisiones-tecnicas.md`](docs/decisiones-tecnicas.md).

- **Impeccable** (<https://impeccable.style>) — usado como skill de criterio
  visual durante el diseño. No aporta código al producto final.
- **Emil Kowalski skills** (<https://emilkowal.ski/skill>) — no instalado.
- **Taste Skill** (<https://www.tasteskill.dev>) — no instalado.
- **React Bits** (<https://reactbits.dev>) — MIT + Commons Clause. **No se copió
  ningún componente.** Su Commons Clause prohíbe redistribuir los componentes en
  sí, y este repositorio es público. Dos ideas (fondo de retícula y cursor con
  estados) se reimplementaron desde cero con los tokens de este proyecto.
- **Uiverse** (<https://uiverse.io>) — no utilizado. La consulta automatizada
  recibió `403` y no se pudo verificar de primera mano el estado de sus
  condiciones de uso, así que se descartó la fuente en lugar de asumir nada.
- **GSAP** (<https://gsap.com>) — v3.15.0, hoy gratuito para todo uso incluidos
  los plugins que antes eran de pago. Se instaló, se evaluó y se **desinstaló**:
  no había ninguna animación protagonista donde aportara una diferencia
  perceptible frente a CSS más un único bucle de `requestAnimationFrame`.
- **img2threejs** (<https://github.com/img2threejs/img2threejs>) — Apache-2.0.
  No instalado: exige una fotografía de referencia y este proyecto no tiene
  fotografía de producto con derechos. Se adoptó su enfoque —un modelo 3D que es
  código legible y no un binario— escribiendo la geometría a mano.
