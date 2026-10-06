import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { atLeast } from '../utils/state'
import { useExperience } from '../state/experienceStore'
import { Particles } from '../effects/Particles'
import { invitation } from '../config/invitation'

export function Sky(){
  const state=useExperience(s=>s.state)
  const showDate=state==='DATE_REVEAL'||state==='WAITING_TURN_AROUND'
  return <><Particles kind="stars" active={atLeast(state,'DATE_REVEAL')}/>{showDate&&<CloudDate/>}</>
}

function CloudDate(){
  const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null),card=useRef<THREE.Group>(null),started=useRef(performance.now())
  const cloudTexture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256
    const ctx=canvas.getContext('2d')!
    const glow=ctx.createRadialGradient(128,128,20,128,128,124)
    glow.addColorStop(0,'rgba(255,255,255,.98)');glow.addColorStop(.4,'rgba(255,251,245,.84)');glow.addColorStop(.76,'rgba(245,248,250,.3)');glow.addColorStop(1,'rgba(255,255,255,0)')
    ctx.fillStyle=glow;ctx.fillRect(0,0,256,256)
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture
  },[])
  useEffect(()=>{started.current=performance.now()},[])
  useFrame((_,dt)=>{
    const reveal=Math.min(1,(performance.now()-started.current)/2200)
    const eased=1-Math.pow(1-reveal,3)
    if(left.current)left.current.position.x=THREE.MathUtils.damp(left.current.position.x,-4.1*eased,2.5,dt)
    if(right.current)right.current.position.x=THREE.MathUtils.damp(right.current.position.x,4.1*eased,2.5,dt)
    if(card.current){card.current.scale.lerp(new THREE.Vector3(1,1,1),1-Math.exp(-3*dt))}
  })
  return <group position={[0,12,-6.8]} rotation={[Math.PI/2,0,0]}>
    <group ref={left}><CloudPuff texture={cloudTexture} x={-1.2} y={.2} s={1.45}/><CloudPuff texture={cloudTexture} x={-.05} y={-.25} s={1.15}/><CloudPuff texture={cloudTexture} x={-2.25} y={-.2} s={1}/><CloudPuff texture={cloudTexture} x={-1.5} y={-.65} s={.8}/></group>
    <group ref={right}><CloudPuff texture={cloudTexture} x={1.2} y={.2} s={1.45}/><CloudPuff texture={cloudTexture} x={.05} y={-.25} s={1.15}/><CloudPuff texture={cloudTexture} x={2.25} y={-.2} s={1}/><CloudPuff texture={cloudTexture} x={1.5} y={-.65} s={.8}/></group>
    <group ref={card} scale={0.01} position-z={.18}>
      <Text font="/fonts/GreatVibes-Regular.ttf" position={[0,1.05,0]} fontSize={.88} color="#f4cd77" outlineWidth={.018} outlineColor="#183228" anchorX="center" anchorY="middle">Save the Date</Text>
      <Line points={[[-2.25,.58,0],[2.25,.58,0]]} color="#e9c678" transparent opacity={.68} lineWidth={.7}/>
      <Text font="/fonts/GreatVibes-Regular.ttf" position={[0,-.05,0]} fontSize={1.18} color="#fff9e9" outlineWidth={.026} outlineColor="#183228" anchorX="center" anchorY="middle">{invitation.date}</Text>
      <Line points={[[-1.3,-.63,0],[1.3,-.63,0]]} color="#e9c678" transparent opacity={.45} lineWidth={.55}/>
      <Text position={[0,-1.03,0]} fontSize={.45} fontWeight={500} letterSpacing={.09} color="#f6d997" outlineWidth={.016} outlineColor="#183228" anchorX="center" anchorY="middle">{invitation.time}</Text>
    </group>
  </group>
}

function CloudPuff({texture,x,y,s}:{texture:THREE.Texture;x:number;y:number;s:number}){return <sprite position={[x,y,0]} scale={[3.4*s,1.7*s,1]}><spriteMaterial map={texture} color="#fffaf2" transparent opacity={.78} depthWrite={false}/></sprite>}
