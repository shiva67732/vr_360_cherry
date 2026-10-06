import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperience } from '../state/experienceStore'

export function Particles({kind='gold',active=true}:{kind?:'gold'|'stars'|'fireflies'|'petals',active?:boolean}){
  const quality=useExperience(s=>s.quality), ref=useRef<THREE.Points>(null)
  const count=(quality==='LOW'?80:quality==='MEDIUM'?150:260)*(kind==='stars'?2:1)
  const data=useMemo(()=>{const a=new Float32Array(count*3);for(let i=0;i<count;i++){const spread=kind==='stars'?45:18;a[i*3]=(Math.random()-.5)*spread;a[i*3+1]=kind==='stars'?Math.random()*22+5:Math.random()*9;a[i*3+2]=(Math.random()-.5)*spread-3}return a},[count,kind])
  const roundSprite=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32
    const ctx=canvas.getContext('2d')!;const gradient=ctx.createRadialGradient(16,16,1,16,16,15)
    gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.55,'rgba(255,255,255,.9)');gradient.addColorStop(1,'rgba(255,255,255,0)')
    ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32)
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture
  },[])
  useFrame((_,dt)=>{if(ref.current){ref.current.rotation.y+=dt*(kind==='stars'?.006:.025);if(kind==='petals')ref.current.position.y=Math.sin(performance.now()*.0003)*.8}})
  if(!active)return null
  return <points ref={ref} frustumCulled><bufferGeometry><bufferAttribute attach="attributes-position" args={[data,3]}/></bufferGeometry><pointsMaterial map={roundSprite} alphaTest={.04} color={kind==='petals'?'#e9a5ad':kind==='fireflies'?'#d8ff83':'#ffd477'} size={kind==='stars'?.055:.075} transparent opacity={kind==='stars'?.75:.9} sizeAttenuation depthWrite={false}/></points>
}
