import sharp from 'sharp'

const DEFAULT_ALPHA_THRESHOLD = 8

function validateCanvasOptions(options) {
  const canvas = options.canvas ?? 1600
  const occupancy = options.occupancy ?? 0.86
  const allowEnlargement = options.allowEnlargement === true
  const maxEnlargementRatio = options.maxEnlargementRatio

  if (!Number.isInteger(canvas) || canvas <= 0) {
    throw new Error(`El lienzo debe ser un entero positivo; se recibió ${canvas}.`)
  }
  if (typeof occupancy !== 'number' || occupancy <= 0 || occupancy > 1) {
    throw new Error(`La ocupación debe estar entre 0 y 1; se recibió ${occupancy}.`)
  }
  if (!allowEnlargement && maxEnlargementRatio !== undefined) {
    throw new Error('maxEnlargementRatio requiere allowEnlargement: true.')
  }
  if (
    allowEnlargement &&
    (typeof maxEnlargementRatio !== 'number' ||
      !Number.isFinite(maxEnlargementRatio) ||
      maxEnlargementRatio < 1)
  ) {
    throw new Error(
      'allowEnlargement requiere un maxEnlargementRatio finito mayor o igual a 1.',
    )
  }

  return { canvas, occupancy, allowEnlargement, maxEnlargementRatio }
}

function findOpaqueBounds(data, info, threshold) {
  const alphaChannel = info.channels - 1
  let left = info.width
  let top = info.height
  let right = -1
  let bottom = -1

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels + alphaChannel] <= threshold) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }

  if (right < 0) return null

  const opaqueWidth = right - left + 1
  const opaqueHeight = bottom - top + 1
  const margins = {
    top,
    right: info.width - right - 1,
    bottom: info.height - bottom - 1,
    left,
  }
  const marginRatios = {
    top: margins.top / info.height,
    right: margins.right / info.width,
    bottom: margins.bottom / info.height,
    left: margins.left / info.width,
  }

  return {
    width: info.width,
    height: info.height,
    left,
    top,
    right,
    bottom,
    opaqueWidth,
    opaqueHeight,
    margins,
    marginRatios,
    safeMarginRatio: Math.min(...Object.values(marginRatios)),
  }
}

async function toRgbaRaw(input) {
  return sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
}

export async function readCornerAlpha(input) {
  const { data, info } = await toRgbaRaw(input)
  const alphaChannel = info.channels - 1
  const lastRow = (info.height - 1) * info.width * info.channels
  const lastPixel = (info.width - 1) * info.channels

  return [
    data[alphaChannel],
    data[lastPixel + alphaChannel],
    data[lastRow + alphaChannel],
    data[lastRow + lastPixel + alphaChannel],
  ]
}

export async function measureOpaqueBounds(input, options = {}) {
  const threshold = options.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD
  const { data, info } = await toRgbaRaw(input)
  return findOpaqueBounds(data, info, threshold)
}

export async function inspectProductCutout(input, options = {}) {
  const [metadata, cornerAlpha, bounds] = await Promise.all([
    sharp(input).metadata(),
    readCornerAlpha(input),
    measureOpaqueBounds(input, options),
  ])

  return { metadata, cornerAlpha, bounds }
}

export async function normalizeProductCutout(input, options = {}) {
  const { canvas, occupancy, allowEnlargement, maxEnlargementRatio } =
    validateCanvasOptions(options)
  const alphaThreshold = options.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD
  const rotated = await sharp(input).rotate().ensureAlpha().png().toBuffer()
  const sourceBounds = await measureOpaqueBounds(rotated, { alphaThreshold })

  if (!sourceBounds) {
    throw new Error('No se puede normalizar un recorte completamente transparente.')
  }

  const trimmed = await sharp(rotated).trim({ background: '#00000000' }).png().toBuffer()
  const trimmedBounds = await measureOpaqueBounds(trimmed, { alphaThreshold })

  if (!trimmedBounds) {
    throw new Error('No se puede normalizar un recorte sin píxeles opacos.')
  }

  const occupancyBox = Math.round(canvas * occupancy)
  const sourceLongestAxis = Math.max(
    trimmedBounds.opaqueWidth,
    trimmedBounds.opaqueHeight,
  )
  const enlargementRatio = occupancyBox / sourceLongestAxis

  if (allowEnlargement && enlargementRatio > maxEnlargementRatio) {
    throw new Error(
      `La ampliación solicitada (${enlargementRatio.toFixed(3)}×) supera el máximo permitido (${maxEnlargementRatio.toFixed(3)}×); fuente opaca ${trimmedBounds.opaqueWidth}×${trimmedBounds.opaqueHeight} px, objetivo ${occupancyBox} px.`,
    )
  }

  const extracted = await sharp(trimmed)
    .extract({
      left: trimmedBounds.left,
      top: trimmedBounds.top,
      width: trimmedBounds.opaqueWidth,
      height: trimmedBounds.opaqueHeight,
    })
    .resize({
      width: occupancyBox,
      height: occupancyBox,
      fit: 'inside',
      withoutEnlargement: !allowEnlargement,
    })
    .ensureAlpha()
    .toBuffer()
  const resized = await sharp(extracted).metadata()
  const horizontalSpace = canvas - (resized.width ?? 0)
  const verticalSpace = canvas - (resized.height ?? 0)

  return sharp(extracted)
    .extend({
      top: Math.floor(verticalSpace / 2),
      bottom: Math.ceil(verticalSpace / 2),
      left: Math.floor(horizontalSpace / 2),
      right: Math.ceil(horizontalSpace / 2),
      background: '#00000000',
    })
    .webp({
      lossless: true,
      alphaQuality: 100,
      effort: 6,
      exact: options.webpExactTransparentRgb === true,
    })
    .toBuffer()
}
