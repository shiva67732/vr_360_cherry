import { Quaternion, Vector3 } from 'three'

const worldUp = new Vector3(0, 1, 0)
const localRight = new Vector3(1, 0, 0)
const yawRotation = new Quaternion()
const pitchRotation = new Quaternion()

export function composeLookOrientation(target: Quaternion, sensor: Quaternion, yaw: number, pitch: number) {
  // Horizontal dragging rotates around world up; vertical dragging uses the
  // phone's local right axis. Zero offsets preserve the sensor pose exactly.
  return target.copy(sensor)
    .premultiply(yawRotation.setFromAxisAngle(worldUp, yaw))
    .multiply(pitchRotation.setFromAxisAngle(localRight, pitch))
}

export function dragLook(yaw: number, pitch: number, dx: number, dy: number) {
  // Grab the panorama: the scenery follows the finger in both directions.
  return { yaw: yaw + dx * .005, pitch: pitch + dy * .005 }
}
