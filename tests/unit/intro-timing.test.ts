import { describe, expect, test } from 'vitest'
import { INTRO_TIMING } from '@/lib/introTiming'

describe('recorrido de entrada premium', () => {
  test('sostiene la marca y termina cerca de cuatro segundos', () => {
    expect(INTRO_TIMING.curtainMs).toBeGreaterThanOrEqual(2600)
    expect(INTRO_TIMING.totalMs).toBeGreaterThanOrEqual(3800)
    expect(INTRO_TIMING.totalMs).toBeLessThanOrEqual(4300)
  })

  test('la salida escalonada coincide con el total publicado', () => {
    expect(INTRO_TIMING.totalMs).toBe(
      INTRO_TIMING.curtainMs +
        (INTRO_TIMING.slats - 1) * INTRO_TIMING.staggerMs +
        INTRO_TIMING.slatDurationMs +
        INTRO_TIMING.settleMs,
    )
  })
})
