// src/lib/three/TendrilSystem.js
// Organic grown structures wrapping around the sphere.
// Many small cubes packed tightly along curved paths,
// overlapping to form continuous ribbon-like chains.

import * as THREE from 'three'

// ------------------------------------------------------------ CONFIG

const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const CUBES_PER_PATH = IS_MOBILE ? 64 : 96
const MAX_PATHS_MOBILE = 25

// ------------------------------------------------------------ TENDRIL SYSTEM

export class TendrilSystem {
  constructor(scene) {
    this._scene = scene
    this._mesh = null
    this._pathCount = 0
    this._totalInstances = 0
    this._dummy = new THREE.Object3D()
    this._time = 0
    this._paths = []
    this._pulseAmount = 0.01
    this._pulseRate = 0.15
  }

  // ------------------------------------------------------------ BUILD

  build(config) {
    this.dispose()

    const rawCount = (config.tendrilCount ?? 30) * 2.0
    const pathCount = IS_MOBILE ? Math.min(rawCount, MAX_PATHS_MOBILE) : rawCount
    const totalInstances = pathCount * CUBES_PER_PATH
    this._pathCount = pathCount
    this._totalInstances = totalInstances

    // Small cube — sized to overlap with neighbours at CUBES_PER_PATH density
    const thickness = config.tendrilThickness * 2.0 ?? 0.01
    const geo = new THREE.BoxGeometry(thickness, thickness, thickness)

    // Metallic but not mirror-shiny — picks up coloured light
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.lightKey ?? config.color ?? '#ffffff'),
      roughness: 0.05,
      metalness: 0.95,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      envMapIntensity: 3.0,
    })

    if (this._scene.environment) {
      mat.envMap = this._scene.environment
    }

    this._mesh = new THREE.InstancedMesh(geo, mat, totalInstances)
    this._mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    // Generate paths — each is a curved trajectory wrapping around the sphere
    this._paths = []
    for (let p = 0; p < pathCount; p++) {
      const phi = Math.acos(1 - 2 * Math.random())
      const theta = Math.random() * Math.PI * 2

      this._paths.push({
        startPhi: phi,
        startTheta: theta,
        pathLength: config.tendrilLength ?? 0.3,
        noiseOffset: Math.random() * config.tendrilCount * 10,
        heightBase: (config.tendrilCount * 0.001) + Math.random() * (config.tendrilCount * 0.002),
        curvature: (config.tendrilCount * 0.005) + Math.random() * 2.0,
        direction: Math.random() > 0.5 ? 1 : -1,  // CW or CCW wrap
        tilt: (Math.random() - 0.5) * (config.tendrilCount * 0.05),  // Tilt the path up/down
      })
    }

    this._updateAllInstances(0)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------ ANIMATE

  update(deltaTime, config) {
    if (!this._mesh || !this._paths.length) return
    this._time += deltaTime
    this._pulseAmount = config.tendrilPulseAmount ?? 0.01
    this._pulseRate = config.tendrilPulseRate ?? 0.15
    this._updateAllInstances(this._time)
  }

  _updateAllInstances(time) {
    const sphereRadius = 1.0
    let idx = 0

    for (let p = 0; p < this._pathCount; p++) {
      const path = this._paths[p]
      const noisePhase = path.noiseOffset + time * 0.3

      for (let c = 0; c < CUBES_PER_PATH; c++) {
        const t = c / (CUBES_PER_PATH - 1)  // 0 → 1 along path

        // Walk along the sphere surface following a curved, wrapping path
        const progress = t * path.pathLength * path.direction

        // Phi/theta trace a curve on the sphere surface
        const phi = path.startPhi
          + path.tilt * t
          + Math.sin(t * path.curvature * Math.PI + noisePhase) * 0.15
        const theta = path.startTheta
          + progress * 3.0
          + Math.cos(t * path.curvature * 1.5 + noisePhase * 0.6) * 0.1

        // Height: cubes sit just above the sphere surface
        const midBulge = Math.sin(t * Math.PI) * 0.03
        const breathe = Math.sin(noisePhase * 2 + t * 5) * path.heightBase * 0.5

        // Resting radius — the cube's natural position without any pulse
        const baseR = sphereRadius + path.heightBase + midBulge + breathe

        // Per-cube pulse — outward-only offset from resting position
        // Each cube gets its own rate, amplitude, and phase so they ripple independently
        const cubeSeed = path.noiseOffset + (c * 0.06)
        const cubeRate = this._pulseRate * (0.1 + 0.25 * ((Math.sin(cubeSeed * 3.17) + 1) * 0.5))
        const cubeAmp = this._pulseAmount * (0.1 + 0.5 * ((Math.sin(cubeSeed * 5.43) + 1) * 0.5))
        const cubePhase = cubeSeed * 2.71
        // Remap sin [-1,1] to [0,1] — pulse only pushes outward from resting position
        const pulse = ((Math.sin(time * cubeRate * Math.PI * 2 + cubePhase) + 1) * 0.5) * cubeAmp

        const r = baseR + pulse

        // Spherical → cartesian
        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.cos(phi)
        const z = r * Math.sin(phi) * Math.sin(theta)

        this._dummy.position.set(x, y, z)

        // Orient: face outward from centre, then rotate to follow path
        this._dummy.lookAt(0, 0, 0)
        this._dummy.rotateZ(theta + t * 0.8)  // Twist along the path

        // Scale: taper at ends, fuller in the middle
        const taper = Math.sin(t * Math.PI)  // 0 at ends, 1 in middle
        const scale = (0.3 + taper * 0.7 + Math.sin(noisePhase + t * 3) * 0.5) + cubeAmp
        this._dummy.scale.set(scale, scale * 0.7, scale)

        this._dummy.updateMatrix()
        this._mesh.setMatrixAt(idx, this._dummy.matrix)
        idx++
      }
    }

    this._mesh.instanceMatrix.needsUpdate = true
  }

  // ------------------------------------------------------------ CONFIG

  updateConfig(config) {
    if (!config) return

    const count = config.tendrilCount ?? 60

    if (Math.abs(count - this._pathCount) > 5 || !this._mesh) {
      this.build(config)
    } else if (this._mesh) {
      const color = config.lightKey ?? config.color ?? '#ffffff'
      this._mesh.material.color.set(color)
    }
  }

  setEnvMap(envMap) {
    if (this._mesh?.material) {
      this._mesh.material.envMap = envMap
      this._mesh.material.needsUpdate = true
    }
  }

  dispose() {
    if (this._mesh) {
      this._scene.remove(this._mesh)
      this._mesh.geometry.dispose()
      this._mesh.material.dispose()
      this._mesh = null
    }
    this._pathCount = 0
    this._totalInstances = 0
    this._paths = []
  }
}
