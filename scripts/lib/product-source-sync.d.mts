export interface ProductSourceEntry {
  slug: string
  imageUrl: string
  sourcePage: string
  sourceMediaType?: string
  sourceSha256?: string
}

export interface ProductSourceSyncResult {
  slug: string
  output: string
  extension: string
  status: 'created' | 'unchanged'
  sourceUrl: string
  sourceSha256: string
  width?: number
  height?: number
}

export function assertPinnedSourceEntry(entry: ProductSourceEntry): void
export function syncProductSource(
  entry: ProductSourceEntry,
  options: { outputRoot: string },
): Promise<ProductSourceSyncResult>
