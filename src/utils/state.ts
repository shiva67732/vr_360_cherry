import type { ExperienceState } from '../state/experienceStore'
export const atLeast = (current: ExperienceState, target: ExperienceState) => {
  const order: ExperienceState[] = ['LOADING','DARK_WORLD','ENVELOPE_OPENING','WORLD_REVEAL','RANGOLI_TRAVEL','COUPLE_REVEAL','COUPLE_DANCE','RING_REVEAL','RING_EXCHANGE','INVITATION_REVEAL','WAITING_LOOK_UP','DATE_REVEAL','WAITING_TURN_AROUND','VENUE_REVEAL','FINALE']
  return order.indexOf(current) >= order.indexOf(target)
}
