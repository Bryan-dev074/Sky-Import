export interface RectLike {
  left: number
  top: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Posición normalizada del puntero: −1/1 en los bordes y 0 en el centro. */
export function normalizeProductPointer(
  clientX: number,
  clientY: number,
  rect: RectLike,
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 }
  return {
    x: clamp(((clientX - rect.left) / rect.width - 0.5) * 2, -1, 1),
    y: clamp(((clientY - rect.top) / rect.height - 0.5) * 2, -1, 1),
  }
}
