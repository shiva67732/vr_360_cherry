import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperience } from '../state/experienceStore'
import { atLeast } from '../utils/state'

// Microsoft Fluent animated emoji, MIT. See public/doves/LICENSE.txt.
// Five stage companions and five wider garden flyers, all in world space.
export function Doves() {
  const group = useRef<THREE.Group>(null)
  const state = useExperience(s => s.state)
  const runId = useExperience(s => s.runId)
  const flock = useRef<THREE.Sprite[]>([])
  const time = useRef(0)
  const visible = atLeast(state, 'COUPLE_REVEAL')
  useEffect(() => {
    let disposed = false
    time.current = 0
    const loaded = new THREE.TextureLoader().load('/doves/dove-atlas.webp', texture => {
      if (disposed) { texture.dispose(); return }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = false
      texture.minFilter = THREE.LinearFilter
      flock.current = Array.from({ length: 10 }, (_, i) => {
        const map = texture.clone()
        map.repeat.set(1 / 6, 1 / 6)
        map.needsUpdate = true
        const material = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })
        const bird = new THREE.Sprite(material)
        bird.scale.setScalar(i < 5 ? .65 + (i % 3) * .1 : .95 + (i % 3) * .12)
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
      loaded.dispose()
    }
  }, [runId])
  useFrame(({ camera }, delta) => {
    if (!visible) return
    time.current += Math.min(delta, .1)
    flock.current.forEach((bird, i) => {
      const t = time.current
      const stageBird = i < 5
      const index = i % 5
      const direction = index % 2 === 0 ? 1 : -1
      const speed = direction * (stageBird ? .18 + index * .025 : .24 + index * .03)
      const angle = t * speed + index * Math.PI * 2 / 5 + (stageBird ? 0 : .7)
      const radiusX = stageBird ? 3.2 + (index % 3) * .65 : 7 + index * .65
      const radiusZ = stageBird ? 1.8 + (index % 4) * .5 : 8 + index * .5
      bird.position.set(
        Math.sin(angle) * radiusX,
        (stageBird ? 3.7 : 3.2) + (index % 3) * .65 + Math.sin(t * (stageBird ? .65 : .45) + i * 1.7) * (stageBird ? .35 : .7),
        (stageBird ? -14 : -5) + Math.cos(angle) * radiusZ,
      )
      // Face the direction of travel on screen, even when guests turn around.
      const screenVelocity = Math.cos(angle) * radiusX * speed * camera.matrixWorld.elements[0]
        - Math.sin(angle) * radiusZ * speed * camera.matrixWorld.elements[2]
      if (Math.abs(screenVelocity) > .08) {
        bird.scale.x = Math.abs(bird.scale.x) * (screenVelocity > 0 ? -1 : 1)
      }
      bird.material.rotation = Math.sin(angle + i) * .12
      const frame = Math.floor((t + i * .21) / .084) % 36
      bird.material.map!.offset.set((frame % 6) / 6, (5 - Math.floor(frame / 6)) / 6)
    })
  })
  return <group ref={group} visible={visible} />
}
