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

export interface FiveCopyLayout {
  width: number
  height: number
  itemSize: number
  positions: readonly { left: number; top: number }[]
}

export interface EdgeColorPropagation {
  luma: number
  chroma: number
  maxDistance: number
}

interface RecipeOptions {
  edgeColorPropagation?: EdgeColorPropagation
  webpExactTransparentRgb?: boolean
}

export type ProductCutoutRecipe =
  | (RecipeOptions & {
      operation: 'native-alpha'
      matte?: never
      alphaPrune?: never
      tone?: never
      layout?: never
    })
  | (RecipeOptions & {
      operation: 'white-flood-matte'
      matte: WhiteFloodMatte
      alphaPrune?: never
      tone?: never
      layout?: never
    })
  | (RecipeOptions & {
      operation: 'native-alpha-prune-diffuse'
      matte?: never
      alphaPrune: { coreAlpha: number; retainDistance: number }
      tone?: never
      layout?: never
    })
  | (RecipeOptions & {
      operation: 'native-alpha-tone-lift'
      matte?: never
      alphaPrune?: never
      tone: { gamma: number }
      layout?: never
    })
  | (RecipeOptions & {
      operation: 'white-flood-five-copy-grid'
      matte: WhiteFloodMatte
      alphaPrune?: never
      tone?: never
      layout: FiveCopyLayout
    })

export type StoredProductCutoutRecipe = ProductCutoutRecipe & {
  sourceExtension: string
  sourceSha256: string
  expectedOutputSha256: string
  policy?: never
}

export type ExecutableProductCutoutRecipe = ProductCutoutRecipe & {
  policy: CutoutPolicy
  sourceExtension?: string
  sourceSha256?: string
  expectedOutputSha256?: string
}

export const TASK_6_PRODUCT_SLUGS: readonly string[]
export const TASK_7_PRODUCT_SLUGS: readonly string[]
export const PRODUCT_CUTOUT_RECIPES: Readonly<
  Record<string, StoredProductCutoutRecipe | undefined>
>
export function removeWhiteBackground(input: Buffer, matte: WhiteFloodMatte): Promise<Buffer>
export function pruneDiffuseNativeAlpha(
  input: Buffer,
  options: { coreAlpha: number; retainDistance: number },
): Promise<Buffer>
export function liftDarkProductRgb(input: Buffer, options: { gamma: number }): Promise<Buffer>
export function decontaminateNeutralBoundaryRgb(
  input: Buffer,
  options: EdgeColorPropagation,
): Promise<Buffer>
export function arrangeFiveIdenticalCopies(input: Buffer, layout: FiveCopyLayout): Promise<Buffer>
export function rebuildProductCutout(
  input: Buffer,
  recipe: ExecutableProductCutoutRecipe,
): Promise<Buffer>
export function sha256(bytes: Buffer): string
