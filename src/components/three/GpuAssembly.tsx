'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { assemblyStageProgress, getAssemblyScrollProgress, getAssemblyStep, type AssemblyStep } from '@/lib/assemblyProgress'
import { createRtx5090Model, type Rtx5090ReviewPass } from './rtx5090Model'

interface Props {
  onReady?: () => void
  onLost?: () => void
  onStepChange?: (step: AssemblyStep) => void
  className?: string
}

type ReviewWindow = Window & {
  __gpuReviewReady?: boolean
  __gpuPartsManifest?: unknown
  __gpuSetView?: (view: string) => void
  __gpuAssemblyProgress?: number
}

const REVIEW_PASSES = new Set<Rtx5090ReviewPass>([
  'blockout',
  'structural',
  'form',
  'material',
  'surface',
  'lighting',
  'interaction',
  'final',
])

export default function GpuAssembly({ onReady, onLost, onStepChange, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cleanup: (() => void) | null = null

    try {
      const params = new URLSearchParams(window.location.search)
      const requestedPass = params.get('gpuReview') as Rtx5090ReviewPass | null
      const reviewPass = requestedPass && REVIEW_PASSES.has(requestedPass) ? requestedPass : 'final'
      const reviewMode = params.has('gpuReview')
      const motionEnabled = params.get('gpuMotion') !== '0'
      const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      camera.position.set(0, 0.18, 8.35)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.04
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      host.appendChild(renderer.domElement)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'

      const pmrem = new THREE.PMREMGenerator(renderer)
      const environmentScene = new RoomEnvironment()
      const environment = pmrem.fromScene(environmentScene, 0.04).texture
      scene.environment = environment
      environmentScene.dispose()
      pmrem.dispose()

      const hemi = new THREE.HemisphereLight(0xe8f6ff, 0x11171c, 1.02)
      scene.add(hemi)
      const key = new THREE.DirectionalLight(0xe7f6ff, reviewPass === 'lighting' || reviewPass === 'final' ? 4.4 : 3)
      key.position.set(-4.8, 5.8, 5.6)
      key.castShadow = true
      key.shadow.mapSize.set(1024, 1024)
      key.shadow.radius = 4
      key.shadow.bias = -0.0003
      scene.add(key)
      const fill = new THREE.DirectionalLight(0x84aebe, 0.86)
      fill.position.set(4.4, -1.4, 4)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0x45d9ff, 2.2)
      rim.position.set(3.8, 2.6, -5.5)
      scene.add(rim)

      const groundMaterial = new THREE.ShadowMaterial({ color: 0x020608, opacity: 0.2 })
      const groundGeometry = new THREE.PlaneGeometry(16, 10)
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.position.set(0, -2.35, -0.35)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      scene.add(ground)

      const runtime = createRtx5090Model(reviewPass)
      const root = runtime.root
      scene.add(root)

      const reviewWindow = window as ReviewWindow
      const views: Record<string, { camera: [number, number, number]; rotation: [number, number, number] }> = {
        match: { camera: [0, 0.18, reviewMode ? 9.8 : 8.5], rotation: [-0.68, -0.2, -0.71] },
        front: { camera: [0, 0, 8.35], rotation: [0, 0, 0] },
        'three-quarter': { camera: [0.25, 0.22, 8.15], rotation: [-0.22, -0.42, -0.12] },
        rear: { camera: [0, 0.1, 8.6], rotation: [0.08, Math.PI - 0.4, 0.04] },
        grazing: { camera: [0, 1.5, 7.4], rotation: [-0.5, -0.22, -0.035] },
      }
      let activeView = params.get('gpuView') ?? 'match'
      const setView = (view: string) => {
        activeView = views[view] ? view : 'match'
        const setup = views[activeView] ?? views.match!
        camera.position.set(...setup.camera)
        camera.lookAt(0, 0, 0)
        root.rotation.set(...setup.rotation)
        root.position.y = reviewMode && activeView === 'match' ? 0.3 : 0
      }
      reviewWindow.__gpuSetView = setView
      setView(activeView)

      const resize = () => {
        const rect = host.getBoundingClientRect()
        const width = Math.max(1, Math.round(rect.width))
        const height = Math.max(1, Math.round(rect.height))
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)

      let visible = true
      const intersectionObserver = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
      }, { rootMargin: '160px 0px' })
      intersectionObserver.observe(host)

      const pointer = new THREE.Vector2()
      const pointerTarget = new THREE.Vector2()
      const raycaster = new THREE.Raycaster()
      let selectedPart: THREE.Group | null = null

      const onPointerMove = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        pointerTarget.set(
          THREE.MathUtils.clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1),
          THREE.MathUtils.clamp(-(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1), -1, 1),
        )
      }
      const onPointerLeave = () => pointerTarget.set(0, 0)
      const findSelectablePart = (object: THREE.Object3D) => {
        let current: THREE.Object3D | null = object
        while (current && current !== root) {
          if (current.userData.selectablePart) return current as THREE.Group
          current = current.parent
        }
        return null
      }
      const onPointerDown = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.set(
          ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
          -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1,
        )
        raycaster.setFromCamera(pointer, camera)
        const hit = raycaster.intersectObjects(runtime.pickables, false)[0]
        const next = hit ? findSelectablePart(hit.object) : null
        if (selectedPart && selectedPart !== next) selectedPart.scale.setScalar(1)
        selectedPart = next
        if (selectedPart) selectedPart.scale.setScalar(1.035)
      }
      renderer.domElement.addEventListener('pointermove', onPointerMove)
      renderer.domElement.addEventListener('pointerleave', onPointerLeave)
      renderer.domElement.addEventListener('pointerdown', onPointerDown)

      const onContextLost = (event: Event) => {
        event.preventDefault()
        setFailed(true)
        onLost?.()
      }
      renderer.domElement.addEventListener('webglcontextlost', onContextLost)

      const triangleCount = (object: THREE.Object3D) => {
        let triangles = 0
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return
          const vertices = child.geometry.index?.count ?? child.geometry.attributes.position?.count ?? 0
          const instances = child instanceof THREE.InstancedMesh ? child.count : 1
          triangles += (vertices / 3) * instances
        })
        return Math.round(triangles)
      }
      const integralManifestParts: Array<{ name: string; kind: string; module: string; triangles: number }> = []
      root.traverse((object) => {
        if (!object.userData.manifestPart || !object.name) return
        integralManifestParts.push({
          name: object.name,
          kind: 'integral-part',
          module: object.parent?.name ?? 'root',
          triangles: triangleCount(object),
        })
      })
      const partManifest = {
        model: 'nvidia-geforce-rtx-5090-founders-edition',
        parts: [
          ...runtime.parts.map((part) => ({
            name: part.id,
            kind: 'part',
            module: part.id,
            triangles: triangleCount(part.group),
          })),
          ...integralManifestParts,
        ],
        unnamedMeshes: runtime.pickables.filter((mesh) => !mesh.name).length,
        integralMeshes: runtime.pickables.filter((mesh) => mesh.userData.explodeWithParent).length,
      }
      reviewWindow.__gpuPartsManifest = partManifest

      const section = host.closest<HTMLElement>('[data-assembly-scroll]')
      let raf = 0
      let ready = false
      let smoothProgress = reviewMode || reducedQuery.matches ? 1 : 0
      let previousStep: AssemblyStep | null = null
      let previousTime = performance.now()
      const tempPosition = new THREE.Vector3()
      const explodedQuaternion = new THREE.Quaternion()
      const assembledQuaternion = new THREE.Quaternion()

      const frame = (time: number) => {
        raf = requestAnimationFrame(frame)
        const delta = Math.min(0.05, (time - previousTime) / 1000)
        previousTime = time
        if (!visible && ready && !reviewMode) return

        let targetProgress = 1
        if (!reviewMode && section) {
          const rect = section.getBoundingClientRect()
          targetProgress = getAssemblyScrollProgress(
            rect.top,
            rect.height,
            window.innerHeight,
            reducedQuery.matches,
          )
        }
        smoothProgress += (targetProgress - smoothProgress) * (reducedQuery.matches ? 1 : 0.105)
        reviewWindow.__gpuAssemblyProgress = smoothProgress

        for (const part of runtime.parts) {
          const localProgress = assemblyStageProgress(smoothProgress, part.start, part.end)
          tempPosition.copy(part.explodeOffset).multiplyScalar(1 - localProgress).add(part.home)
          part.group.position.copy(tempPosition)
          explodedQuaternion.setFromEuler(part.explodeRotation)
          explodedQuaternion.premultiply(part.homeQuaternion)
          assembledQuaternion.copy(explodedQuaternion).slerp(part.homeQuaternion, localProgress)
          part.group.quaternion.copy(assembledQuaternion)
          part.group.visible = reviewMode || localProgress > 0.015
        }

        const step = getAssemblyStep(smoothProgress)
        if (step !== previousStep) {
          previousStep = step
          onStepChange?.(step)
        }

        pointer.lerp(pointerTarget, 0.065)
        if (!reviewMode && motionEnabled && !reducedQuery.matches) {
          root.rotation.x = -0.12 + pointer.y * 0.07 + Math.sin(time * 0.00045) * 0.012
          root.rotation.y = -0.3 + pointer.x * 0.12 + Math.sin(time * 0.00035) * 0.025
          root.position.y = Math.sin(time * 0.00072) * 0.035
        }

        if (motionEnabled && !reducedQuery.matches) {
          const fanSpeed = delta * THREE.MathUtils.lerp(0.25, 10.5, Math.max(0, (smoothProgress - 0.42) / 0.58))
          for (const fan of runtime.fans) fan.rotation.z += fanSpeed
        }

        renderer.render(scene, camera)
        if (!ready) {
          ready = true
          reviewWindow.__gpuReviewReady = true
          onReady?.()
        }
      }
      raf = requestAnimationFrame(frame)

      cleanup = () => {
        cancelAnimationFrame(raf)
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        renderer.domElement.removeEventListener('pointermove', onPointerMove)
        renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
        for (const geometry of runtime.geometries) geometry.dispose()
        for (const material of runtime.materials) material.dispose()
        for (const texture of runtime.textures) texture.dispose()
        groundGeometry.dispose()
        groundMaterial.dispose()
        environment.dispose()
        renderer.forceContextLoss()
        renderer.dispose()
        renderer.domElement.remove()
        reviewWindow.__gpuReviewReady = false
        delete reviewWindow.__gpuSetView
      }
    } catch {
      queueMicrotask(() => setFailed(true))
      onLost?.()
    }

    return () => {
      cleanup?.()
    }
  }, [onLost, onReady, onStepChange])

  if (failed) return null
  return <div ref={hostRef} className={className} aria-hidden="true" />
}
