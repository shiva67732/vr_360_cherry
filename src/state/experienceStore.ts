import { create } from 'zustand'

export const states = ['LOADING','DARK_WORLD','ENVELOPE_OPENING','WORLD_REVEAL','RANGOLI_TRAVEL','COUPLE_REVEAL','COUPLE_DANCE','RING_REVEAL','RING_EXCHANGE','INVITATION_REVEAL','WAITING_LOOK_UP','DATE_REVEAL','WAITING_TURN_AROUND','VENUE_REVEAL','FINALE'] as const
export type ExperienceState = typeof states[number]
type Quality = 'LOW' | 'MEDIUM' | 'HIGH'

const quality = (): Quality => {
  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
  return cores <= 4 || memory <= 3 ? 'LOW' : cores >= 8 && memory >= 8 ? 'HIGH' : 'MEDIUM'
}

interface Store {
  state: ExperienceState; entered: boolean; muted: boolean; sensor: 'unknown'|'active'|'fallback'|'denied'
  quality: Quality; runId: number; setState: (s: ExperienceState) => void; enter: () => void
  toggleMute: () => void; setSensor: (s: Store['sensor']) => void; replay: () => void
}
export const useExperience = create<Store>((set) => ({
  state: 'LOADING', entered: false, muted: false, sensor: 'unknown', quality: quality(), runId: 0,
  setState: (state) => set({ state }), enter: () => set({ entered: true, state: 'DARK_WORLD' }),
  toggleMute: () => set((s) => ({ muted: !s.muted })), setSensor: (sensor) => set({ sensor }),
  replay: () => set((s) => ({ state: 'DARK_WORLD', runId: s.runId + 1 })),
}))
