import type { CutoutPolicy } from './lib/product-cutout-recipes.mjs'

export const DEFAULT_PRODUCT_CUTOUT_POLICY: Readonly<{
  canvas: 1600
  occupancy: 0.84
}>
export const RTX_5090_PRODUCT_CUTOUT_POLICY: Readonly<{
  canvas: 2048
  occupancy: 0.86
}>
export const GSKILL_TRIDENT_Z5_NEO_PRODUCT_CUTOUT_POLICY: Readonly<{
  canvas: 1600
  occupancy: 0.84
  allowEnlargement: true
  maxEnlargementRatio: 1.87
}>
export const PRODUCT_CUTOUT_POLICY: Readonly<
  Partial<Record<string, Readonly<CutoutPolicy>>>
>
export function getProductCutoutPolicy(slug: string): Readonly<CutoutPolicy> | undefined
