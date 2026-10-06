# Engagement Invitation

A mobile-first cinematic 3D engagement invitation built with React, TypeScript, Vite, React Three Fiber, Three.js, GSAP and Zustand. The complete sequence works immediately with procedural placeholders.

## Run locally

```bash
npm install
npm run dev
```

For phone testing, connect the phone and laptop to the same Wi-Fi and open
`https://10.110.23.244:5173/`. The development certificate is self-signed, so
the browser may ask you to accept a local certificate warning once.

Create a production build with `npm run build`; the static output is written to `dist/` and can be deployed to any static host.

## Personalize

Edit `src/config/invitation.ts` for names, date, time, venue and the directions URL. All visible invitation details are sourced from this file.

## Add final assets

Put GLB files in `public/models/` and audio in `public/audio/`, using the names in the specification. Set `assets.useModels` to `true` after the models are ready. Animation name aliases live in `src/animation/animationConfig.ts`; add the exact clip names exported by your files there.

Expected audio names: `music.mp3`, `ambience.mp3`, `envelope.mp3`, `magic-whoosh.mp3`, and `ring-chime.mp3`. Missing audio never stops the experience.

## Device orientation

Test on a real phone over HTTPS. iPhone Safari requests motion permission after **Enter experience** is tapped. If permission or sensor data is unavailable, drag-to-look activates automatically. Desktop uses mouse or touch dragging.

## Debugging

Open `/?debug=true` to show the state, sensor mode, quality level, and a scene selector. This lets you jump directly to any part of the sequence.
