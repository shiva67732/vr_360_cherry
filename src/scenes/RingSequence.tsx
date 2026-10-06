import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { atLeast } from '../utils/state'
import { useExperience } from '../state/experienceStore'
import { Particles } from '../effects/Particles'

export function RingSequence(){const state=useExperience(s=>s.state),ring=useRef<THREE.Mesh>(null),path=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(0,2,-8),new THREE.Vector3(2.3,4,-10),new THREE.Vector3(-1.5,3.4,-12),new THREE.Vector3(0,2.7,-13.2)]),[]);useFrame(({clock})=>{if(!ring.current)return;ring.current.rotation.y+=.02;if(state==='RING_EXCHANGE'){const t=Math.min(1,(clock.elapsedTime%6)/6);ring.current.position.copy(path.getPoint(t))}});if(!atLeast(state,'RING_REVEAL')||atLeast(state,'INVITATION_REVEAL'))return null;return <group><mesh position={[0,.7,-8]}><boxGeometry args={[1.4,.4,1.2]}/><meshStandardMaterial color="#315446" roughness={.55}/></mesh><mesh ref={ring} position={[0,2,-8]} rotation-x={Math.PI/2}><torusGeometry args={[.38,.085,16,40]}/><meshStandardMaterial color="#ffd766" metalness={.95} roughness={.12}/></mesh><Particles kind="gold"/></group>}
