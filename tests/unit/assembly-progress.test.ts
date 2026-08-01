import { describe, expect, it } from 'vitest'
import {
  assemblyStageProgress,
  getAssemblyScrollProgress,
  getAssemblyStep,
} from '@/lib/assemblyProgress'

describe('getAssemblyScrollProgress', () => {
  it('stays at zero before the sticky journey starts', () => {
    expect(getAssemblyScrollProgress(160, 3200, 900)).toBe(0)
  })

  it('maps the complete sticky travel to a stable 0..1 interval', () => {
    expect(getAssemblyScrollProgress(0, 3200, 900)).toBe(0)
    expect(getAssemblyScrollProgress(-1150, 3200, 900)).toBeCloseTo(0.5)
    expect(getAssemblyScrollProgress(-2300, 3200, 900)).toBe(1)
  })

  it('returns the completed state immediately for reduced motion', () => {
    expect(getAssemblyScrollProgress(0, 3200, 900, true)).toBe(1)
  })
})

describe('assemblyStageProgress', () => {
  it('stages chassis, thermal modules, frame, details and power in order', () => {
    expect(assemblyStageProgress(0.08, 0.12, 0.34)).toBe(0)
    expect(assemblyStageProgress(0.23, 0.12, 0.34)).toBeCloseTo(0.5)
    expect(assemblyStageProgress(0.6, 0.12, 0.34)).toBe(1)
  })

  it('reports the customer-facing milestone reached by scroll', () => {
    expect(getAssemblyStep(0.02)).toBe('chassis')
    expect(getAssemblyStep(0.31)).toBe('thermal')
    expect(getAssemblyStep(0.53)).toBe('frame')
    expect(getAssemblyStep(0.74)).toBe('details')
    expect(getAssemblyStep(0.93)).toBe('power')
  })
})
