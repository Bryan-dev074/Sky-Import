import { describe, expect, it } from 'vitest'
import { getPcAssemblyPlan } from '@/lib/pcAssemblyPlan'

describe('getPcAssemblyPlan', () => {
  it('starts as an empty eight-slot build', () => {
    const plan = getPcAssemblyPlan({}, 0)

    expect(plan.selectedCount).toBe(0)
    expect(plan.totalSlots).toBe(8)
    expect(plan.powered).toBe(false)
    expect(plan.visibleParts).toEqual([])
  })

  it('maps selected slots to the physical parts they add', () => {
    const plan = getPcAssemblyPlan(
      { case: true, motherboard: true, cpu: true, ram: true },
      0,
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
    const withoutGpu = getPcAssemblyPlan({ psu: true, motherboard: true }, 0)
    const withGpu = getPcAssemblyPlan({ psu: true, motherboard: true, gpu: true }, 0)

    expect(withoutGpu.visibleParts).toContain('motherboard-power')
    expect(withoutGpu.visibleParts).not.toContain('gpu-power')
    expect(withGpu.visibleParts).toContain('gpu-power')
  })

  it('powers on only when all slots are selected and compatibility has no blocking issue', () => {
    const complete = {
      cpu: true,
      motherboard: true,
      ram: true,
      gpu: true,
      storage: true,
      psu: true,
      cooling: true,
      case: true,
    }

    expect(getPcAssemblyPlan(complete, 0).powered).toBe(true)
    expect(getPcAssemblyPlan(complete, 1).powered).toBe(false)
  })
})
