export const invitation = {
  brideName: 'Vaishnavi K R',
  groomName: 'Prem Kiran',
  date: '20 December 2026',
  time: '6:30 PM onwards',
  venueName: 'The Royal Garden',
  venueAddress: 'Your venue address, city',
  directionsUrl: 'https://maps.google.com/',
  musicEnabled: true,
} as const

export const assets = {
  useModels: false,
  models: {
    environment: '/models/environment.glb', envelope: '/models/envelope.glb',
    bride: '/models/bride.glb', groom: '/models/groom.glb', stage: '/models/stage.glb',
    ringBox: '/models/ring-box.glb', ring: '/models/ring.glb', venue: '/models/venue.glb',
  },
} as const
