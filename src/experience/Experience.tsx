import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { PerspectiveCamera } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { Garden } from '../scenes/World'
import { Envelope } from '../scenes/Envelope'
import { Sky } from '../scenes/Sky'
import { LookController } from '../controls/LookController'
import { useExperience } from '../state/experienceStore'
import { atLeast } from '../utils/state'

function Rig(){const positionRig=useRef<THREE.Group>(null),orientationRig=useRef<THREE.Group>(null),state=useExperience(s=>s.state),set=useExperience(s=>s.setState),runId=useExperience(s=>s.runId),hold=useRef(0)
  const { width, height }=useThree(s=>s.size)
  const cameraFov=width/height<.82?120:100
  useEffect(()=>{if(!positionRig.current)return;gsap.killTweensOf(positionRig.current.position);const p=positionRig.current.position
    if(state==='DARK_WORLD')gsap.set(p,{x:0,y:1.65,z:2})
    if(state==='RANGOLI_TRAVEL')gsap.to(p,{z:-7.3,y:1.8,duration:3.35,ease:'power1.inOut'})
    if(state==='COUPLE_REVEAL')gsap.to(p,{z:-7.8,y:2,duration:1.35,ease:'sine.inOut'})
    if(state==='RING_REVEAL')gsap.to(p,{z:-6.8,y:2.25,duration:2.5,ease:'sine.inOut'})
    if(state==='FINALE')gsap.to(p,{x:3,z:-6,y:2.5,duration:4,ease:'sine.inOut'})
  },[state,runId])
  useEffect(()=>{
    const recenter=()=>{
      if(!positionRig.current)return
      gsap.killTweensOf(positionRig.current.position)
      const current=useExperience.getState().state
      const destination=atLeast(current,'COUPLE_REVEAL')?{x:0,y:2,z:-7.8}:atLeast(current,'RANGOLI_TRAVEL')?{x:0,y:1.8,z:-7.3}:{x:0,y:1.65,z:2}
      gsap.to(positionRig.current.position,{...destination,duration:.5,ease:'sine.inOut'})
      hold.current=0
    }
    window.addEventListener('recenter-orientation',recenter)
    return()=>window.removeEventListener('recenter-orientation',recenter)
  },[])
  useFrame(({camera},dt)=>{const direction=new THREE.Vector3();camera.getWorldDirection(direction)
    if(state==='WAITING_LOOK_UP'){hold.current=direction.y>.48?hold.current+dt:0;if(hold.current>.7){hold.current=0;set('DATE_REVEAL')}}
    if(state==='WAITING_TURN_AROUND'){hold.current=direction.z>.55?hold.current+dt:0;if(hold.current>.7){hold.current=0;set('VENUE_REVEAL')}}
  })
  return <group ref={positionRig}><group ref={orientationRig}><PerspectiveCamera makeDefault fov={cameraFov} near={.1} far={120}/><LookController orientationRig={orientationRig}/></group></group>}

function WorldReady({onReady}:{onReady:()=>void}){useEffect(onReady,[onReady]);return null}

export function Experience({onReady}:{onReady:()=>void}){const state=useExperience(s=>s.state),quality=useExperience(s=>s.quality)
 return <Canvas shadows={quality!=='LOW'} dpr={quality==='LOW'?[.75,1]:quality==='MEDIUM'?[1,1.35]:[1,1.65]} gl={{antialias:quality!=='LOW',powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05}}>
  <Suspense fallback={null}><Garden/><Envelope/><Sky/><Rig/><WorldReady onReady={onReady}/>{quality!=='LOW'&&<EffectComposer multisampling={quality==='HIGH'?4:0}><Bloom intensity={atLeast(state,'WORLD_REVEAL')?.48:0} luminanceThreshold={.85} mipmapBlur/><Vignette darkness={.34} offset={.28}/></EffectComposer>}</Suspense>
 </Canvas>}
