export interface ProductMediaEntry {
  slug: string
  imageUrl: string
  sourcePage: string
  credit: string
}

export function validateProductMedia(
  root: string,
  manifest: readonly ProductMediaEntry[],
): Promise<void>
