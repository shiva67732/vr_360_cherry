import { useEffect, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperience } from '../state/experienceStore'
import { atLeast } from '../utils/state'

// Microsoft Fluent animated emoji, MIT. See public/doves/LICENSE.txt.
// Keep the original flock and add ten nearby flyers around the whole garden.
export function Doves() {
  const group = useRef<THREE.Group>(null)
  const state = useExperience(s => s.state)
  const runId = useExperience(s => s.runId)
  const flock = useRef<THREE.Sprite[]>([])
  const time = useRef(0)
  const hearts = useRef<THREE.Sprite[]>([])
  const burst = useRef({ started: -100, origin: new THREE.Vector3() })
  const visible = atLeast(state, 'COUPLE_REVEAL')
  useEffect(() => {
    let disposed = false
    time.current = 0
    burst.current.started = -100
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')!
    context.fillStyle = '#ff2448'
    context.beginPath()
    context.moveTo(32, 56)
    context.bezierCurveTo(4, 38, 0, 18, 14, 9)
    context.bezierCurveTo(23, 3, 31, 9, 32, 17)
    context.bezierCurveTo(33, 9, 41, 3, 50, 9)
    context.bezierCurveTo(64, 18, 60, 38, 32, 56)
    context.fill()
    const heartTexture = new THREE.CanvasTexture(canvas)
    heartTexture.colorSpace = THREE.SRGBColorSpace
    hearts.current = Array.from({ length: 12 }, (_, i) => {
      const heart = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTexture, transparent: true, depthWrite: false, toneMapped: false }))
      heart.visible = false
      heart.scale.setScalar(.16 + (i % 3) * .045)
      heart.raycast = () => {} // Decorative hearts never intercept taps or drags.
      group.current?.add(heart)
      return heart
    })
    const loaded = new THREE.TextureLoader().load('/doves/dove-atlas.webp', texture => {
      if (disposed) { texture.dispose(); return }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = false
      texture.minFilter = THREE.LinearFilter
      flock.current = Array.from({ length: 28 }, (_, i) => {
        const map = texture.clone()
        map.repeat.set(1 / 6, 1 / 6)
        map.needsUpdate = true
        const material = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })
        const bird = new THREE.Sprite(material)
        bird.userData.size = (i < 8 ? .65 + (i % 3) * .1 : .95 + (i % 3) * .12) * 1.5
        bird.userData.faceRight = i % 2 === 0
        bird.userData.twirled = -100
        bird.scale.setScalar(bird.userData.size)
        group.current?.add(bird)
        return bird
      })
    }, undefined, error => console.error('Could not load the animated doves', error))
    return () => {
      disposed = true
      flock.current.forEach(bird => {
        group.current?.remove(bird)
        bird.material.map?.dispose()
        bird.material.dispose()
      })
      flock.current = []
      hearts.current.forEach(heart => { group.current?.remove(heart); heart.material.dispose() })
      hearts.current = []
      heartTexture.dispose()
      loaded.dispose()
    }
  }, [runId])
  useFrame(({ camera }, delta) => {
    if (!visible) return
    time.current += Math.min(delta, .1)
    const burstAge = time.current - burst.current.started
    hearts.current.forEach((heart, i) => {
      heart.visible = burstAge >= 0 && burstAge < 1.8
      if (!heart.visible) return
      const angle = i * Math.PI * 2 / 12
      const spread = burstAge * (.65 + (i % 3) * .15)
      const origin = burst.current.origin
      heart.position.set(origin.x + Math.cos(angle) * spread, origin.y + Math.sin(angle) * spread + burstAge * .7, origin.z + Math.sin(i * 2.4) * spread * .45)
      heart.material.opacity = Math.max(0, 1 - burstAge / 1.8)
      heart.material.rotation = Math.sin(i + burstAge * 3) * .3
    })
    flock.current.forEach((bird, i) => {
      const t = time.current
      const stageBird = i < 8
      const sceneBird = i >= 18
      const index = stageBird ? i : sceneBird ? i - 18 : i - 8
      const direction = index % 2 === 0 ? 1 : -1
      const speed = direction * (stageBird ? .16 + (index % 5) * .025 : sceneBird ? .2 + (index % 5) * .035 : .22 + (index % 6) * .03)
      const angle = t * speed + index * Math.PI * 2 / (stageBird ? 8 : 10) + (stageBird ? 0 : sceneBird ? 1.8 : .7)
      const radiusX = stageBird ? 3.2 + (index % 3) * .65 : sceneBird ? 4.8 + (index % 4) * .65 : 7 + (index % 5) * .65
      const radiusZ = stageBird ? 1.8 + (index % 4) * .5 : sceneBird ? 5 + (index % 4) * .5 : 8 + (index % 5) * .5
      bird.position.set(
        Math.sin(angle) * radiusX,
        (stageBird ? 3.7 : sceneBird ? 2.9 : 3.2) + (index % 3) * .65 + Math.sin(t * (stageBird ? .65 : .45) + i * 1.7) * (stageBird ? .35 : .7),
        (stageBird ? -14 : sceneBird ? -6 : -5) + Math.cos(angle) * radiusZ,
      )
      // Face the direction of travel on screen, even when guests turn around.
      const screenVelocity = Math.cos(angle) * radiusX * speed * camera.matrixWorld.elements[0]
        - Math.sin(angle) * radiusZ * speed * camera.matrixWorld.elements[2]
      if (Math.abs(screenVelocity) > .08) {
        bird.userData.faceRight = screenVelocity > 0
      }
      bird.material.rotation = Math.sin(angle + i) * .12
      const twirlAge = t - bird.userData.twirled
      const twirling = twirlAge >= 0 && twirlAge < 1.2
      const hop = twirling ? Math.sin(twirlAge / 1.2 * Math.PI) : 0
      const size = bird.userData.size * (1 + hop * .18)
      bird.scale.setScalar(size)
      if (twirling) {
        bird.position.y += hop * .65
        bird.material.rotation += Math.PI * 2 * (twirlAge / 1.2)
      }
      const frame = Math.floor((t + i * .21) / .084) % 36
      // Sprite shaders use unsigned scale; flip the atlas UVs to turn the bird.
      const map = bird.material.map!
      map.repeat.x = bird.userData.faceRight ? -1 / 6 : 1 / 6
      map.offset.set(((frame % 6) + (bird.userData.faceRight ? 1 : 0)) / 6, (5 - Math.floor(frame / 6)) / 6)
    })
  })
  const tapDove = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 6 || !flock.current.includes(event.object as THREE.Sprite)) return
    event.stopPropagation()
    const bird = event.object as THREE.Sprite
    bird.userData.twirled = time.current
    burst.current.started = time.current
    burst.current.origin.copy(bird.position)
  }
  return <group ref={group} visible={visible} onClick={tapDove} />
}
