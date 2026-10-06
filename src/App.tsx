import { useCallback, useEffect, useState } from 'react'
import { Experience } from './experience/Experience'
import { Overlay } from './components/Overlay'
import { useExperience } from './state/experienceStore'
import { requestOrientation } from './controls/LookController'
import { audioManager } from './audio/AudioManager'
import { invitation } from './config/invitation'
import './intro.css'
import './date-reveal.css'

const sequence:Partial<Record<ReturnType<typeof useExperience.getState>['state'],[ReturnType<typeof useExperience.getState>['state'],number]>>={
  ENVELOPE_OPENING:['WORLD_REVEAL',2200], WORLD_REVEAL:['RANGOLI_TRAVEL',2200],
  RANGOLI_TRAVEL:['COUPLE_REVEAL',3400], COUPLE_REVEAL:['COUPLE_DANCE',1800],
  COUPLE_DANCE:['INVITATION_REVEAL',3000], INVITATION_REVEAL:['WAITING_LOOK_UP',3500],
}

export function App(){const entered=useExperience(s=>s.entered),state=useExperience(s=>s.state),enter=useExperience(s=>s.enter),set=useExperience(s=>s.setState),setSensor=useExperience(s=>s.setSensor),runId=useExperience(s=>s.runId);const [progress,setProgress]=useState(0),[worldReady,setWorldReady]=useState(false),[webgl]=useState(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch{return false}});const markWorldReady=useCallback(()=>setWorldReady(true),[])
 useEffect(()=>{let raf=0,start=performance.now();const tick=()=>{const v=Math.min(100,Math.round((performance.now()-start)/11));setProgress(v);if(v<100)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[])
 useEffect(()=>{const step=sequence[state];if(!step)return;const [next,delay]=step;const timer=window.setTimeout(()=>{set(next);if(next==='WORLD_REVEAL'){audioManager.play('magic');if(invitation.musicEnabled){audioManager.play('music',.32);audioManager.play('ambience',.22)}}if(next==='RING_EXCHANGE')audioManager.play('ring')},delay);return()=>clearTimeout(timer)},[state,set,runId])
 useEffect(()=>{if(state==='DATE_REVEAL'){const a=setTimeout(()=>set('WAITING_TURN_AROUND'),4200);return()=>clearTimeout(a)}if(state==='VENUE_REVEAL'){const a=setTimeout(()=>set('FINALE'),5200);return()=>clearTimeout(a)}},[state,set])
 const begin=async()=>{setWorldReady(false);audioManager.init();await requestOrientation((s)=>setSensor(s));enter()}
 if(!webgl)return <HtmlFallback/>
 return <main>{entered&&<Experience onReady={markWorldReady}/>}<Overlay/>{entered&&!worldReady&&<div className="world-loader"><div className="loader-crest">P <span>♥</span> V</div><div className="world-loader-ring"/><p>Entering our enchanted garden</p><small>Loading the 360° experience…</small></div>}{!entered&&<div className="entry"><div className="entry-glow"/><div className="royal-frame"><div className="royal-crest" aria-label="Prem and Vaishnavi"><b>P</b><span>♥</span><b>V</b></div>{progress<100?<div className="entry-loading"><p>Preparing our enchanted world</p><div className="loader"><i style={{width:`${progress}%`}}/></div><small>{progress}%</small></div>:<div className="entry-content"><h2 className="welcome-title">Welcome to Our Engagement</h2><p className="eyebrow">Request the pleasure of your company</p><div className="flourish"><i/><span>✦</span><i/></div><h1><strong>{invitation.groomName}</strong><span>&</span><strong>{invitation.brideName}</strong></h1><p className="occasion">As they begin their forever</p><button onClick={begin}>Enter the celebration</button><section className="vr-guide"><div className="vr-icon" aria-hidden="true">360°</div><div><h2>Enjoy the VR experience</h2><ul><li>Turn on sound</li><li>Allow motion access</li><li>Move your phone or drag to look around</li></ul></div></section></div>}</div></div>}</main>}
function HtmlFallback(){return <main className="fallback"><p>You’re invited to celebrate</p><h1>{invitation.brideName} & {invitation.groomName}</h1><h2>We’re getting engaged</h2><p>{invitation.date}<br/>{invitation.time}</p><p>{invitation.venueName}<br/>{invitation.venueAddress}</p><a href={invitation.directionsUrl}>Get directions</a></main>}
