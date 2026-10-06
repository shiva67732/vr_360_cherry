export const invitation = {
  brideName: 'Vaishnavi K R',
  groomName: 'Prem Kiran',
  date: '15 October 2026',
  time: '10:00–11:30 AM',
  venueName: 'Ravi Kiran Estate',
  venueAddress: 'Badamanavarathekaval, Karnataka 560082',
  directionsUrl: 'https://maps.app.goo.gl/NsyAKMfdyhq74Ref9',
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
