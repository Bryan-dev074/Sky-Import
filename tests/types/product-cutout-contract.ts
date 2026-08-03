import type { NormalizeProductCutoutOptions } from '../../scripts/lib/product-cutout.mjs'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false
type Expect<Value extends true> = Value
type EmptyOptions = Record<never, never>

export type AcceptsDefaultNormalization = Expect<
  Equal<EmptyOptions extends NormalizeProductCutoutOptions ? true : false, true>
>
export type AcceptsDisabledEnlargement = Expect<
  Equal<
    { allowEnlargement: false } extends NormalizeProductCutoutOptions ? true : false,
    true
  >
>
export type AcceptsBoundedEnlargement = Expect<
  Equal<
    {
      allowEnlargement: true
      maxEnlargementRatio: number
    } extends NormalizeProductCutoutOptions
      ? true
      : false,
    true
  >
>
export type RequiresRatioWhenEnlargementIsEnabled = Expect<
  Equal<
    { allowEnlargement: true } extends NormalizeProductCutoutOptions ? true : false,
    false
  >
>
export type RejectsRatioWhenEnlargementIsOmitted = Expect<
  Equal<
    { maxEnlargementRatio: number } extends NormalizeProductCutoutOptions ? true : false,
    false
  >
>
export type RejectsRatioWhenEnlargementIsDisabled = Expect<
  Equal<
    {
      allowEnlargement: false
      maxEnlargementRatio: number
    } extends NormalizeProductCutoutOptions
      ? true
      : false,
    false
  >
>
