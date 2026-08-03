export interface CutoutPolicy {
  canvas: number
  occupancy: number
  allowEnlargement?: boolean
  maxEnlargementRatio?: number
}

export interface WhiteFloodMatte {
  luma: number
  chroma: number
  featherPixels: number
  despill: boolean
}

export interface ProductCutoutRecipe {
  operation: 'native-alpha' | 'white-flood-matte'
  sourceExtension?: string
  sourceSha256?: string
  expectedOutputSha256?: string
  matte?: WhiteFloodMatte
  policy?: CutoutPolicy
}

export const TASK_6_PRODUCT_SLUGS: readonly string[]
export const PRODUCT_CUTOUT_RECIPES: Readonly<Record<string, Required<Pick<ProductCutoutRecipe, 'operation' | 'sourceExtension' | 'sourceSha256' | 'expectedOutputSha256'>> & ProductCutoutRecipe>>
export function removeWhiteBackground(input: Buffer, matte: WhiteFloodMatte): Promise<Buffer>
export function rebuildProductCutout(input: Buffer, recipe: ProductCutoutRecipe): Promise<Buffer>
export function sha256(bytes: Buffer): string
