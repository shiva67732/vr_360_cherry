import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperience } from '../state/experienceStore'
import { composeLookOrientation, dragLook } from './lookOrientation'

const zee = new THREE.Vector3(0,0,1)
const euler = new THREE.Euler()
const q0 = new THREE.Quaternion()
const q1 = new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5))
const neutralOrientation = new THREE.Quaternion()

export function LookController({ orientationRig }:{ orientationRig: React.RefObject<THREE.Group|null> }) {
  const sensor = useExperience(s=>s.sensor), setSensor=useExperience(s=>s.setSensor)
  const target=useRef(new THREE.Quaternion()), raw=useRef(new THREE.Quaternion()), previousRaw=useRef(new THREE.Quaternion())
  const yawOffset=useRef(new THREE.Quaternion())
  const sensorOrientation=useRef(new THREE.Quaternion())
  const homeCalibration=useRef(false)
  const calibrated=useRef(false), drag=useRef({yaw:0,pitch:0,pointerId:null as number|null,x:0,y:0})
  const { gl }=useThree()

  useEffect(()=>{
    const orient=(event:DeviceOrientationEvent)=>{
      if(event.alpha==null||event.beta==null||event.gamma==null)return
      const o=(screen.orientation?.angle||0)*Math.PI/180
      euler.set(THREE.MathUtils.degToRad(event.beta),THREE.MathUtils.degToRad(event.alpha),-THREE.MathUtils.degToRad(event.gamma),'YXZ')
      raw.current.setFromEuler(euler).multiply(q1).multiply(q0.setFromAxisAngle(zee,-o))
      if(calibrated.current&&previousRaw.current.angleTo(raw.current)>1.05)return
      previousRaw.current.copy(raw.current)
      if(!calibrated.current){
        if(homeCalibration.current)yawOffset.current.copy(raw.current).invert()
        else {
          const forward=new THREE.Vector3(0,0,-1).applyQuaternion(raw.current)
          const heading=Math.atan2(forward.x,-forward.z)
          yawOffset.current.setFromAxisAngle(new THREE.Vector3(0,1,0),heading)
        }
        calibrated.current=true
      }
      // Preserve the phone's native pitch and roll, correcting only its compass
      // heading. This is the natural movement model used by the earlier version.
      sensorOrientation.current.copy(raw.current).premultiply(yawOffset.current)
      setSensor('active')
    }
    if(sensor!=='fallback'&&sensor!=='denied') window.addEventListener('deviceorientation',orient,true)
    return()=>window.removeEventListener('deviceorientation',orient,true)
  },[sensor,setSensor])

  useEffect(()=>{
    const recenter=()=>{homeCalibration.current=true;if(calibrated.current)yawOffset.current.copy(raw.current).invert();drag.current.yaw=0;drag.current.pitch=0;sensorOrientation.current.identity();target.current.identity();orientationRig.current?.quaternion.identity()}
    window.addEventListener('recenter-orientation',recenter)
    return()=>window.removeEventListener('recenter-orientation',recenter)
  },[orientationRig])

  useEffect(()=>{
    const el=gl.domElement, d=drag.current
    const surface=el.closest('main')||el
    const previousTouchAction=surface.style.touchAction
    surface.style.touchAction='none'
    const down=(e:PointerEvent)=>{ if(!e.isPrimary||e.button!==0||d.pointerId!==null)return;if(e.target instanceof Element&&e.target.closest('button,a,select,input,textarea,[contenteditable="true"],[role="button"]'))return;d.pointerId=e.pointerId;d.x=e.clientX;d.y=e.clientY;el.setPointerCapture(e.pointerId) }
    const move=(e:PointerEvent)=>{ if(e.pointerId!==d.pointerId)return;Object.assign(d,dragLook(d.yaw,d.pitch,e.clientX-d.x,e.clientY-d.y));d.x=e.clientX;d.y=e.clientY;e.preventDefault() }
    const up=(e:PointerEvent)=>{if(e.pointerId!==d.pointerId)return;d.pointerId=null;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId)}
    surface.addEventListener('pointerdown',down);surface.addEventListener('pointermove',move);surface.addEventListener('pointerup',up);surface.addEventListener('pointercancel',up);surface.addEventListener('lostpointercapture',up)
    return()=>{surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',up);surface.removeEventListener('lostpointercapture',up);surface.style.touchAction=previousTouchAction;if(d.pointerId!==null&&el.hasPointerCapture(d.pointerId))el.releasePointerCapture(d.pointerId);d.pointerId=null}
  },[gl])

  useFrame((_,dt)=>{ const rig=orientationRig.current;if(!rig)return;const base=sensor==='active'&&calibrated.current?sensorOrientation.current:neutralOrientation;composeLookOrientation(target.current,base,drag.current.yaw,drag.current.pitch);if(rig.quaternion.angleTo(target.current)>.0015)rig.quaternion.slerp(target.current,1-Math.exp(-11*dt)) })
  return null
}

export async function requestOrientation(set:(s:'unknown'|'active'|'fallback'|'denied')=>void){
  try { const D=DeviceOrientationEvent as typeof DeviceOrientationEvent & {requestPermission?:()=>Promise<'granted'|'denied'>}; if(D?.requestPermission){const p=await D.requestPermission();set(p==='granted'?'active':'denied')} else if('DeviceOrientationEvent' in window) set('unknown'); else set('fallback') } catch {set('fallback')}
}
