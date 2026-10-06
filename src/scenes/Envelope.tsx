import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useExperience } from '../state/experienceStore'
import { audioManager } from '../audio/AudioManager'

export function Envelope(){const state=useExperience(s=>s.state),set=useExperience(s=>s.setState),g=useRef<THREE.Group>(null),flap=useRef<THREE.Mesh>(null);useFrame(({clock},dt)=>{if(g.current)g.current.position.y=1.8+Math.sin(clock.elapsedTime*1.25)*.085;if(flap.current&&state==='ENVELOPE_OPENING')flap.current.rotation.x=THREE.MathUtils.damp(flap.current.rotation.x,-2.7,4,dt)});if(state!=='DARK_WORLD'&&state!=='ENVELOPE_OPENING')return null;return <group ref={g} position={[0,1.8,-3]} onClick={(e)=>{e.stopPropagation();if(state==='DARK_WORLD'){audioManager.play('envelope');set('ENVELOPE_OPENING')}}}>
  <pointLight position={[0,.15,1.1]} color="#ffe2a1" intensity={2.5} distance={4.5}/>
  <mesh position={[0,0,-.16]} scale={[2.15,1.35,1]}><circleGeometry args={[1,48]}/><meshBasicMaterial color="#f4c96c" transparent opacity={.13} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
  <RoundedBox args={[2.86,1.76,.08]} radius={.09} smoothness={5} position-z={-.01}><meshBasicMaterial color="#cda447"/></RoundedBox>
  <RoundedBox args={[2.7,1.6,.1]} radius={.075} smoothness={5} position-z={.055}><meshStandardMaterial color="#fff4dc" roughness={.72} emissive="#c28a32" emissiveIntensity={.22}/></RoundedBox>
  <Line points={[[-1.31,.73,.12],[0,-.13,.135],[1.31,.73,.12]]} color="#c49b49" lineWidth={1.2}/>
  <Line points={[[-1.31,-.73,.12],[0,.08,.135],[1.31,-.73,.12]]} color="#d6b66d" lineWidth={.8} transparent opacity={.72}/>
  <mesh ref={flap} position={[0,.76,.14]} rotation-x={-.18}><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([-1.31,0,0,1.31,0,0,0,-.9,0]),3]}/></bufferGeometry><meshStandardMaterial color="#f8e6c4" roughness={.68} emissive="#a97427" emissiveIntensity={.16} side={THREE.DoubleSide}/></mesh>
  <mesh position={[0,-.075,.18]}><circleGeometry args={[.27,48]}/><meshBasicMaterial color="#e4bb62"/></mesh>
  <mesh position={[0,-.075,.19]}><circleGeometry args={[.225,48]}/><meshStandardMaterial color="#8f1834" roughness={.5} emissive="#5d071b" emissiveIntensity={.28}/></mesh>
  <mesh position={[0,-.075,.205]} rotation-z={Math.PI/4}><boxGeometry args={[.105,.105,.018]}/><meshBasicMaterial color="#f2cf7a"/></mesh>
 </group>}
