import { describe, expect, test } from 'vitest'
import { normalizeProductPointer } from '@/lib/productMotion'

describe('movimiento de imagen de producto', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 }

  test('queda neutro en el centro y llega a los extremos en los bordes', () => {
    expect(normalizeProductPointer(300, 150, rect)).toEqual({ x: 0, y: 0 })
    expect(normalizeProductPointer(100, 50, rect)).toEqual({ x: -1, y: -1 })
    expect(normalizeProductPointer(500, 250, rect)).toEqual({ x: 1, y: 1 })
  })

  test('limita los valores aunque el puntero salga del rectángulo', () => {
    expect(normalizeProductPointer(-500, 900, rect)).toEqual({ x: -1, y: 1 })
  })

  test('no produce valores inválidos con un rectángulo vacío', () => {
    expect(normalizeProductPointer(10, 10, { ...rect, width: 0, height: 0 })).toEqual({
      x: 0,
      y: 0,
    })
  })
})
