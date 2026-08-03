import type { PathLike } from 'node:fs'
import type { FileHandle } from 'node:fs/promises'

export interface ProductCreditEntry {
  slug: string
  credit: string
  sourcePage: string
  imageUrl: string
  sourceSha256?: string
  identityEvidenceUrl?: string
  identityEvidenceSha256?: string
}

export const PRODUCT_MEDIA_WORKFLOW: string
export function renderProductCredits(manifest: readonly ProductCreditEntry[]): string
export function writeProductCredits(
  output: PathLike | FileHandle,
  manifest: readonly ProductCreditEntry[],
): Promise<void>
