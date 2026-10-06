import { useEffect, useState } from 'react'
import { invitation } from '../config/invitation'
import { states, useExperience, type ExperienceState } from '../state/experienceStore'
import { audioManager } from '../audio/AudioManager'
import { atLeast } from '../utils/state'

export function Overlay(){const state=useExperience(s=>s.state),set=useExperience(s=>s.setState),muted=useExperience(s=>s.muted),toggle=useExperience(s=>s.toggleMute),replay=useExperience(s=>s.replay),sensor=useExperience(s=>s.sensor);const [debug]=useState(()=>new URLSearchParams(location.search).get('debug')==='true')
 useEffect(()=>audioManager.mute(muted),[muted])
 const runId=useExperience(s=>s.runId),[dismissed,setDismissed]=useState<Set<string>>(()=>new Set())
 const visible=(card:string)=>!dismissed.has(`${runId}:${card}`)
 const close=(card:string)=>setDismissed(previous=>new Set(previous).add(`${runId}:${card}`))
 const cancel=(card:string)=><button type="button" className="popup-close" aria-label={`Close ${card} card`} title="Close" onClick={()=>close(card)}>×</button>
 const directions=()=>window.open(invitation.directionsUrl,'_blank','noopener,noreferrer')
 return <div className="overlay">
  {state==='DARK_WORLD'&&<div className="prompt low"><span>Tap the envelope</span><small>Drag to look around</small></div>}
  {(state==='COUPLE_REVEAL'||state==='COUPLE_DANCE')&&visible('couple')&&<div className="couple-popup dismissible-popup">{cancel('couple')}<Names compact/></div>}
  {(state==='INVITATION_REVEAL'||state==='WAITING_LOOK_UP')&&visible('invitation')&&<div className="card dismissible-popup">{cancel('invitation')}<Names/><p>Together with our families,<br/>we invite you to celebrate our special day.</p>{state==='WAITING_LOOK_UP'&&<strong className="gesture">Look up <i>✦</i></strong>}</div>}
  {state==='WAITING_TURN_AROUND'&&visible('date')&&<div className="date-confirmed dismissible-popup">{cancel('date')}<small>Our engagement</small><strong>{invitation.date}</strong><span>{invitation.time}</span><em>Turn around for the venue ↻</em></div>}
  {state==='VENUE_REVEAL'&&visible('venue')&&<div className="venue-card dismissible-popup">{cancel('venue')}<small>Engagement venue</small><h2>{invitation.venueName}</h2><p>{invitation.venueAddress}</p><p>{invitation.date} · {invitation.time}</p><button onClick={directions}>Get directions</button></div>}
  {state==='FINALE'&&visible('finale')&&<div className="final-card dismissible-popup">{cancel('finale')}<Names/><p>{invitation.date}<br/>{invitation.time}</p><em>We can’t wait to celebrate with you.</em><div className="actions"><button onClick={directions}>Get directions</button><button className="ghost" onClick={()=>{audioManager.stopAll();replay()}}>Replay experience</button></div></div>}
  {atLeast(state,'DARK_WORLD')&&<div className="utility"><button aria-label={muted?'Unmute':'Mute'} onClick={toggle}>{muted?'♪̸':'♪'}</button><button aria-label="Recenter view" onClick={()=>window.dispatchEvent(new Event('recenter-orientation'))}>⌾</button></div>}
  {debug&&<Debug state={state} sensor={sensor} set={set}/>} 
 </div>}
function Names({compact=false}:{compact?:boolean}){return <div className={'names '+(compact?'compact':'')}><h1>{invitation.groomName}<span>&</span>{invitation.brideName}</h1><small>We’re getting engaged</small></div>}
function Debug({state,sensor,set}:{state:ExperienceState;sensor:string;set:(s:ExperienceState)=>void}){const quality=useExperience(s=>s.quality);return <aside className="debug"><b>Debug</b><span>{state}</span><span>sensor: {sensor}</span><span>quality: {quality}</span><select value={state} onChange={e=>set(e.target.value as ExperienceState)}>{states.map(s=><option key={s}>{s}</option>)}</select></aside>}
