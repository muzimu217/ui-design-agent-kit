import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { PRODUCT_COLORS, useApp } from '../store'

const MODEL_URL = `${import.meta.env.BASE_URL}models/airpods_pro.glb`
const CLIP_DURATION = 6
/** normalized longest model dimension on screen (world units) */
const STAGE_SIZE = 2.55

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function SceneRig() {
  const { scene, animations } = useGLTF(MODEL_URL)
  const { gl, scene: threeScene, size } = useThree()
  const { theme, colorIndex, processProgress, processAuto, modelDrag } = useApp()
  const groupRef = useRef<THREE.Group>(null)
  const baseSpin = useRef(0)
  const reducedRef = useRef(prefersReducedMotion())

  // procedural studio environment (no network dependency)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
    threeScene.environment = env.texture
    return () => {
      env.texture.dispose()
      pmrem.dispose()
      threeScene.environment = null
    }
  }, [gl, threeScene])

  // center + normalize the model to a predictable stage size
  const normalized = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const dims = box.getSize(new THREE.Vector3())
    const s = STAGE_SIZE / Math.max(dims.x, dims.y, dims.z)
    return { center, s }
  }, [scene])

  // animatable nodes + shared shell materials (color-swap targets)
  const rig = useMemo(() => {
    const found: { lid: THREE.Object3D | null; buds: THREE.Object3D | null } = {
      lid: null,
      buds: null,
    }
    scene.traverse((o) => {
      if (o.name === 'Lid') found.lid = o
      if (o.name === 'Airpods') found.buds = o
    })
    const shells = new Set<THREE.MeshStandardMaterial>()
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const m of mats) {
          const std = m as THREE.MeshStandardMaterial
          if (std.name === 'Mat.1' || std.name === 'Cylinder__0' || std.name === 'Mat.2') {
            shells.add(std)
          }
        }
      }
    })
    return {
      lid: found.lid,
      buds: found.buds,
      lidRest: found.lid ? found.lid.quaternion.clone() : null,
      budsRest: found.buds
        ? { p: found.buds.position.clone(), e: found.buds.rotation.clone() }
        : null,
      shells: [...shells],
    }
  }, [scene])

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene])

  const action = useMemo(() => {
    const clip = animations[0]
    if (!clip) return null
    const a = mixer.clipAction(clip)
    a.play()
    a.paused = true
    return a
  }, [mixer, animations])

  const targetColor = useMemo(() => new THREE.Color(), [])
  const _v = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const g = groupRef.current
    if (!g) return
    const d = Math.min(dt, 0.05)

    // slow turntable (user drag adds on top)
    if (!reducedRef.current && theme !== 'process') baseSpin.current += d * 0.16
    const targetRot = baseSpin.current + modelDrag.current
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRot, 5, d)

    // stage framing: model right of the headline on desktop hero, sunk into the
    // lower drag zone on mobile; lifted above the caption block in color theater
    const desktop = size.width > 1024
    const tx = theme === 'hero' && desktop ? 1.15 : 0
    const ty =
      theme === 'hero'
        ? desktop
          ? -0.15
          : -1.05
        : theme === 'color'
          ? 0.62
          : theme === 'process'
            ? -0.25
            : 0
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 4, d)
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 4, d)

    // finish swap: shared shell materials damp-lerp to the selected color
    targetColor.set(PRODUCT_COLORS[colorIndex].tint)
    for (const m of rig.shells) m.color.lerp(targetColor, 1 - Math.exp(-7 * d))

    if (theme === 'process') {
      if (processAuto.current) {
        processProgress.current = Math.min(1, processProgress.current + d / CLIP_DURATION)
        if (processProgress.current >= 1) processAuto.current = false
      }
      // canonical scrub recipe: set the action's local time, then sample with a zero delta
      if (action) {
        action.time = THREE.MathUtils.clamp(processProgress.current, 0, 1) * CLIP_DURATION
        mixer.update(0)
      }
    } else {
      if (action) {
        action.time = 0
        mixer.update(0)
      }
      // static pose: freeze the baked clip at its first frame (the artist's composed
      // pose), then park the bud group in world axes beside the case so it stays put
      // while the case turntables (the Airpods node carries a huge C4D offset, so
      // local deltas are meaningless)
      if (rig.lid && rig.lidRest) rig.lid.quaternion.copy(rig.lidRest)
      if (rig.buds && rig.budsRest && rig.buds.parent) {
        mixer.setTime(0)
        const bob = reducedRef.current ? 0 : Math.sin(state.clock.elapsedTime * 1.3) * 0.05
        _v.set(g.position.x + 1.5, g.position.y + 0.42 + bob, 0.45)
        rig.buds.parent.worldToLocal(_v)
        rig.buds.position.copy(_v)
      }
    }
  })

  return (
    <group ref={groupRef}>
      <group
        scale={normalized.s}
        position={[
          -normalized.center.x * normalized.s,
          -normalized.center.y * normalized.s,
          -normalized.center.z * normalized.s,
        ]}
      >
        <primitive object={scene} />
      </group>
      <ContactShadows position={[0, -1.95, 0]} opacity={0.32} scale={12} blur={2.8} far={5} />
    </group>
  )
}

export function ProductCanvas() {
  const { theme } = useApp()
  const visible = theme === 'hero' || theme === 'color' || theme === 'process'

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-10 transition-opacity duration-700 [transition-timing-function:var(--ease-elegant)] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ fov: 35, position: [0, 0.4, 8.8], near: 0.1, far: 60 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 7, 4]} intensity={1.7} />
        <directionalLight position={[-6, 3, -5]} intensity={0.8} color="#cfe0ff" />
        <directionalLight position={[0, -3, 6]} intensity={0.25} />
        <SceneRig />
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
