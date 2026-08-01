export type AssemblyStep = 'chassis' | 'thermal' | 'frame' | 'details' | 'power'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export function getAssemblyScrollProgress(
  sectionTop: number,
  sectionHeight: number,
  viewportHeight: number,
  reducedMotion = false,
) {
  if (reducedMotion) return 1
  const travel = Math.max(1, sectionHeight - viewportHeight)
  return clamp01(-sectionTop / travel)
}

export function assemblyStageProgress(progress: number, start: number, end: number) {
  const linear = clamp01((progress - start) / Math.max(0.0001, end - start))
  return linear * linear * (3 - 2 * linear)
}

export function getAssemblyStep(progress: number): AssemblyStep {
  if (progress < 0.18) return 'chassis'
  if (progress < 0.42) return 'thermal'
  if (progress < 0.64) return 'frame'
  if (progress < 0.84) return 'details'
  return 'power'
}
