import { describe, expect, it } from 'vitest'

import type { BuildSlot, Issue } from '@/lib/compat'
import { diagnosePcBoot } from '@/lib/pcBootSequence'

function issue(id: string, level: Issue['level'], slots: BuildSlot[]): Issue {
  return {
    id,
    level,
    slots,
    title: { es: id, pt: id },
    detail: { es: id, pt: id },
  }
}

describe('diagnosePcBoot', () => {
  it('does not attempt to boot an incomplete build', () => {
    expect(diagnosePcBoot(false, [])).toEqual({
      status: 'incomplete',
      issue: null,
      flaggedSlots: [],
    })
  })

  it('passes a complete build with no boot-blocking issue', () => {
    const tightGpu = issue('gpu-length-tight', 'aviso', ['gpu', 'case'])

    expect(diagnosePcBoot(true, [tightGpu])).toEqual({
      status: 'passed',
      issue: null,
      flaggedSlots: [],
    })
  })

  it('fails on a hard compatibility block and keeps its exact slots', () => {
    const socket = issue('socket', 'bloqueo', ['cpu', 'motherboard'])

    expect(diagnosePcBoot(true, [socket])).toEqual({
      status: 'failed',
      issue: socket,
      flaggedSlots: ['cpu', 'motherboard'],
    })
  })

  it('treats an undersized PSU warning as a boot failure', () => {
    const psu = issue('psu-under', 'aviso', ['psu', 'gpu'])

    expect(diagnosePcBoot(true, [psu])).toEqual({
      status: 'failed',
      issue: psu,
      flaggedSlots: ['psu', 'gpu'],
    })
  })

  it('uses the first technical failure as the primary diagnostic', () => {
    const socket = issue('socket', 'bloqueo', ['cpu', 'motherboard'])
    const psu = issue('psu-under', 'aviso', ['psu', 'gpu'])

    expect(diagnosePcBoot(true, [socket, psu]).issue).toBe(socket)
  })
})
