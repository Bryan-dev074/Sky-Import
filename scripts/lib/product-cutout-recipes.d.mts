export interface CutoutPolicyBase {
  canvas: number
  occupancy: number
}

export type CutoutPolicy = CutoutPolicyBase &
  (
    | { allowEnlargement: true; maxEnlargementRatio: number }
    | { allowEnlargement?: false; maxEnlargementRatio?: never }
  )

export interface WhiteFloodMatte {
  luma: number
  chroma: number
  featherPixels: number
  despill: boolean
  enclosedWhiteMinArea?: number
  preserveWhiteRegions?: readonly (
    | { left: number; top: number; width: number; height: number }
    | { centerX: number; centerY: number; radius: number }
  )[]
}

export interface ProductCutoutRecipe {
  operation:
    | 'native-alpha'
    | 'white-flood-matte'
    | 'native-alpha-prune-diffuse'
    | 'native-alpha-tone-lift'
    | 'white-flood-five-copy-grid'
  sourceExtension?: string
  sourceSha256?: string
  expectedOutputSha256?: string
  matte?: WhiteFloodMatte
  alphaPrune?: { coreAlpha: number; retainDistance: number }
  tone?: { gamma: number }
  edgeColorPropagation?: { luma: number; chroma: number; maxDistance: number }
  webpExactTransparentRgb?: boolean
  layout?: {
    width: number
    height: number
    itemSize: number
    positions: readonly { left: number; top: number }[]
  }
  policy?: CutoutPolicy
}

export const TASK_6_PRODUCT_SLUGS: readonly string[]
export const TASK_7_PRODUCT_SLUGS: readonly string[]
export const PRODUCT_CUTOUT_RECIPES: Readonly<Record<string, Required<Pick<ProductCutoutRecipe, 'operation' | 'sourceExtension' | 'sourceSha256' | 'expectedOutputSha256'>> & ProductCutoutRecipe>>
export function removeWhiteBackground(input: Buffer, matte: WhiteFloodMatte): Promise<Buffer>
export function pruneDiffuseNativeAlpha(
  input: Buffer,
  options: { coreAlpha: number; retainDistance: number },
): Promise<Buffer>
export function liftDarkProductRgb(input: Buffer, options: { gamma: number }): Promise<Buffer>
export function decontaminateNeutralBoundaryRgb(
  input: Buffer,
  options: { luma: number; chroma: number; maxDistance: number },
): Promise<Buffer>
export function arrangeFiveIdenticalCopies(
  input: Buffer,
  layout: NonNullable<ProductCutoutRecipe['layout']>,
): Promise<Buffer>
export function rebuildProductCutout(input: Buffer, recipe: ProductCutoutRecipe): Promise<Buffer>
export function sha256(bytes: Buffer): string
