import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { AnimationMixer, Box3, LoopRepeat, Mesh, Texture, type Group, type Object3D, type Material, type BufferGeometry, type Skeleton, SkinnedMesh } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { useExperience } from '../state/experienceStore'

const modelUrl = '/models/couple-rigged-2p5d.glb'
// The illustration includes transparent margins, so its mesh bounds are wider
// than the visible characters. Enlarge further to make the artwork fill the stage.
const coupleWidth = 5 * 1.05

// Own the cloned GPU resources; never dispose resources in drei's shared cache.
function createInstance(source: Group) {
  const root = clone(source)
  const geometries = new Map<BufferGeometry, BufferGeometry>()
  const materials = new Map<Material, Material>()
  const textures = new Map<Texture, Texture>()
  const skeletons = new Set<Skeleton>()
  root.traverse(object => {
    if (!(object instanceof Mesh)) return
    if (!geometries.has(object.geometry)) geometries.set(object.geometry, object.geometry.clone())
    object.geometry = geometries.get(object.geometry)!
    const copyMaterial = (sourceMaterial: Material) => {
      if (!materials.has(sourceMaterial)) {
        const material = sourceMaterial.clone()
        const properties = material as unknown as Record<string, unknown>
        for (const [key, value] of Object.entries(properties)) {
          if (!(value instanceof Texture)) continue
          if (!textures.has(value)) textures.set(value, value.clone())
          properties[key] = textures.get(value)!
        }
        materials.set(sourceMaterial, material)
      }
      return materials.get(sourceMaterial)!
    }
    object.material = Array.isArray(object.material) ? object.material.map(copyMaterial) : copyMaterial(object.material)
    if (object instanceof SkinnedMesh) skeletons.add(object.skeleton)
  })
  return { root, dispose: () => {
    skeletons.forEach(skeleton => skeleton.dispose())
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
    textures.forEach(texture => texture.dispose())
  } }
}

function AnimatedCouple() {
  const gltf = useGLTF(modelUrl)
  const [root, setRoot] = useState<Object3D | null>(null)
  const mixer = useRef<AnimationMixer | null>(null)
  const runId = useExperience(s => s.runId)
  useEffect(() => {
    const instance = createInstance(gltf.scene)
    const bounds = new Box3().setFromObject(instance.root)
    const width = bounds.max.x - bounds.min.x
    instance.root.scale.setScalar(width > 0 ? coupleWidth / width : 1)
    const animationMixer = new AnimationMixer(instance.root)
    const clip = gltf.animations.find(animation => animation.name === 'Idle_Alive')
    if (clip) animationMixer.clipAction(clip).setLoop(LoopRepeat, Infinity).play()
    else console.error('Couple model is missing the Idle_Alive animation')
    mixer.current = animationMixer
    setRoot(instance.root)
    return () => {
      mixer.current = null
      animationMixer.stopAllAction()
      animationMixer.uncacheRoot(instance.root)
      instance.dispose()
    }
  }, [gltf.scene, gltf.animations])
  useEffect(() => { mixer.current?.setTime(0) }, [runId])
  useFrame((_, delta) => { mixer.current?.update(delta) })
  // Stage top is Y=.4325. +Z faces the existing camera, with no added yaw sway.
  return root ? <primitive object={root} position={[0, .435, .55]} dispose={null}/> : null
}

class CoupleErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error) { console.error('Unable to load the engagement couple:', error) }
  render() { return this.state.failed ? null : this.props.children }
}

export function Couple() {
  return <CoupleErrorBoundary><Suspense fallback={null}><AnimatedCouple/></Suspense></CoupleErrorBoundary>
}
