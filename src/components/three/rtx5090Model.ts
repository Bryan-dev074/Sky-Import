import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export type Rtx5090ReviewPass =
  | 'blockout'
  | 'structural'
  | 'form'
  | 'material'
  | 'surface'
  | 'lighting'
  | 'interaction'
  | 'final'

export interface Rtx5090Part {
  id: string
  label: string
  group: THREE.Group
  home: THREE.Vector3
  homeQuaternion: THREE.Quaternion
  explodeOffset: THREE.Vector3
  explodeRotation: THREE.Euler
  start: number
  end: number
}

export interface Rtx5090Runtime {
  root: THREE.Group
  parts: Rtx5090Part[]
  fans: THREE.Group[]
  pickables: THREE.Object3D[]
  geometries: THREE.BufferGeometry[]
  materials: THREE.Material[]
  textures: THREE.Texture[]
}

const PASS_RANK: Record<Rtx5090ReviewPass, number> = {
  blockout: 0,
  structural: 1,
  form: 2,
  material: 3,
  surface: 4,
  lighting: 5,
  interaction: 6,
  final: 7,
}

function extrudeCentered(shape: THREE.Shape, depth: number, bevelSize = 0.025) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    bevelEnabled: bevelSize > 0,
    bevelSegments: 3,
    bevelSize,
    bevelThickness: Math.min(bevelSize, depth * 0.2),
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.computeVertexNormals()
  return geometry
}

function labelTexture(text: string, color: string, width = 512, height = 96) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context) {
    context.clearRect(0, 0, width, height)
    context.fillStyle = color
    context.font = `700 ${Math.round(height * 0.42)}px Arial, sans-serif`
    context.textBaseline = 'middle'
    context.letterSpacing = `${Math.round(height * 0.06)}px`
    context.fillText(text, Math.round(height * 0.18), height / 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function configureMap(texture: THREE.Texture, repeatX: number, repeatY: number, color = false) {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.anisotropy = 8
  if (color) texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createRtx5090Model(pass: Rtx5090ReviewPass = 'final'): Rtx5090Runtime {
  const rank = PASS_RANK[pass]
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []
  const pickables: THREE.Object3D[] = []
  const parts: Rtx5090Part[] = []
  const fans: THREE.Group[] = []

  const keepGeometry = <T extends THREE.BufferGeometry>(geometry: T) => {
    geometries.push(geometry)
    return geometry
  }
  const keepMaterial = <T extends THREE.Material>(material: T) => {
    materials.push(material)
    return material
  }

  const clay = keepMaterial(
    new THREE.MeshStandardMaterial({ color: 0x66717a, roughness: 0.66, metalness: 0.16 }),
  )
  const clayDark = keepMaterial(
    new THREE.MeshStandardMaterial({ color: 0x242b31, roughness: 0.76, metalness: 0.08 }),
  )

  const textureLoader = new THREE.TextureLoader()
  const frameRoughness = configureMap(
    textureLoader.load('/3d/rtx5090/pbr/frame/frame-metal_roughness.png'),
    3,
    2,
  )
  const frameNormal = configureMap(
    textureLoader.load('/3d/rtx5090/pbr/frame/frame-metal_normal.png'),
    3,
    2,
  )
  const thermalRoughness = configureMap(
    textureLoader.load('/3d/rtx5090/pbr/thermal/thermal-black_roughness.png'),
    3,
    3,
  )
  const thermalNormal = configureMap(
    textureLoader.load('/3d/rtx5090/pbr/thermal/thermal-black_normal.png'),
    3,
    3,
  )
  textures.push(frameRoughness, frameNormal, thermalRoughness, thermalNormal)

  const frameMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x4f565a,
      metalness: 0.95,
      roughness: 0.23,
      roughnessMap: rank >= PASS_RANK.surface ? frameRoughness : null,
      normalMap: rank >= PASS_RANK.surface ? frameNormal : null,
      normalScale: new THREE.Vector2(0.045, 0.045),
      clearcoat: 0.18,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.12,
    }),
  )
  const frameEdgeMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0xc8cdcf,
      metalness: 0.98,
      roughness: 0.15,
      envMapIntensity: 1.5,
    }),
  )
  const thermalMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x090c0e,
      metalness: 0.82,
      roughness: 0.4,
      roughnessMap: rank >= PASS_RANK.surface ? thermalRoughness : null,
      normalMap: rank >= PASS_RANK.surface ? thermalNormal : null,
      normalScale: new THREE.Vector2(0.035, 0.035),
      envMapIntensity: 0.82,
    }),
  )
  const chassisMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x161b1e,
      metalness: 0.72,
      roughness: 0.5,
      clearcoat: 0.04,
      envMapIntensity: 0.86,
    }),
  )
  const fanMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x07090a,
      metalness: 0.35,
      roughness: 0.46,
      clearcoat: 0.12,
      clearcoatRoughness: 0.36,
    }),
  )
  const finMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x252b2e,
      metalness: 0.88,
      roughness: 0.42,
      envMapIntensity: 1.05,
    }),
  )
  const goldMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({ color: 0xc89d3f, metalness: 1, roughness: 0.27 }),
  )
  const labelMaterial = keepMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xeefcff,
      emissive: 0xbcefff,
      emissiveIntensity: 1.4,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  const selectedMaterial = keepMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x7ce8ff,
      emissive: 0x0b6684,
      emissiveIntensity: 0.8,
      metalness: 0.72,
      roughness: 0.22,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )

  const materialFor = (actual: THREE.Material, dark = false) =>
    rank >= PASS_RANK.material ? actual : dark ? clayDark : clay

  const root = new THREE.Group()
  root.name = 'rtx5090-root'
  root.userData.sculptComponentId = 'root'

  const registerPart = (
    id: string,
    label: string,
    group: THREE.Group,
    explodeOffset: [number, number, number],
    explodeRotation: [number, number, number],
    start: number,
    end: number,
  ) => {
    group.name = id
    group.userData.sculptPart = id
    group.userData.selectablePart = true
    const part: Rtx5090Part = {
      id,
      label,
      group,
      home: group.position.clone(),
      homeQuaternion: group.quaternion.clone(),
      explodeOffset: new THREE.Vector3(...explodeOffset),
      explodeRotation: new THREE.Euler(...explodeRotation),
      start,
      end,
    }
    parts.push(part)
    root.add(group)
    return group
  }

  const addMesh = (
    group: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    name: string,
    selectable = true,
  ) => {
    const mesh = new THREE.Mesh(keepGeometry(geometry), material)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.explodeWithParent = true
    group.add(mesh)
    if (selectable) pickables.push(mesh)
    return mesh
  }

  const backplate = new THREE.Group()
  backplate.position.set(0, 0, -0.14)
  addMesh(
    backplate,
    new RoundedBoxGeometry(6.14, 2.54, 0.3, 7, 0.16),
    materialFor(chassisMaterial, true),
    'backplate-shell',
  )
  registerPart('backplate', 'Chasis y PCB', backplate, [0, -0.4, -2.5], [0.18, 0, 0], 0, 0.18)

  const addThermalModule = (side: 'left' | 'right') => {
    const direction = side === 'left' ? -1 : 1
    const group = new THREE.Group()
    group.position.set(direction * 1.58, direction * -0.045, 0.02)
    group.rotation.z = direction * 0.025

    const rim = addMesh(
      group,
      new RoundedBoxGeometry(2.62, 2.36, 0.29, 6, 0.22),
      materialFor(frameEdgeMaterial),
      `${side}-thermal-rim`,
    )
    rim.position.z = 0.04

    const panel = addMesh(
      group,
      new RoundedBoxGeometry(2.47, 2.21, 0.34, 6, 0.19),
      materialFor(thermalMaterial, true),
      `${side}-thermal-panel`,
    )
    panel.position.z = 0.11

    if (rank >= PASS_RANK.structural) {
      const finGroup = new THREE.Group()
      finGroup.name = `${side}-fin-bed`
      finGroup.userData.explodeWithParent = true
      finGroup.userData.manifestPart = true
      finGroup.userData.selectablePart = true
      finGroup.userData.sculptPart = `${side}-fin-bed`
      const finGeometry = keepGeometry(new THREE.BoxGeometry(0.035, 1, 0.11))
      const fins = new THREE.InstancedMesh(finGeometry, materialFor(finMaterial, true), 34)
      fins.name = `${side}-fin-array`
      fins.userData.explodeWithParent = true
      const directionAngle = -0.72
      const tangent = new THREE.Vector2(-Math.sin(directionAngle), Math.cos(directionAngle))
      const normal = new THREE.Vector2(Math.cos(directionAngle), Math.sin(directionAngle))
      const matrix = new THREE.Matrix4()
      const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, directionAngle))
      const position = new THREE.Vector3()
      const scale = new THREE.Vector3()
      for (let index = 0; index < 34; index += 1) {
        const normalized = index / 33
        const offset = THREE.MathUtils.lerp(-1.02, 1.02, normalized)
        const chord = Math.max(0.42, Math.sqrt(Math.max(0, 1 - (offset / 1.12) ** 2)) * 2.02)
        position.set(normal.x * offset + tangent.x * 0.02, normal.y * offset + tangent.y * 0.02, 0.365)
        scale.set(1, chord, 1)
        matrix.compose(position, quaternion, scale)
        fins.setMatrixAt(index, matrix)
      }
      fins.instanceMatrix.needsUpdate = true
      fins.castShadow = true
      fins.receiveShadow = true
      finGroup.add(fins)
      group.add(finGroup)
      pickables.push(fins)
    }

    return registerPart(
      `${side}-thermal`,
      side === 'left' ? 'Módulo térmico izquierdo' : 'Módulo térmico derecho',
      group,
      [direction * 3.6, direction * 0.7, 0.9],
      [direction * 0.12, direction * 0.2, direction * 0.22],
      side === 'left' ? 0.12 : 0.18,
      side === 'left' ? 0.38 : 0.44,
    )
  }

  addThermalModule('left')
  addThermalModule('right')

  const xFrame = new THREE.Group()
  xFrame.position.z = 0.43
  const frameArm = (
    inner: [number, number],
    outer: [number, number],
    innerWidth = 0.24,
    outerWidth = 0.13,
  ) => {
    const direction = new THREE.Vector2(outer[0] - inner[0], outer[1] - inner[1]).normalize()
    const normal = new THREE.Vector2(-direction.y, direction.x)
    const shape = new THREE.Shape()
    shape.moveTo(inner[0] + normal.x * innerWidth, inner[1] + normal.y * innerWidth)
    shape.lineTo(outer[0] + normal.x * outerWidth, outer[1] + normal.y * outerWidth)
    shape.lineTo(outer[0] - normal.x * outerWidth, outer[1] - normal.y * outerWidth)
    shape.lineTo(inner[0] - normal.x * innerWidth, inner[1] - normal.y * innerWidth)
    shape.closePath()
    return extrudeCentered(shape, 0.14, 0.035)
  }
  const arms: Array<[[number, number], [number, number]]> = [
    [[-0.34, 0.2], [-2.82, 1.08]],
    [[-0.34, -0.2], [-2.82, -1.08]],
    [[0.34, 0.2], [2.82, 1.08]],
    [[0.34, -0.2], [2.82, -1.08]],
  ]
  for (const [inner, outer] of arms) {
    const arm = new THREE.Mesh(keepGeometry(frameArm(inner, outer)), materialFor(frameMaterial))
    arm.name = 'x-frame-arm'
    arm.castShadow = true
    arm.receiveShadow = true
    arm.userData.explodeWithParent = true
    xFrame.add(arm)
    pickables.push(arm)
  }
  registerPart('x-frame', 'Marco estructural en X', xFrame, [0, 2.8, 1.3], [-0.25, 0.12, 0], 0.42, 0.68)

  const centerBridge = new THREE.Group()
  centerBridge.position.set(0, 0, 0.54)
  addMesh(
    centerBridge,
    new RoundedBoxGeometry(1.02, 0.72, 0.28, 5, 0.08),
    materialFor(chassisMaterial, true),
    'center-bridge-shell',
  )
  if (rank >= PASS_RANK.form) {
    for (let index = 0; index < 3; index += 1) {
      const slot = addMesh(
        centerBridge,
        new RoundedBoxGeometry(0.42, 0.055, 0.025, 2, 0.018),
        materialFor(thermalMaterial, true),
        `bridge-vent-${index + 1}`,
      )
      slot.position.set(-0.36, -0.26 - index * 0.085, 0.18)
    }
  }
  registerPart('center-bridge', 'Puente central', centerBridge, [0, -2.4, 1.6], [0.25, -0.2, 0], 0.56, 0.78)

  if (rank >= PASS_RANK.structural) {
    const fanBladeShape = new THREE.Shape()
    fanBladeShape.moveTo(0.11, -0.09)
    fanBladeShape.quadraticCurveTo(0.48, -0.18, 0.78, 0.02)
    fanBladeShape.quadraticCurveTo(0.57, 0.19, 0.18, 0.13)
    fanBladeShape.closePath()
    const bladeGeometry = keepGeometry(extrudeCentered(fanBladeShape, 0.045, 0.008))

    for (const side of [-1, 1] as const) {
      const fan = new THREE.Group()
      // The reference view shows the fin beds, not the fan faces. The two
      // rotors live on the underside so they are revealed by the rear review
      // view and during the exploded scroll sequence.
      fan.position.set(side * 1.58, side * -0.045, -0.34)
      const ring = addMesh(
        fan,
        new THREE.TorusGeometry(0.79, 0.045, 10, 64),
        materialFor(chassisMaterial, true),
        `${side < 0 ? 'left' : 'right'}-fan-ring`,
      )
      ring.position.z = 0.02
      const rotor = new THREE.Group()
      rotor.name = `${side < 0 ? 'left' : 'right'}-fan-rotor`
      for (let bladeIndex = 0; bladeIndex < 9; bladeIndex += 1) {
        const blade = new THREE.Mesh(bladeGeometry, materialFor(fanMaterial, true))
        blade.name = 'fan-blade'
        blade.rotation.z = (bladeIndex / 9) * Math.PI * 2
        blade.userData.explodeWithParent = true
        blade.castShadow = true
        rotor.add(blade)
        pickables.push(blade)
      }
      const hub = addMesh(
        rotor,
        new THREE.CylinderGeometry(0.18, 0.21, 0.1, 32),
        materialFor(chassisMaterial, true),
        'fan-hub',
      )
      hub.rotation.x = Math.PI / 2
      hub.position.z = 0.06
      fan.add(rotor)
      fans.push(rotor)
      registerPart(
        side < 0 ? 'left-fan' : 'right-fan',
        side < 0 ? 'Ventilador izquierdo' : 'Ventilador derecho',
        fan,
        [side * 2.8, side * 1.5, 2.5],
        [0.35, side * 0.24, side * 0.3],
        side < 0 ? 0.3 : 0.36,
        side < 0 ? 0.55 : 0.61,
      )
    }

    const ioBracket = new THREE.Group()
    ioBracket.position.set(-3.08, 0, 0.08)
    addMesh(
      ioBracket,
      new RoundedBoxGeometry(0.16, 2.42, 0.34, 3, 0.035),
      materialFor(frameMaterial),
      'io-bracket-plate',
    )
    if (rank >= PASS_RANK.form) {
      for (let index = 0; index < 4; index += 1) {
        const port = addMesh(
          ioBracket,
          new RoundedBoxGeometry(0.04, 0.23, 0.18, 2, 0.018),
          materialFor(thermalMaterial, true),
          `display-port-${index + 1}`,
        )
        port.position.set(0.095, 0.72 - index * 0.46, 0.04)
      }
    }
    registerPart('io-bracket', 'Bracket de video', ioBracket, [-2.2, 0, 0.5], [0, -0.32, -0.18], 0.6, 0.82)

    const sideRail = new THREE.Group()
    sideRail.position.set(1.27, -1.34, 0.24)
    addMesh(
      sideRail,
      new RoundedBoxGeometry(2.34, 0.26, 0.22, 3, 0.055),
      materialFor(chassisMaterial, true),
      'geforce-side-rail',
    )
    registerPart('side-rail', 'Riel GEFORCE RTX', sideRail, [2.6, -1.8, 0.8], [0.2, 0.25, 0.1], 0.66, 0.86)

    const powerSocket = new THREE.Group()
    powerSocket.position.set(0.48, -0.18, 0.73)
    addMesh(
      powerSocket,
      new RoundedBoxGeometry(0.36, 0.3, 0.24, 3, 0.04),
      materialFor(thermalMaterial, true),
      'power-socket-cavity',
    )
    registerPart('power-socket', 'Conector de energía', powerSocket, [0.4, 2.1, 2], [-0.2, 0.1, 0], 0.72, 0.9)
  }

  if (rank >= PASS_RANK.form) {
    const goldContacts = new THREE.Group()
    goldContacts.position.set(-0.28, -1.42, -0.02)
    const contactGeometry = keepGeometry(new RoundedBoxGeometry(0.065, 0.26, 0.07, 2, 0.012))
    for (let index = 0; index < 25; index += 1) {
      const contact = new THREE.Mesh(contactGeometry, materialFor(goldMaterial))
      contact.name = 'pcie-contact'
      contact.position.x = -0.78 + index * 0.065
      contact.userData.explodeWithParent = true
      contact.castShadow = true
      goldContacts.add(contact)
      pickables.push(contact)
    }
    registerPart('pcie-contacts', 'Contactos PCIe', goldContacts, [0, -2.3, 0.4], [0.1, 0, 0.12], 0.7, 0.9)

    const fasteners = new THREE.Group()
    fasteners.position.z = 0.64
    const screwGeometry = keepGeometry(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 18))
    const screwPositions: Array<[number, number]> = [
      [-2.72, 1.08], [-2.72, -1.08], [-0.95, 1.16], [-0.95, -1.16],
      [0.95, 1.16], [0.95, -1.16], [2.72, 1.08], [2.72, -1.08],
    ]
    for (const [x, y] of screwPositions) {
      const screw = new THREE.Mesh(screwGeometry, materialFor(chassisMaterial, true))
      screw.name = 'frame-fastener'
      screw.position.set(x, y, 0)
      screw.rotation.x = Math.PI / 2
      screw.userData.explodeWithParent = true
      fasteners.add(screw)
      pickables.push(screw)
    }
    registerPart('frame-fasteners', 'Fijaciones del marco', fasteners, [0, 0, 2.2], [0, 0, 0.2], 0.76, 0.92)

    const rtxTexture = labelTexture('RTX 5090', '#eefcff', 440, 96)
    const geforceTexture = labelTexture('GEFORCE RTX', '#efffff', 640, 112)
    textures.push(rtxTexture, geforceTexture)
    const rtxMaterial = keepMaterial(labelMaterial.clone()) as THREE.MeshStandardMaterial
    rtxMaterial.map = rtxTexture
    rtxMaterial.needsUpdate = true
    const geforceMaterial = keepMaterial(labelMaterial.clone()) as THREE.MeshStandardMaterial
    geforceMaterial.map = geforceTexture
    geforceMaterial.emissiveMap = geforceTexture
    geforceMaterial.needsUpdate = true

    const markings = new THREE.Group()
    markings.position.z = 0.73
    const rtx = addMesh(markings, new THREE.PlaneGeometry(0.68, 0.15), rtxMaterial, 'rtx5090-marking')
    rtx.position.set(-0.38, 0.36, 0)
    const geforce = addMesh(
      markings,
      new THREE.PlaneGeometry(1.58, 0.22),
      geforceMaterial,
      'geforce-rtx-marking',
    )
    geforce.position.set(1.28, -1.34, -0.44)
    geforce.rotation.x = -Math.PI / 2
    registerPart('markings', 'Identidad RTX 5090', markings, [2.8, 0, 1.6], [0, -0.15, 0.1], 0.8, 0.96)
  }

  const selectionShell = new THREE.Mesh(
    keepGeometry(new RoundedBoxGeometry(6.2, 2.86, 0.48, 5, 0.18)),
    selectedMaterial,
  )
  selectionShell.name = 'selection-shell'
  selectionShell.visible = false
  selectionShell.userData.explodeWithParent = true
  root.add(selectionShell)

  root.userData.sculptRuntime = {
    nodes: Object.fromEntries(parts.map((part) => [part.id, part.group])),
    meshes: Object.fromEntries(pickables.map((mesh) => [mesh.name, mesh])),
    sockets: {
      'root:frame-socket': new THREE.Vector3(0, 0, 0.43),
      'root:left-thermal-socket': new THREE.Vector3(-1.58, 0.045, 0.02),
      'root:right-thermal-socket': new THREE.Vector3(1.58, -0.045, 0.02),
    },
    colliders: Object.fromEntries(parts.map((part) => [part.id, { type: 'box', part: part.id }])),
    destructionGroups: {
      chassis: parts.filter((part) => ['backplate', 'io-bracket', 'pcie-contacts'].includes(part.id)).map((part) => part.group),
      thermal: parts.filter((part) => part.id.includes('thermal') || part.id.includes('fan')).map((part) => part.group),
      frame: parts.filter((part) => ['x-frame', 'center-bridge', 'side-rail', 'frame-fasteners'].includes(part.id)).map((part) => part.group),
    },
    selectionShell,
  }

  return { root, parts, fans, pickables, geometries, materials, textures }
}
