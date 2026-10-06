import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Particles } from '../effects/Particles'
import { CherryBlossoms } from '../effects/CherryBlossoms'
import { Couple } from './Couple'
import { atLeast } from '../utils/state'
import { useExperience } from '../state/experienceStore'

function FairyLights(){return <group>{Array.from({length:18},(_,i)=><mesh key={i} position={[(i%9-4)*1.5,4.5+Math.sin(i)*.35,i<9?-7:6]}><sphereGeometry args={[.045,6,6]}/><meshBasicMaterial color="#ffd98a" toneMapped={false}/></mesh>)}</group>}

export function Garden(){const state=useExperience(s=>s.state),lit=atLeast(state,'WORLD_REVEAL');return <group>
  <GardenPanorama lit={lit}/><fog attach="fog" args={['#07140f',10,48]}/><GardenLighting lit={lit}/>
  {lit&&<><FairyLights/><Particles kind="fireflies"/><CherryBlossoms/></>}
  <Stage/>
 </group>}

function GardenLighting({lit}:{lit:boolean}){
  const ambient=useRef<THREE.AmbientLight>(null),sun=useRef<THREE.DirectionalLight>(null),stage=useRef<THREE.PointLight>(null)
  useFrame((_,dt)=>{
    if(ambient.current)ambient.current.intensity=THREE.MathUtils.damp(ambient.current.intensity,lit?.55:.035,1.5,dt)
    if(sun.current)sun.current.intensity=THREE.MathUtils.damp(sun.current.intensity,lit?1.1:.08,1.5,dt)
    if(stage.current)stage.current.intensity=THREE.MathUtils.damp(stage.current.intensity,lit?15:.1,1.5,dt)
  })
  return <><ambientLight ref={ambient} intensity={.035} color="#dfe9d0"/><directionalLight ref={sun} position={[3,8,2]} intensity={.08} color="#ffd28c" castShadow={useExperience.getState().quality!=='LOW'}/><pointLight ref={stage} position={[0,3,-11]} intensity={.1} distance={16} color="#ffb657"/></>
}

function GardenPanorama({lit}:{lit:boolean}){
  const background=useLoader(THREE.TextureLoader,'/textures/environment/cherry-blossom-360-4k.webp')
  const scene=useThree(s=>s.scene)
  const target=lit?.88:.045
  useEffect(()=>{
    background.mapping=THREE.EquirectangularReflectionMapping
    background.colorSpace=THREE.SRGBColorSpace
    background.minFilter=THREE.LinearFilter
    background.magFilter=THREE.LinearFilter
    background.generateMipmaps=false
    background.needsUpdate=true
    scene.background=background
    // Reuse the optimized panorama for ambient reflections. This removes the
    // separate 8.4 MB HDR download and its expensive mobile decode step.
    scene.environment=background
    scene.backgroundBlurriness=0
    // Face the temple toward the centered stage so the couple is framed by it.
    scene.backgroundRotation.set(0,-2.33,0)
    scene.environmentRotation.set(0,-2.33,0)
    return()=>{if(scene.background===background)scene.background=null;if(scene.environment===background)scene.environment=null}
  },[background,scene])
  useFrame((_,dt)=>{
    scene.backgroundIntensity=THREE.MathUtils.damp(scene.backgroundIntensity,target,1.35,dt)
    scene.environmentIntensity=THREE.MathUtils.damp(scene.environmentIntensity,lit?.5:.035,1.35,dt)
  })
  return null
}

function Stage(){const state=useExperience(s=>s.state),show=atLeast(state,'COUPLE_REVEAL');const {scene}=useGLTF('/models/stage/garden-wedding-arch.glb');const arch=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true}});return copy},[scene]);return <group position={[0,0,-14]} visible={show}>
  <mesh position={[0,.2,.15]} receiveShadow castShadow><boxGeometry args={[5,.4,2.25]}/><meshStandardMaterial color="#6f4b32" roughness={.8}/></mesh>
  {Array.from({length:10},(_,i)=><mesh key={i} position={[-2.25+i*.5,.415,.15]} receiveShadow><boxGeometry args={[.47,.035,2.15]}/><meshStandardMaterial color={i%2?'#b68456':'#a9784c'} roughness={.72}/></mesh>)}
  <mesh position={[0,.32,1.285]}><boxGeometry args={[5.04,.13,.055]}/><meshStandardMaterial color="#d2aa5e" metalness={.55} roughness={.35}/></mesh>
  <mesh position={[0,.09,1.62]} receiveShadow castShadow><boxGeometry args={[2.15,.18,.62]}/><meshStandardMaterial color="#8b603d" roughness={.82}/></mesh>
  <mesh position={[0,.19,1.61]} receiveShadow><boxGeometry args={[2.08,.025,.56]}/><meshStandardMaterial color="#b88859" roughness={.7}/></mesh>
  <primitive object={arch} position={[0,.43,.18]} scale={1.92}/>
  <pointLight position={[-2.1,3.3,1]} color="#ffd8a0" intensity={4.5} distance={8}/>
  <pointLight position={[2.1,3.3,1]} color="#ffd8a0" intensity={4.5} distance={8}/>
  <Couple/>
 </group>}

useGLTF.preload('/models/stage/garden-wedding-arch.glb')
