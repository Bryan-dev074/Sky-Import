import {
  PRODUCT_CUTOUT_RECIPES,
  rebuildProductCutout,
  type ExecutableProductCutoutRecipe,
  type ProductCutoutRecipe,
  type StoredProductCutoutRecipe,
} from '../../scripts/lib/product-cutout-recipes.mjs'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false
type Expect<Value extends true> = Value

type Provenance = {
  sourceExtension: 'png'
  sourceSha256: 'source-hash'
  expectedOutputSha256: 'output-hash'
}
type Policy = { canvas: 1600; occupancy: 0.84 }

export type AcceptsStoredWhiteFloodRecipe = Expect<
  Equal<
    (Provenance & {
      operation: 'white-flood-matte'
      matte: { luma: 245; chroma: 10; featherPixels: 1; despill: true }
    }) extends StoredProductCutoutRecipe
      ? true
      : false,
    true
  >
>
export type RejectsStoredRecipeWithoutProvenance = Expect<
  Equal<
    {
      operation: 'native-alpha'
    } extends StoredProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RejectsPolicyInStoredRecipe = Expect<
  Equal<
    (Provenance & {
      operation: 'native-alpha'
      policy: Policy
    }) extends StoredProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RejectsUndefinedPolicyInStoredRecipe = Expect<
  Equal<
    (Provenance & {
      operation: 'native-alpha'
      policy: undefined
    }) extends StoredProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type AcceptsExecutablePruneRecipe = Expect<
  Equal<
    {
      operation: 'native-alpha-prune-diffuse'
      alphaPrune: { coreAlpha: 220; retainDistance: 3 }
      policy: Policy
    } extends ExecutableProductCutoutRecipe
      ? true
      : false,
    true
  >
>
export type RejectsExecutableRecipeWithoutPolicy = Expect<
  Equal<
    {
      operation: 'native-alpha-tone-lift'
      tone: { gamma: 0.7 }
    } extends ExecutableProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RejectsMatteOnNativeAlpha = Expect<
  Equal<
    {
      operation: 'native-alpha'
      matte: { luma: 245; chroma: 10; featherPixels: 1; despill: true }
    } extends ProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RejectsUndefinedMatteOnNativeAlpha = Expect<
  Equal<
    {
      operation: 'native-alpha'
      matte: undefined
    } extends ProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RejectsUndefinedToneOnWhiteFlood = Expect<
  Equal<
    {
      operation: 'white-flood-matte'
      matte: { luma: 245; chroma: 10; featherPixels: 1; despill: true }
      tone: undefined
    } extends ProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RequiresMatteOnWhiteFlood = Expect<
  Equal<
    {
      operation: 'white-flood-matte'
    } extends ProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RequiresPruneOptionsOnPruneOperation = Expect<
  Equal<
    {
      operation: 'native-alpha-prune-diffuse'
    } extends ProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RequiresToneOptionsOnToneOperation = Expect<
  Equal<
    {
      operation: 'native-alpha-tone-lift'
    } extends ProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type RequiresLayoutOnFiveCopyGrid = Expect<
  Equal<
    (Provenance & {
      operation: 'white-flood-five-copy-grid'
      matte: { luma: 245; chroma: 10; featherPixels: 1; despill: true }
    }) extends StoredProductCutoutRecipe
      ? true
      : false,
    false
  >
>
export type UnknownRecipeLookupIsUndefinedSafe = Expect<
  Equal<(typeof PRODUCT_CUTOUT_RECIPES)[string], StoredProductCutoutRecipe | undefined>
>
export type RebuildAcceptsOnlyExecutableRecipe = Expect<
  Equal<Parameters<typeof rebuildProductCutout>[1], ExecutableProductCutoutRecipe>
>
