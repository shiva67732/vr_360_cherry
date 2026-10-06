import assert from 'node:assert/strict'
import { Euler, Quaternion, Vector3 } from 'three'
import { composeLookOrientation, dragLook } from '../src/controls/lookOrientation.ts'

const identity = new Quaternion(), target = new Quaternion()
const direction = q => new Vector3(0, 0, -1).applyQuaternion(q)
const phone = new Quaternion().setFromEuler(new Euler(.3, .7, -.2, 'YXZ'))
assert(composeLookOrientation(target, phone, 0, 0).angleTo(phone) < 1e-7)
const swipeRight = dragLook(0, 0, 100, 0)
assert(direction(composeLookOrientation(target, identity, swipeRight.yaw, swipeRight.pitch)).x < 0)
const swipeDown = dragLook(0, 0, 0, 100)
assert(direction(composeLookOrientation(target, identity, swipeDown.yaw, swipeDown.pitch)).y > 0)
assert(composeLookOrientation(target, phone, swipeRight.yaw, 0).angleTo(phone) > .4)
const turnedPhone = new Quaternion().setFromEuler(new Euler(.3, 1.1, -.2, 'YXZ'))
const before = composeLookOrientation(new Quaternion(), phone, .5, .2)
const after = composeLookOrientation(new Quaternion(), turnedPhone, .5, .2)
assert(before.angleTo(after) > .3) // Motion still works after a touch drag.
const fullTurn = dragLook(0, 0, Math.PI * 2 / .005, 0)
assert(composeLookOrientation(target, identity, fullTurn.yaw, 0).angleTo(identity) < 1e-7)
assert(dragLook(0, 0, 100000, 100000).yaw > Math.PI * 2)
assert(dragLook(0, 0, 0, 100000).pitch > Math.PI * 2)
assert(dragLook(0, 0, 0, -100000).pitch < -Math.PI * 2)
const verticalTurn = dragLook(0, 0, 0, Math.PI * 2 / .005)
assert(composeLookOrientation(target, identity, 0, verticalTurn.pitch).angleTo(identity) < 1e-7)
const firstSwipe = dragLook(0, 0, 100, 100)
const nextSwipe = dragLook(firstSwipe.yaw, firstSwipe.pitch, 100, 100)
assert.equal(nextSwipe.yaw, 1); assert.equal(nextSwipe.pitch, 1)
assert(composeLookOrientation(target, identity, 0, 0).angleTo(identity) < 1e-7)
console.log('PASS: sensor pose preserved; scenery follows swipes; touch and motion combine; unlimited horizontal/vertical rotation; repeated swipes accumulate; recenter offsets reset.')
