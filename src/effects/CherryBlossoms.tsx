import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperience } from '../state/experienceStore'

type BlossomSeed={x:number;y:number;z:number;speed:number;sway:number;phase:number;scale:number;spin:number}

export function CherryBlossoms(){
  const quality=useExperience(s=>s.quality)
  const count=quality==='LOW'?45:quality==='MEDIUM'?80:125
  const mesh=useRef<THREE.InstancedMesh>(null)
  const dummy=useMemo(()=>new THREE.Object3D(),[])
  const texture=useLoader(THREE.TextureLoader,'/textures/particles/cherry-petal.png')
  texture.colorSpace=THREE.SRGBColorSpace
  const seeds=useMemo<BlossomSeed[]>(()=>Array.from({length:count},(_,i)=>({
    x:(Math.random()-.5)*25,
    y:Math.random()*13-2,
    z:Math.random()*28-20,
    speed:.22+Math.random()*.32,
    sway:.35+Math.random()*.75,
    phase:Math.random()*Math.PI*2+i,
    scale:.65+Math.random()*.9,
    spin:(Math.random()-.5)*1.5,
  })),[count])

  useFrame(({clock})=>{
    if(!mesh.current)return
    const t=clock.elapsedTime
    seeds.forEach((flower,i)=>{
      const y=11-((t*flower.speed+(11-flower.y))%13)
      const windX=((flower.x+t*flower.speed*1.9+12.5)%25)-12.5
      dummy.position.set(windX+Math.sin(t*.55+flower.phase)*flower.sway,y,flower.z+Math.cos(t*.37+flower.phase)*flower.sway*.7)
      dummy.rotation.set(t*.35+flower.phase,t*flower.spin+flower.phase*.3,Math.sin(t*.7+flower.phase)*.75)
      dummy.scale.set(.62*flower.scale,.62*flower.scale,.62*flower.scale)
      dummy.updateMatrix();mesh.current!.setMatrixAt(i,dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate=true
  })

  return <instancedMesh ref={mesh} args={[undefined,undefined,count]} frustumCulled={false}>
    <planeGeometry args={[1,1]}/>
    <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent alphaTest={.08} opacity={.92} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
}
