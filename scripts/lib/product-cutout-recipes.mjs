import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { normalizeProductCutout } from './product-cutout.mjs'

export const TASK_6_PRODUCT_SLUGS = Object.freeze([
  'kingston-fury-beast-ddr5-16gb-5600',
  'samsung-990-pro-2tb',
  'crucial-p3-plus-1tb',
  'samsung-870-evo-1tb',
  'seasonic-focus-gx-850',
])

const WHITE_FLOOD_MATTE = Object.freeze({
  luma: 248,
  chroma: 18,
  featherPixels: 3,
  despill: true,
})

export const PRODUCT_CUTOUT_RECIPES = Object.freeze({
  'kingston-fury-beast-ddr5-16gb-5600': Object.freeze({
    operation: 'white-flood-matte',
    sourceExtension: 'jpg',
    sourceSha256: '9E80FD2E86807ED125FEA34842DEDD2A43555F44CB41F5EC1D579BBE70BD238A',
    expectedOutputSha256: 'BCCC348EE3F1ED279CF8DB0BD0B4CF9A2B335B59B319F5A2D6CA4923FA96E3B1',
    matte: WHITE_FLOOD_MATTE,
  }),
  'samsung-990-pro-2tb': Object.freeze({
    operation: 'native-alpha',
    sourceExtension: 'png',
    sourceSha256: '264B4CBAF015AB7F6F7881E48EA35888050C34CC070DE23A70BFD5896685497F',
    expectedOutputSha256: '9E3328B7D8366A1EBF61892F0164F03A61B42A92BBB2F8595BCEE13813EC9334',
  }),
  'crucial-p3-plus-1tb': Object.freeze({
    operation: 'white-flood-matte',
    sourceExtension: 'jpg',
    sourceSha256: '336EA4453CB15BAFF2C3D31CB338A1503EFCC3FB58E3F2931E8D00DE3817ECA0',
    expectedOutputSha256: 'DED434125BD372FED8AF1AE710CC0DB1D0366C60148C1E737CC05D6C1DCDC1BE',
    matte: WHITE_FLOOD_MATTE,
  }),
  'samsung-870-evo-1tb': Object.freeze({
    operation: 'native-alpha',
    sourceExtension: 'png',
    sourceSha256: 'A04175482969BC50E034048912433245A44FD6656E6889D88E9F61C1F349486C',
    expectedOutputSha256: '79192BB9F8773EFD7A95D920A927424FCEB56BAC3208FC9E97E1DB393D3FCCFE',
  }),
  'seasonic-focus-gx-850': Object.freeze({
    operation: 'white-flood-matte',
    sourceExtension: 'jpg',
    sourceSha256: 'CE5FFC9D0E7BC86E3E40168D7DBDD91FA2502B1973BB607D5E6E95316D8A11C9',
    expectedOutputSha256: '74F17496CE6E99D227EC6EA8773EC1CE368C7D39E204B0ABC2BE3CE916B4D553',
    matte: WHITE_FLOOD_MATTE,
  }),
})

function validateMatteOptions(options) {
  const luma = options?.luma
  const chroma = options?.chroma
  const featherPixels = options?.featherPixels
  if (!Number.isFinite(luma) || luma < 0 || luma > 255) {
    throw new Error(`luma debe estar entre 0 y 255; se recibió ${luma}.`)
  }
  if (!Number.isFinite(chroma) || chroma < 0 || chroma > 255) {
    throw new Error(`chroma debe estar entre 0 y 255; se recibió ${chroma}.`)
  }
  if (!Number.isInteger(featherPixels) || featherPixels < 1 || featherPixels > 8) {
    throw new Error(`featherPixels debe ser un entero entre 1 y 8; se recibió ${featherPixels}.`)
  }
  return { luma, chroma, featherPixels, despill: options.despill === true }
}

function enqueueWhiteBackground(index, state) {
  if (state.background[index]) return
  const offset = index * state.channels
  const red = state.data[offset]
  const green = state.data[offset + 1]
  const blue = state.data[offset + 2]
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const chroma = maximum - minimum
  const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722
  if (chroma > state.options.chroma || luma < state.options.luma) return
  state.background[index] = 1
  state.queue[state.tail] = index
  state.tail += 1
}

function floodWhiteBackground(data, info, options) {
  const pixelCount = info.width * info.height
  const state = {
    data,
    channels: info.channels,
    options,
    background: new Uint8Array(pixelCount),
    queue: new Int32Array(pixelCount),
    head: 0,
    tail: 0,
  }

  for (let x = 0; x < info.width; x += 1) {
    enqueueWhiteBackground(x, state)
    enqueueWhiteBackground((info.height - 1) * info.width + x, state)
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueueWhiteBackground(y * info.width, state)
    enqueueWhiteBackground(y * info.width + info.width - 1, state)
  }

  while (state.head < state.tail) {
    const index = state.queue[state.head]
    state.head += 1
    const x = index % info.width
    const y = Math.floor(index / info.width)
    if (x > 0) enqueueWhiteBackground(index - 1, state)
    if (x + 1 < info.width) enqueueWhiteBackground(index + 1, state)
    if (y > 0) enqueueWhiteBackground(index - info.width, state)
    if (y + 1 < info.height) enqueueWhiteBackground(index + info.width, state)
  }
  return state.background
}

function retainLargestForeground(background, width, height) {
  const pixelCount = width * height
  const visited = new Uint8Array(pixelCount)
  const queue = new Int32Array(pixelCount)
  let largest = []

  for (let start = 0; start < pixelCount; start += 1) {
    if (background[start] || visited[start]) continue
    const component = []
    let head = 0
    let tail = 1
    queue[0] = start
    visited[start] = 1
    while (head < tail) {
      const index = queue[head]
      head += 1
      component.push(index)
      const x = index % width
      const y = Math.floor(index / width)
      const neighbors = [
        x > 0 ? index - 1 : -1,
        x + 1 < width ? index + 1 : -1,
        y > 0 ? index - width : -1,
        y + 1 < height ? index + width : -1,
      ]
      for (const neighbor of neighbors) {
        if (neighbor < 0 || background[neighbor] || visited[neighbor]) continue
        visited[neighbor] = 1
        queue[tail] = neighbor
        tail += 1
      }
    }
    if (component.length > largest.length) largest = component
  }

  const retained = new Uint8Array(pixelCount)
  for (const index of largest) retained[index] = 1
  return retained
}

function measureEdgeDepth(retained, width, height, maximumDepth) {
  const pixelCount = width * height
  const distance = new Uint8Array(pixelCount)
  const queue = new Int32Array(pixelCount)
  let head = 0
  let tail = 0

  for (let index = 0; index < pixelCount; index += 1) {
    if (retained[index]) continue
    queue[tail] = index
    tail += 1
  }

  while (head < tail) {
    const index = queue[head]
    head += 1
    const currentDepth = distance[index]
    if (currentDepth >= maximumDepth) continue
    const x = index % width
    const y = Math.floor(index / width)
    const neighbors = [
      x > 0 ? index - 1 : -1,
      x + 1 < width ? index + 1 : -1,
      y > 0 ? index - width : -1,
      y + 1 < height ? index + width : -1,
    ]
    for (const neighbor of neighbors) {
      if (neighbor < 0 || !retained[neighbor] || distance[neighbor] !== 0) continue
      distance[neighbor] = currentDepth + 1
      queue[tail] = neighbor
      tail += 1
    }
  }
  return distance
}

function unblendFromWhite(channel, alpha) {
  if (alpha <= 0) return 0
  if (alpha >= 255) return channel
  return Math.max(0, Math.min(255, Math.round((channel * 255 - 255 * (255 - alpha)) / alpha)))
}

export async function removeWhiteBackground(input, matteOptions) {
  const options = validateMatteOptions(matteOptions)
  const { data, info } = await sharp(input)
    .rotate()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const background = floodWhiteBackground(data, info, options)
  const retained = retainLargestForeground(background, info.width, info.height)
  const depth = measureEdgeDepth(retained, info.width, info.height, options.featherPixels)
  const output = Buffer.alloc(info.width * info.height * 4)

  for (let index = 0; index < retained.length; index += 1) {
    if (!retained[index]) continue
    const sourceOffset = index * info.channels
    const outputOffset = index * 4
    const red = data[sourceOffset]
    const green = data[sourceOffset + 1]
    const blue = data[sourceOffset + 2]
    const edgeDepth = depth[index]
    let alpha = 255
    if (edgeDepth > 0 && edgeDepth <= options.featherPixels) {
      const colorAlpha = Math.min(255, (255 - Math.min(red, green, blue)) * 5)
      const depthFloor = Math.round(((edgeDepth - 1) / options.featherPixels) * 255)
      alpha = Math.max(colorAlpha, depthFloor)
    }
    output[outputOffset] = options.despill ? unblendFromWhite(red, alpha) : red
    output[outputOffset + 1] = options.despill ? unblendFromWhite(green, alpha) : green
    output[outputOffset + 2] = options.despill ? unblendFromWhite(blue, alpha) : blue
    output[outputOffset + 3] = alpha
  }

  return sharp(output, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

export async function rebuildProductCutout(source, recipe) {
  if (!recipe || !['native-alpha', 'white-flood-matte'].includes(recipe.operation)) {
    throw new Error('La receta debe declarar operation nativa o white-flood-matte.')
  }
  if (!recipe.policy) throw new Error('La receta ejecutable requiere policy explícita.')
  const cutout =
    recipe.operation === 'native-alpha'
      ? source
      : await removeWhiteBackground(source, recipe.matte)
  return normalizeProductCutout(cutout, recipe.policy)
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex').toUpperCase()
}
