import { useEffect, useState } from 'react'
import { invitation } from '../config/invitation'
import { states, useExperience, type ExperienceState } from '../state/experienceStore'
import { audioManager } from '../audio/AudioManager'
import { atLeast } from '../utils/state'

export function Overlay() {
 const state = useExperience(s => s.state), set = useExperience(s => s.setState)
 const muted = useExperience(s => s.muted), toggle = useExperience(s => s.toggleMute)
 const replay = useExperience(s => s.replay), sensor = useExperience(s => s.sensor)
 const runId = useExperience(s => s.runId)
 const [closedRun, setClosedRun] = useState<number | null>(null)
 const [debug] = useState(() => new URLSearchParams(location.search).get('debug') === 'true')
 useEffect(() => audioManager.mute(muted), [muted])
 const showDetails = atLeast(state, 'COUPLE_REVEAL')
 const directions = () => window.open(invitation.directionsUrl, '_blank', 'noopener,noreferrer')
 const hint = state === 'WAITING_LOOK_UP' ? 'Look up to enjoy the sparkling sky ✦'
   : state === 'WAITING_TURN_AROUND' ? 'Turn around to explore the venue ↻'
   : state === 'FINALE' ? 'We can’t wait to celebrate with you.'
   : 'Drag to explore · Tap a dove for a little love'
 return <div className="overlay">
  {state === 'DARK_WORLD' && <div className="prompt low"><span>Tap the envelope</span><small>Drag to look around</small></div>}
  {showDetails && closedRun !== runId && <section className="invitation-dock" aria-label="Engagement invitation details">
   <button type="button" className="popup-close" aria-label="Close invitation details" title="Close" onClick={() => setClosedRun(runId)}>×</button>
   <small className="dock-eyebrow">Together with our families · We’re getting engaged</small>
   <h1><span className="dock-person">{invitation.groomName}</span><span className="dock-ampersand">&</span><span className="dock-person">{invitation.brideName}</span></h1>
   <div className="dock-information">
    <div className="dock-date"><strong>{invitation.date}</strong><span>{invitation.time}</span></div>
    <div className="dock-venue"><strong>{invitation.venueName}</strong><span>{invitation.venueAddress}</span></div>
   </div>
   <div className="dock-footer"><p>{hint}</p><div className="dock-actions"><button type="button" onClick={directions}>Get directions</button>{state === 'FINALE' && <button type="button" className="dock-replay" onClick={() => { audioManager.stopAll(); replay() }}>Replay</button>}</div></div>
  </section>}
  {showDetails && closedRun === runId && <button className="details-reopen" type="button" onClick={() => setClosedRun(null)}>Invitation details</button>}
  {atLeast(state, 'DARK_WORLD') && <div className="utility"><button aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggle}>{muted ? '♪̸' : '♪'}</button><button className="recenter-button" aria-label="Recenter view" title="Return to the default view" onClick={() => window.dispatchEvent(new Event('recenter-orientation'))}>⌾ Recenter</button></div>}
  {debug && <Debug state={state} sensor={sensor} set={set}/>}
 </div>
}
function Debug({state,sensor,set}:{state:ExperienceState;sensor:string;set:(s:ExperienceState)=>void}){const quality=useExperience(s=>s.quality);return <aside className="debug"><b>Debug</b><span>{state}</span><span>sensor: {sensor}</span><span>quality: {quality}</span><select value={state} onChange={e=>set(e.target.value as ExperienceState)}>{states.map(s=><option key={s}>{s}</option>)}</select></aside>}
