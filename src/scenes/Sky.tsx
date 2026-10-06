import { useExperience } from '../state/experienceStore'
import { atLeast } from '../utils/state'
import { Particles } from '../effects/Particles'

export function Sky() {
  const state = useExperience(s => s.state)
  return <Particles kind="stars" active={atLeast(state, 'DATE_REVEAL')}/>
}
