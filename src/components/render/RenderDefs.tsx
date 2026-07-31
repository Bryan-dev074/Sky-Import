/**
 * DEFINICIONES COMPARTIDAS DE LOS RENDERS
 *
 * Un único `<svg>` oculto, montado una sola vez en el layout, con todos los
 * degradados y patrones que usan los dibujos de producto.
 *
 * Dos motivos, y los dos importan:
 *
 *   1. **Peso.** Antes cada peine de aletas eran 44 líneas en el marcado y la
 *      malla del gabinete 182 círculos. Como patrón, son una declaración y una
 *      referencia. Con 37 fichas en pantalla la diferencia es de cientos de KB
 *      de HTML.
 *   2. **Coherencia.** El sombreado sale de la misma fuente para todas las
 *      piezas, así que la luz cae igual en todas — que es literalmente la regla
 *      de registro unificado del sistema de imágenes.
 *
 * Los identificadores son fijos y globales a propósito: hay una sola copia en el
 * documento y todas las piezas la referencian.
 */
export function RenderDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* — metales, iluminados desde arriba-izquierda — */}
        <linearGradient id="si-metal" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#4A5561" />
          <stop offset="42%" stopColor="#2E3841" />
          <stop offset="100%" stopColor="#1A2027" />
        </linearGradient>

        <linearGradient id="si-metal-light" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#9AA5AF" />
          <stop offset="48%" stopColor="#6E7A85" />
          <stop offset="100%" stopColor="#48525C" />
        </linearGradient>

        <linearGradient id="si-metal-dark" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#242C34" />
          <stop offset="55%" stopColor="#161C22" />
          <stop offset="100%" stopColor="#0D1216" />
        </linearGradient>

        <linearGradient id="si-pcb" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#243039" />
          <stop offset="100%" stopColor="#141B21" />
        </linearGradient>

        <linearGradient id="si-copper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D79A6C" />
          <stop offset="45%" stopColor="#B87A4E" />
          <stop offset="100%" stopColor="#8A5836" />
        </linearGradient>

        <linearGradient id="si-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A968" />
          <stop offset="100%" stopColor="#8F7539" />
        </linearGradient>

        {/* Vidrio templado: un filete de luz en diagonal, no un reflejo entero. */}
        <linearGradient id="si-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#39434D" stopOpacity="0.55" />
          <stop offset="46%" stopColor="#1A2027" stopOpacity="0.5" />
          <stop offset="52%" stopColor="#5A6873" stopOpacity="0.28" />
          <stop offset="58%" stopColor="#1A2027" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#12171C" stopOpacity="0.6" />
        </linearGradient>

        {/* Luz que roza el canto superior de cualquier pieza. */}
        <linearGradient id="si-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C6D0D8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C6D0D8" stopOpacity="0" />
        </linearGradient>

        {/* Sombra propia bajo la pieza. */}
        <radialGradient id="si-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#05070A" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#05070A" stopOpacity="0" />
        </radialGradient>

        {/* — patrones — */}
        <pattern id="si-fins" width="7" height="8" patternUnits="userSpaceOnUse">
          <rect width="7" height="8" fill="#12171C" />
          <rect width="2.6" height="8" fill="#39434D" />
          <rect x="2.6" width="0.9" height="8" fill="#6E7A85" opacity="0.75" />
        </pattern>

        <pattern id="si-fins-fine" width="4.4" height="8" patternUnits="userSpaceOnUse">
          <rect width="4.4" height="8" fill="#12171C" />
          <rect width="1.6" height="8" fill="#39434D" />
          <rect x="1.6" width="0.7" height="8" fill="#6E7A85" opacity="0.7" />
        </pattern>

        <pattern id="si-fins-h" width="8" height="6.2" patternUnits="userSpaceOnUse">
          <rect width="8" height="6.2" fill="#12171C" />
          <rect width="8" height="2.2" fill="#39434D" />
          <rect y="2.2" width="8" height="0.8" fill="#6E7A85" opacity="0.7" />
        </pattern>

        <pattern id="si-mesh" width="7.6" height="13.2" patternUnits="userSpaceOnUse">
          <circle cx="1.9" cy="1.9" r="1.5" fill="#6E7A85" opacity="0.34" />
          <circle cx="5.7" cy="8.5" r="1.5" fill="#6E7A85" opacity="0.34" />
        </pattern>

        <pattern id="si-hex" width="12" height="10.4" patternUnits="userSpaceOnUse">
          <path
            d="M3 0 L9 0 L12 5.2 L9 10.4 L3 10.4 L0 5.2 Z"
            fill="none"
            stroke="#6E7A85"
            strokeWidth="0.8"
            opacity="0.42"
          />
        </pattern>

        <pattern id="si-pads" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.1" fill="none" stroke="#6E7A85" strokeWidth="0.6" opacity="0.4" />
        </pattern>
      </defs>
    </svg>
  )
}
