import { describe, expect, it } from 'vitest'

import { resolveBuild } from '@/lib/build'
import { assessBuildCandidate } from '@/lib/buildCandidateFit'
import { PRODUCT_BY_SLUG } from '@/lib/catalog/products'

function product(slug: string) {
  const value = PRODUCT_BY_SLUG.get(slug)
  if (!value) throw new Error(`Missing test product: ${slug}`)
  return value
}

describe('assessBuildCandidate', () => {
  it('marks a 1000 W PSU as compatible with the selected RTX 5080', () => {
    const build = resolveBuild({
      gpu: 'geforce-rtx-5080-16gb',
      psu: 'msi-mag-a650bn',
    })

    expect(assessBuildCandidate(build, 'psu', product('corsair-rm1000x'))).toEqual({
      fit: 'compatible',
      issues: [],
    })
  })

  it('keeps the 650 W PSU in conflict with the selected RTX 5080', () => {
    const build = resolveBuild({
      gpu: 'geforce-rtx-5080-16gb',
      psu: 'msi-mag-a650bn',
    })

    const result = assessBuildCandidate(build, 'psu', product('msi-mag-a650bn'))

    expect(result.fit).toBe('conflict')
    expect(result.issues.map((issue) => issue.id)).toContain('psu-under')
  })

  it('rejects an Intel motherboard for the selected AM5 processor', () => {
    const build = resolveBuild({
      cpu: 'ryzen-7-9800x3d',
      motherboard: 'msi-mag-b850-tomahawk-wifi',
    })

    const result = assessBuildCandidate(
      build,
      'motherboard',
      product('gigabyte-b760m-ds3h'),
    )

    expect(result.fit).toBe('conflict')
    expect(result.issues.map((issue) => issue.id)).toContain('socket')
  })

  it('accepts an AM5 motherboard for the selected AM5 processor', () => {
    const build = resolveBuild({
      cpu: 'ryzen-7-9800x3d',
      motherboard: 'gigabyte-b760m-ds3h',
    })

    expect(
      assessBuildCandidate(build, 'motherboard', product('msi-mag-b850-tomahawk-wifi')),
    ).toEqual({ fit: 'compatible', issues: [] })
  })
})
