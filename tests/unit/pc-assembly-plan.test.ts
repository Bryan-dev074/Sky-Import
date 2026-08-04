import { describe, expect, it } from 'vitest'
import { BUILD_SLOTS } from '@/lib/compat'
import { getPcAssemblyPlan, scenePartsForSlots } from '@/lib/pcAssemblyPlan'

describe('getPcAssemblyPlan', () => {
  it('starts as an empty eight-slot build', () => {
    const plan = getPcAssemblyPlan({})

    expect(plan.selectedCount).toBe(0)
    expect(plan.totalSlots).toBe(8)
    expect(plan).not.toHaveProperty('powered')
    expect(plan.visibleParts).toEqual([])
  })

  it('maps selected slots to the physical parts they add', () => {
    const plan = getPcAssemblyPlan(
      { case: true, motherboard: true, cpu: true, ram: true },
    )

    expect(plan.visibleParts).toEqual([
      'case',
      'motherboard',
      'cpu',
      'ram-left',
      'ram-right',
    ])
    expect(plan.selectedCount).toBe(4)
  })

  it('adds cable runs only when their endpoints exist', () => {
    const withoutGpu = getPcAssemblyPlan({ psu: true, motherboard: true })
    const withGpu = getPcAssemblyPlan({ psu: true, motherboard: true, gpu: true })

    expect(withoutGpu.visibleParts).toContain('motherboard-power')
    expect(withoutGpu.visibleParts).not.toContain('gpu-power')
    expect(withGpu.visibleParts).toContain('gpu-power')
  })

  it('never powers a complete build automatically', () => {
    const complete = Object.fromEntries(BUILD_SLOTS.map((slot) => [slot, true]))
    const plan = getPcAssemblyPlan(complete)

    expect(plan.complete).toBe(true)
    expect(plan).not.toHaveProperty('powered')
  })

  it('maps diagnostic slots to every physical part involved', () => {
    expect(scenePartsForSlots(['ram', 'gpu'])).toEqual(['ram-left', 'ram-right', 'gpu'])
  })
})
