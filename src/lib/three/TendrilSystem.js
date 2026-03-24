// src/lib/three/TendrilSystem.js
// Organic structures wrapping around the sphere surface.
// Uses InstancedMesh with small cubes arranged along curved
// paths that spiral around the orb — not poking outward.

import * as THREE from 'three'

// ------------------------------------------------------------ TENDRIL SYSTEM

export class TendrilSystem {
  constructor(scene) {
    this._scene = scene
    this._mesh = null
    this._pathCount = 0
    this._totalInstances = 0
    this._dummy = new THREE.Object3D()
    this._time = 0
    this._paths = []  // Stored path data for animation
  }

  // ------------------------------------------------------------ BUILD

  build(config) {
    this.dispose()

    const pathCount = config.tendrilCount ?? 60
    const cubesPerPath = 8
    const totalInstances = pathCount * cubesPerPath
    this._pathCount = pathCount
    this._totalInstances = totalInstances

    // Small rounded box geometry
    const size = config.tendrilThickness ?? 0.01
    const geo = new THREE.BoxGeometry(size * 3, size * 2, size * 3)
    // Round the edges slightly
    geo.computeVertexNormals()

    // Metallic material matching the design
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.lightKey ?? '#ffffff'),
      roughness: 0.15,
      metalness: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 4.0,
    })

    if (this._scene.environment) {
      mat.envMap = this._scene.environment
    }

    this._mesh = new THREE.InstancedMesh(geo, mat, totalInstances)
    this._mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    // Generate paths — curved lines wrapping around the sphere
    this._paths = []
    const sphereRadius = 1.05  // Slightly above sphere surface

    for (let p = 0; p < pathCount; p++) {
      // Random starting point on sphere
      const phi = Math.acos(1 - 2 * Math.random())
      const theta = Math.random() * Math.PI * 2

      // Path direction — a tangent direction along the sphere
      const tangentAngle = Math.random() * Math.PI * 2
      const pathLength = config.tendrilLength ?? 0.3

      const pathData = {
        startPhi: phi,
        startTheta: theta,
        tangentAngle,
        pathLength,
        noiseOffset: Math.random() * 100,  // Unique noise seed per path
        heightVariation: 0.02 + Math.random() * 0.04,  // How far above/below surface
        curvature: 0.5 + Math.random() * 1.5,  // How much the path curves
      }
      this._paths.push(pathData)
    }

    this._updateAllInstances(0)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------ ANIMATE

  update(deltaTime, config) {
    if (!this._mesh || !this._paths.length) return
    this._time += deltaTime
    this._updateAllInstances(this._time)
  }

  _updateAllInstances(time) {
    const cubesPerPath = Math.floor(this._totalInstances / this._pathCount)
    const sphereRadius = 1.05
    let idx = 0

    for (let p = 0; p < this._pathCount; p++) {
      const path = this._paths[p]

      for (let c = 0; c < cubesPerPath; c++) {
        const t = c / (cubesPerPath - 1)  // 0 to 1 along the path

        // Walk along the sphere surface following a curved path
        const progress = t * path.pathLength
        const noisePhase = path.noiseOffset + time * 0.5

        // Spiral around the sphere with noise perturbation
        const phi = path.startPhi + Math.sin(t * path.curvature * Math.PI + noisePhase) * 0.3
        const theta = path.startTheta + progress * 2.0 + Math.cos(t * path.curvature * 1.7 + noisePhase * 0.7) * 0.2

        // Height above sphere surface with breathing variation
        const heightNoise = Math.sin(noisePhase * 2 + t * 4) * path.heightVariation
        const r = sphereRadius + heightNoise + t * 0.02

        // Convert spherical to cartesian
        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.cos(phi)
        const z = r * Math.sin(phi) * Math.sin(theta)

        this._dummy.position.set(x, y, z)

        // Orient cube to face outward from sphere centre
        this._dummy.lookAt(0, 0, 0)
        // Add some rotation variation for organic feel
        this._dummy.rotateZ(t * 0.5 + path.noiseOffset)

        // Scale: cubes get slightly smaller toward the end of the path
        const scale = 1.0 - t * 0.3 + Math.sin(noisePhase + t * 3) * 0.15
        this._dummy.scale.setScalar(Math.max(0.3, scale))

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

    // Rebuild if count changed significantly
    if (Math.abs(count - this._pathCount) > 5 || !this._mesh) {
      this.build(config)
    } else if (this._mesh) {
      // Update material colour from key light
      const color = config.lightKey ?? config.color ?? '#ffffff'
      this._mesh.material.color.set(color)
    }
  }

  // ------------------------------------------------------------ ENV MAP

  setEnvMap(envMap) {
    if (this._mesh?.material) {
      this._mesh.material.envMap = envMap
      this._mesh.material.needsUpdate = true
    }
  }

  // ------------------------------------------------------------ DISPOSE

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
