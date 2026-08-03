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

export const TASK_7_PRODUCT_SLUGS = Object.freeze([
  'noctua-nh-d15',
  'thermalright-peerless-assassin-120-se',
  'arctic-liquid-freezer-iii-360',
  'lian-li-lancool-216',
  'nzxt-h5-flow',
  'cooler-master-nr200p',
  'arctic-p12-pwm-pst-5-pack',
])

const WHITE_FLOOD_MATTE = Object.freeze({
  luma: 248,
  chroma: 18,
  featherPixels: 3,
  despill: true,
})

function enclosedWhiteMatte(preserveWhiteRegions = []) {
  return Object.freeze({
    ...WHITE_FLOOD_MATTE,
    enclosedWhiteMinArea: 48,
    preserveWhiteRegions: Object.freeze(
      preserveWhiteRegions.map((region) => Object.freeze(region)),
    ),
  })
}

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
  'noctua-nh-d15': Object.freeze({
    operation: 'white-flood-matte',
    sourceExtension: 'jpg',
    sourceSha256: '0293ACA1B0CBA40E204D8CB34EEF1D80F17423B4C098E34CBD80004C0A795068',
    expectedOutputSha256: '697AB656BA897989A6421EB2F74AD2FAAA2E3CD6450CE9A0270A18E0692D8D12',
    matte: enclosedWhiteMatte(),
    webpExactTransparentRgb: true,
  }),
  'thermalright-peerless-assassin-120-se': Object.freeze({
    operation: 'white-flood-matte',
    sourceExtension: 'jpg',
    sourceSha256: 'B1084B27D34F736D8CB4443E77852355D8D58C43AA46F7F161FFA2B6DB53B411',
    expectedOutputSha256: '5D3D11C89BCAEED40283F47458005B7DC768DEA3FF04AF709F9744E1EC02EE89',
    matte: enclosedWhiteMatte([
      { centerX: 400, centerY: 590, radius: 70 },
    ]),
    edgeColorPropagation: Object.freeze({ luma: 180, chroma: 24, maxDistance: 8 }),
    webpExactTransparentRgb: true,
  }),
  'arctic-liquid-freezer-iii-360': Object.freeze({
    operation: 'white-flood-matte',
    sourceExtension: 'jpg',
    sourceSha256: 'BD98DF5C938824AD3492C168C30C8417ACD7EF32B65A9D04D1B19D382DF70ACE',
    expectedOutputSha256: 'D4E5F6F04C7E71AA80CA84E2BEAE5BABB2531A42EF3F22D59FE96365ACA1D9C5',
    matte: enclosedWhiteMatte([
      { centerX: 800, centerY: 440, radius: 120 },
      { centerX: 800, centerY: 890, radius: 120 },
      { centerX: 800, centerY: 1340, radius: 120 },
    ]),
    edgeColorPropagation: Object.freeze({ luma: 180, chroma: 24, maxDistance: 8 }),
    webpExactTransparentRgb: true,
  }),
  'lian-li-lancool-216': Object.freeze({
    operation: 'native-alpha-prune-diffuse',
    sourceExtension: 'png',
    sourceSha256: '1124E866B9C697AC22DD6342DCD68860760AA9EE7498E8F68D4A5BC796455D59',
    expectedOutputSha256: '9982250E12462F7E1CC73D78FC36E696822BEECF73BB75385A2E0812A8148B79',
    alphaPrune: Object.freeze({ coreAlpha: 160, retainDistance: 2 }),
    webpExactTransparentRgb: true,
  }),
  'nzxt-h5-flow': Object.freeze({
    operation: 'native-alpha-tone-lift',
    sourceExtension: 'png',
    sourceSha256: '29B9151B2717A5C5B1D25797948400F315BB14BFFE2A0E2221C4BC249E8C4B5C',
    expectedOutputSha256: '611DB7F2A63DA2DE4A38D69195898B2AFAC6B2B720E4901BE19D1D8D4F47FC78',
    tone: Object.freeze({ gamma: 1.45 }),
    webpExactTransparentRgb: true,
  }),
  'cooler-master-nr200p': Object.freeze({
    operation: 'native-alpha-tone-lift',
    sourceExtension: 'png',
    sourceSha256: '1B64481C0A7CF7F3E8645FD73C0C64A3CC65E74299EFD33A652DFFFD63F8335A',
    expectedOutputSha256: '6F2A28A818C0E3C53DB96DF9F3504976AA7563822FF553E130A1CE29DD9CA85C',
    tone: Object.freeze({ gamma: 1.7 }),
    webpExactTransparentRgb: true,
  }),
  'arctic-p12-pwm-pst-5-pack': Object.freeze({
    operation: 'white-flood-five-copy-grid',
    sourceExtension: 'jpg',
    sourceSha256: '4349D68E69267CA9E446D826E8923BE8B7AE5EA42E493A7D77AFA4C6E5D08EE8',
    expectedOutputSha256: '926E5C2872E7A2EBA3175FE745E3F35EDD08D1A33003479851C35E6B156AD0C1',
    matte: enclosedWhiteMatte([
      { centerX: 600, centerY: 600, radius: 125 },
    ]),
    layout: Object.freeze({
      width: 1440,
      height: 960,
      itemSize: 440,
      positions: Object.freeze([
        Object.freeze({ left: 20, top: 20 }),
        Object.freeze({ left: 500, top: 20 }),
        Object.freeze({ left: 980, top: 20 }),
        Object.freeze({ left: 260, top: 500 }),
        Object.freeze({ left: 740, top: 500 }),
      ]),
    }),
    edgeColorPropagation: Object.freeze({ luma: 180, chroma: 24, maxDistance: 8 }),
    webpExactTransparentRgb: true,
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
  const enclosedWhiteMinArea = options?.enclosedWhiteMinArea
  if (
    enclosedWhiteMinArea !== undefined &&
    (!Number.isInteger(enclosedWhiteMinArea) || enclosedWhiteMinArea < 1)
  ) {
    throw new Error(
      `enclosedWhiteMinArea debe ser un entero positivo; se recibió ${enclosedWhiteMinArea}.`,
    )
  }
  const preserveWhiteRegions = options?.preserveWhiteRegions ?? []
  if (!Array.isArray(preserveWhiteRegions)) {
    throw new Error('preserveWhiteRegions debe ser una lista de regiones.')
  }
  for (const region of preserveWhiteRegions) {
    const validRectangle =
      Number.isInteger(region?.left) &&
      Number.isInteger(region?.top) &&
      Number.isInteger(region?.width) &&
      Number.isInteger(region?.height) &&
      region.left >= 0 &&
      region.top >= 0 &&
      region.width >= 1 &&
      region.height >= 1
    const validCircle =
      Number.isInteger(region?.centerX) &&
      Number.isInteger(region?.centerY) &&
      Number.isInteger(region?.radius) &&
      region.centerX >= 0 &&
      region.centerY >= 0 &&
      region.radius >= 1
    if (!validRectangle && !validCircle) {
      throw new Error('Cada región blanca protegida debe declarar enteros positivos válidos.')
    }
  }
  return {
    luma,
    chroma,
    featherPixels,
    despill: options.despill === true,
    enclosedWhiteMinArea,
    preserveWhiteRegions,
  }
}

function isWhiteCandidate(data, offset, options) {
  const red = data[offset]
  const green = data[offset + 1]
  const blue = data[offset + 2]
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const chroma = maximum - minimum
  const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722
  return chroma <= options.chroma && luma >= options.luma
}

function enqueueWhiteBackground(index, state) {
  if (state.background[index]) return
  const offset = index * state.channels
  if (!isWhiteCandidate(state.data, offset, state.options)) return
  state.background[index] = 1
  state.queue[state.tail] = index
  state.tail += 1
}

function regionContains(region, x, y) {
  if (Number.isInteger(region.centerX)) {
    const horizontal = x - region.centerX
    const vertical = y - region.centerY
    return horizontal * horizontal + vertical * vertical <= region.radius * region.radius
  }
  return (
    x >= region.left &&
    x < region.left + region.width &&
    y >= region.top &&
    y < region.top + region.height
  )
}

function markEnclosedWhiteBackground(data, info, options, background) {
  if (!options.enclosedWhiteMinArea) return background
  const pixelCount = info.width * info.height
  const visited = new Uint8Array(pixelCount)
  const queue = new Int32Array(pixelCount)

  for (let start = 0; start < pixelCount; start += 1) {
    if (
      background[start] ||
      visited[start] ||
      !isWhiteCandidate(data, start * info.channels, options)
    ) {
      continue
    }
    const component = []
    let protectedComponent = false
    let head = 0
    let tail = 1
    queue[0] = start
    visited[start] = 1
    while (head < tail) {
      const index = queue[head]
      head += 1
      component.push(index)
      const x = index % info.width
      const y = Math.floor(index / info.width)
      if (options.preserveWhiteRegions.some((region) => regionContains(region, x, y))) {
        protectedComponent = true
      }
      for (const neighbor of [
        x > 0 ? index - 1 : -1,
        x + 1 < info.width ? index + 1 : -1,
        y > 0 ? index - info.width : -1,
        y + 1 < info.height ? index + info.width : -1,
      ]) {
        if (
          neighbor < 0 ||
          background[neighbor] ||
          visited[neighbor] ||
          !isWhiteCandidate(data, neighbor * info.channels, options)
        ) {
          continue
        }
        visited[neighbor] = 1
        queue[tail] = neighbor
        tail += 1
      }
    }
    if (component.length < options.enclosedWhiteMinArea || protectedComponent) continue
    for (const index of component) background[index] = 1
  }
  return background
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
  const background = markEnclosedWhiteBackground(
    data,
    info,
    options,
    floodWhiteBackground(data, info, options),
  )
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

export async function liftDarkProductRgb(input, toneOptions) {
  const gamma = toneOptions?.gamma
  if (!Number.isFinite(gamma) || gamma <= 1 || gamma > 3) {
    throw new Error(`gamma debe ser mayor a 1 y menor o igual a 3; se recibió ${gamma}.`)
  }
  const { data, info } = await sharp(input)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const exponent = 1 / gamma
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (data[offset + 3] === 0) {
      data[offset] = 0
      data[offset + 1] = 0
      data[offset + 2] = 0
      continue
    }
    data[offset] = Math.round(255 * Math.pow(data[offset] / 255, exponent))
    data[offset + 1] = Math.round(255 * Math.pow(data[offset + 1] / 255, exponent))
    data[offset + 2] = Math.round(255 * Math.pow(data[offset + 2] / 255, exponent))
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer()
}

function validateAlphaPruneOptions(options) {
  const coreAlpha = options?.coreAlpha
  const retainDistance = options?.retainDistance
  if (!Number.isInteger(coreAlpha) || coreAlpha < 1 || coreAlpha > 255) {
    throw new Error(`coreAlpha debe ser un entero entre 1 y 255; se recibió ${coreAlpha}.`)
  }
  if (!Number.isInteger(retainDistance) || retainDistance < 0 || retainDistance > 16) {
    throw new Error(
      `retainDistance debe ser un entero entre 0 y 16; se recibió ${retainDistance}.`,
    )
  }
  return { coreAlpha, retainDistance }
}

export async function pruneDiffuseNativeAlpha(input, pruneOptions) {
  const options = validateAlphaPruneOptions(pruneOptions)
  const { data, info } = await sharp(input)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixelCount = info.width * info.height
  const retained = new Uint8Array(pixelCount)
  const distance = new Uint8Array(pixelCount)
  distance.fill(255)
  const queue = new Int32Array(pixelCount)
  let head = 0
  let tail = 0

  for (let index = 0; index < pixelCount; index += 1) {
    const alpha = data[index * info.channels + 3]
    if (alpha < options.coreAlpha) continue
    retained[index] = 1
    distance[index] = 0
    queue[tail] = index
    tail += 1
  }
  if (tail === 0) throw new Error('No se encontró sujeto alfa con el umbral coreAlpha declarado.')

  while (head < tail) {
    const index = queue[head]
    head += 1
    const currentDistance = distance[index]
    if (currentDistance >= options.retainDistance) continue
    const x = index % info.width
    const y = Math.floor(index / info.width)
    for (const neighbor of [
      x > 0 ? index - 1 : -1,
      x + 1 < info.width ? index + 1 : -1,
      y > 0 ? index - info.width : -1,
      y + 1 < info.height ? index + info.width : -1,
    ]) {
      if (neighbor < 0 || retained[neighbor]) continue
      const alpha = data[neighbor * info.channels + 3]
      if (alpha === 0) continue
      retained[neighbor] = 1
      distance[neighbor] = currentDistance + 1
      queue[tail] = neighbor
      tail += 1
    }
  }

  const output = Buffer.from(data)
  for (let index = 0; index < pixelCount; index += 1) {
    if (retained[index]) continue
    const offset = index * info.channels
    output[offset] = 0
    output[offset + 1] = 0
    output[offset + 2] = 0
    output[offset + 3] = 0
  }
  return sharp(output, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer()
}

function validateFiveCopyLayout(layout) {
  const width = layout?.width
  const height = layout?.height
  const itemSize = layout?.itemSize
  const positions = layout?.positions
  if (![width, height, itemSize].every((value) => Number.isInteger(value) && value > 0)) {
    throw new Error('El layout de cinco copias requiere width, height e itemSize enteros positivos.')
  }
  if (!Array.isArray(positions) || positions.length !== 5) {
    throw new Error('El layout debe declarar exactamente cinco posiciones.')
  }
  for (const position of positions) {
    if (
      !Number.isInteger(position?.left) ||
      !Number.isInteger(position?.top) ||
      position.left < 0 ||
      position.top < 0 ||
      position.left + itemSize > width ||
      position.top + itemSize > height
    ) {
      throw new Error('Cada copia debe quedar completamente dentro del layout declarado.')
    }
  }
  return { width, height, itemSize, positions }
}

export async function arrangeFiveIdenticalCopies(input, layoutOptions) {
  const layout = validateFiveCopyLayout(layoutOptions)
  const item = await sharp(input)
    .rotate()
    .ensureAlpha()
    .trim({ background: '#00000000' })
    .resize({
      width: layout.itemSize,
      height: layout.itemSize,
      fit: 'contain',
      background: '#00000000',
    })
    .png()
    .toBuffer()
  return sharp({
    create: {
      width: layout.width,
      height: layout.height,
      channels: 4,
      background: '#00000000',
    },
  })
    .composite(layout.positions.map((position) => ({ input: item, ...position })))
    .png()
    .toBuffer()
}

function validateEdgeColorPropagationOptions(options) {
  const luma = options?.luma
  const chroma = options?.chroma
  const maxDistance = options?.maxDistance
  if (!Number.isFinite(luma) || luma < 0 || luma > 255) {
    throw new Error(`edge luma debe estar entre 0 y 255; se recibió ${luma}.`)
  }
  if (!Number.isFinite(chroma) || chroma < 0 || chroma > 255) {
    throw new Error(`edge chroma debe estar entre 0 y 255; se recibió ${chroma}.`)
  }
  if (!Number.isInteger(maxDistance) || maxDistance < 1 || maxDistance > 32) {
    throw new Error(
      `edge maxDistance debe ser un entero entre 1 y 32; se recibió ${maxDistance}.`,
    )
  }
  return { luma, chroma, maxDistance }
}

function isBrightNeutral(data, offset, options) {
  const red = data[offset]
  const green = data[offset + 1]
  const blue = data[offset + 2]
  const channelChroma = Math.max(red, green, blue) - Math.min(red, green, blue)
  const channelLuma = red * 0.2126 + green * 0.7152 + blue * 0.0722
  return channelLuma >= options.luma && channelChroma <= options.chroma
}

function isDarkNeutralPropagationSource(data, offset, options) {
  const red = data[offset]
  const green = data[offset + 1]
  const blue = data[offset + 2]
  const channelChroma = Math.max(red, green, blue) - Math.min(red, green, blue)
  const channelLuma = red * 0.2126 + green * 0.7152 + blue * 0.0722
  return channelLuma < options.luma && channelChroma <= options.chroma
}

function orthogonalNeighbors(index, width, height) {
  const x = index % width
  const y = Math.floor(index / width)
  return [
    x > 0 ? index - 1 : -1,
    x + 1 < width ? index + 1 : -1,
    y > 0 ? index - width : -1,
    y + 1 < height ? index + width : -1,
  ]
}

export async function decontaminateNeutralBoundaryRgb(input, propagationOptions) {
  const options = validateEdgeColorPropagationOptions(propagationOptions)
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixelCount = info.width * info.height
  const edgeDistance = new Uint8Array(pixelCount)
  edgeDistance.fill(255)
  const queue = new Int32Array(pixelCount)
  let head = 0
  let tail = 0

  for (let index = 0; index < pixelCount; index += 1) {
    if (data[index * info.channels + 3] === 0) continue
    const touchesTransparency = orthogonalNeighbors(index, info.width, info.height).some(
      (neighbor) => neighbor >= 0 && data[neighbor * info.channels + 3] === 0,
    )
    if (!touchesTransparency) continue
    edgeDistance[index] = 1
    queue[tail] = index
    tail += 1
  }

  while (head < tail) {
    const index = queue[head]
    head += 1
    const distance = edgeDistance[index]
    if (distance >= options.maxDistance) continue
    for (const neighbor of orthogonalNeighbors(index, info.width, info.height)) {
      if (
        neighbor < 0 ||
        edgeDistance[neighbor] !== 255 ||
        data[neighbor * info.channels + 3] === 0
      ) {
        continue
      }
      edgeDistance[neighbor] = distance + 1
      queue[tail] = neighbor
      tail += 1
    }
  }

  const contaminated = new Uint8Array(pixelCount)
  for (let index = 0; index < pixelCount; index += 1) {
    if (
      edgeDistance[index] <= options.maxDistance &&
      isBrightNeutral(data, index * info.channels, options)
    ) {
      contaminated[index] = 1
    }
  }

  const output = Buffer.from(data)
  const resolved = new Uint8Array(pixelCount)
  head = 0
  tail = 0
  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * info.channels
    if (
      contaminated[index] ||
      data[offset + 3] === 0 ||
      !isDarkNeutralPropagationSource(data, offset, options)
    ) {
      continue
    }
    const bordersContamination = orthogonalNeighbors(index, info.width, info.height).some(
      (neighbor) => neighbor >= 0 && contaminated[neighbor] === 1,
    )
    if (!bordersContamination) continue
    resolved[index] = 1
    queue[tail] = index
    tail += 1
  }

  while (head < tail) {
    const index = queue[head]
    head += 1
    const sourceOffset = index * info.channels
    for (const neighbor of orthogonalNeighbors(index, info.width, info.height)) {
      if (neighbor < 0 || !contaminated[neighbor] || resolved[neighbor]) continue
      const targetOffset = neighbor * info.channels
      output[targetOffset] = output[sourceOffset]
      output[targetOffset + 1] = output[sourceOffset + 1]
      output[targetOffset + 2] = output[sourceOffset + 2]
      resolved[neighbor] = 1
      queue[tail] = neighbor
      tail += 1
    }
  }

  // JPEG antialias can leave tiny alpha islands separated by transparent pixels.
  // Sample their nearest dark-neutral subject color without reconnecting or removing the island.
  const fallbackRadius = options.maxDistance * 16
  for (let index = 0; index < pixelCount; index += 1) {
    if (!contaminated[index] || resolved[index]) continue
    const originX = index % info.width
    const originY = Math.floor(index / info.width)
    let sourceIndex = -1
    for (let radius = 1; radius <= fallbackRadius && sourceIndex < 0; radius += 1) {
      let strongestAlpha = -1
      for (let vertical = -radius; vertical <= radius; vertical += 1) {
        for (let horizontal = -radius; horizontal <= radius; horizontal += 1) {
          if (Math.abs(horizontal) !== radius && Math.abs(vertical) !== radius) continue
          const x = originX + horizontal
          const y = originY + vertical
          if (x < 0 || x >= info.width || y < 0 || y >= info.height) continue
          const candidate = y * info.width + x
          const candidateOffset = candidate * info.channels
          const alpha = data[candidateOffset + 3]
          if (
            alpha === 0 ||
            alpha <= strongestAlpha ||
            !isDarkNeutralPropagationSource(data, candidateOffset, options)
          ) {
            continue
          }
          strongestAlpha = alpha
          sourceIndex = candidate
        }
      }
    }
    if (sourceIndex < 0) continue
    const sourceOffset = sourceIndex * info.channels
    const targetOffset = index * info.channels
    output[targetOffset] = output[sourceOffset]
    output[targetOffset + 1] = output[sourceOffset + 1]
    output[targetOffset + 2] = output[sourceOffset + 2]
    resolved[index] = 1
  }

  return sharp(output, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .webp({ lossless: true, alphaQuality: 100, effort: 6, exact: true })
    .toBuffer()
}

export async function rebuildProductCutout(source, recipe) {
  if (
    !recipe ||
    ![
      'native-alpha',
      'white-flood-matte',
      'native-alpha-prune-diffuse',
      'native-alpha-tone-lift',
      'white-flood-five-copy-grid',
    ].includes(recipe.operation)
  ) {
    throw new Error('La receta debe declarar una operation soportada.')
  }
  if (!recipe.policy) throw new Error('La receta ejecutable requiere policy explícita.')
  let cutout
  if (recipe.operation === 'native-alpha') cutout = source
  if (recipe.operation === 'white-flood-matte') {
    cutout = await removeWhiteBackground(source, recipe.matte)
  }
  if (recipe.operation === 'native-alpha-prune-diffuse') {
    cutout = await pruneDiffuseNativeAlpha(source, recipe.alphaPrune)
  }
  if (recipe.operation === 'native-alpha-tone-lift') {
    cutout = await liftDarkProductRgb(source, recipe.tone)
  }
  if (recipe.operation === 'white-flood-five-copy-grid') {
    const single = await removeWhiteBackground(source, recipe.matte)
    cutout = await arrangeFiveIdenticalCopies(single, recipe.layout)
  }
  const normalized = await normalizeProductCutout(cutout, {
    ...recipe.policy,
    webpExactTransparentRgb: recipe.webpExactTransparentRgb === true,
  })
  if (recipe.edgeColorPropagation) {
    return decontaminateNeutralBoundaryRgb(normalized, recipe.edgeColorPropagation)
  }
  return normalized
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex').toUpperCase()
}
