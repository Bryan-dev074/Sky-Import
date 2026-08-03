import type { Metadata, SharpInput } from 'sharp'

export interface ProductCutoutBounds {
  width: number
  height: number
  left: number
  top: number
  right: number
  bottom: number
  opaqueWidth: number
  opaqueHeight: number
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  marginRatios: {
    top: number
    right: number
    bottom: number
    left: number
  }
  safeMarginRatio: number
}

export interface ProductCutoutInspectionOptions {
  alphaThreshold?: number
}

export interface NormalizeProductCutoutBaseOptions extends ProductCutoutInspectionOptions {
  canvas?: number
  occupancy?: number
  webpExactTransparentRgb?: boolean
}

export type NormalizeProductCutoutOptions = NormalizeProductCutoutBaseOptions &
  (
    | {
        allowEnlargement: true
        maxEnlargementRatio: number
      }
    | {
        allowEnlargement?: false
        maxEnlargementRatio?: never
      }
  )

export interface ProductCutoutInspection {
  metadata: Metadata
  cornerAlpha: [number, number, number, number]
  bounds: ProductCutoutBounds | null
}

export function readCornerAlpha(input: SharpInput | SharpInput[]): Promise<[number, number, number, number]>
export function measureOpaqueBounds(
  input: SharpInput | SharpInput[],
  options?: ProductCutoutInspectionOptions,
): Promise<ProductCutoutBounds | null>
export function inspectProductCutout(
  input: SharpInput | SharpInput[],
  options?: ProductCutoutInspectionOptions,
): Promise<ProductCutoutInspection>
export function normalizeProductCutout(
  input: SharpInput | SharpInput[],
  options?: NormalizeProductCutoutOptions,
): Promise<Buffer>
