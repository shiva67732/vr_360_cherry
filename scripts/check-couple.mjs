import fs from 'node:fs'
import assert from 'node:assert/strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { AnimationMixer, LoopRepeat, Vector3, Box3 } from 'three'

const original = fs.readFileSync(new URL('../public/models/couple-rigged-2p5d.glb', import.meta.url))
const size = original.readUInt32LE(12)
const json = JSON.parse(original.toString('utf8', 20, 20 + size))
assert.deepEqual(json.skins.map(s => s.joints.length), [7, 7])
assert(json.materials.every(m => m.extensions.KHR_materials_unlit))
assert(json.images.every(i => i.bufferView !== undefined))
// Skip browser image decoding only in this CPU check. Never modify the actual GLB.
for (const m of json.materials) delete m.pbrMetallicRoughness.baseColorTexture
delete json.images; delete json.textures; delete json.samplers
const bytes = Buffer.from(JSON.stringify(json)), padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4, 32)
bytes.copy(padded)
const binary = original.subarray(20 + size), glb = Buffer.alloc(20 + padded.length + binary.length)
glb.writeUInt32LE(0x46546c67, 0); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(glb.length, 8)
glb.writeUInt32LE(padded.length, 12); glb.writeUInt32LE(0x4e4f534a, 16)
padded.copy(glb, 20); binary.copy(glb, 20 + padded.length)
const asset = await new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), '')
const root = clone(asset.scene), other = clone(asset.scene)
const clip = asset.animations.find(a => a.name === 'Idle_Alive')
assert(clip); assert.equal(clip.duration, 8)
const mixer = new AnimationMixer(root)
mixer.clipAction(clip).setLoop(LoopRepeat, Infinity).play()
const blinks = { Groom: new Set(), Bride: new Set() }, heads = { Groom: new Set(), Bride: new Set() }
for (const name of ['Groom', 'Bride']) {
  assert(root.getObjectByName(name)); assert(root.getObjectByName(name + '_ContactShadow'))
  const mesh = root.getObjectByName(name + '_DeformingArtwork')
  assert(mesh.isSkinnedMesh); assert.notEqual(mesh.skeleton, other.getObjectByName(name + '_DeformingArtwork').skeleton)
  for (const suffix of ['Feet','Hips','Spine','Chest','Head','ArmLeft','ArmRight']) assert(mesh.skeleton.getBoneByName(name + '_' + suffix))
}
let independent = false
for (let frame = 0; frame <= 960; frame++) {
  mixer.setTime(frame / 60); root.updateMatrixWorld(true)
  const values = []
  for (const name of ['Groom', 'Bride']) {
    const mesh = root.getObjectByName(name + '_DeformingArtwork'); mesh.skeleton.update()
    const blink = root.getObjectByName(name + '_Blink').morphTargetInfluences[0]
    assert(Number.isFinite(blink)); blinks[name].add(blink); values.push(blink)
    heads[name].add(mesh.skeleton.getBoneByName(name + '_Head').quaternion.toArray().map(n => n.toFixed(6)).join(','))
    const positions = mesh.geometry.attributes.position
    for (let i = 0; i < positions.count; i++) assert(mesh.applyBoneTransform(i, new Vector3().fromBufferAttribute(positions, i)).toArray().every(Number.isFinite))
  }
  if (Math.abs(values[0] - values[1]) > .1) independent = true
}
for (const name of ['Groom', 'Bride']) {
  // STEP blink interpolation uses exactly the two supplied eye states.
  assert(blinks[name].has(0) && blinks[name].has(1)); assert(heads[name].size > 2)
}
assert(independent)
mixer.setTime(0); root.updateMatrixWorld(true)
const bounds = new Box3().setFromObject(root)
assert(bounds.min.x > -2.5 && bounds.max.x < 2.5)
mixer.stopAllAction(); mixer.uncacheRoot(root)
console.log('PASS: GLB loads, embedded unlit artwork, independent seven-bone skeleton clones, 8-second clip, independent blinking/head motion, finite deformed vertices across two loops, stage width fits.')
