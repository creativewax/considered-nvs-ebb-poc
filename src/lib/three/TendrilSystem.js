// src/lib/three/TendrilSystem.js
// Metallic structures growing from the sphere surface.
// Uses InstancedMesh with thin elongated capsules.

import * as THREE from 'three'

// ------------------------------------------------------------ TENDRIL SYSTEM

export class TendrilSystem {
  constructor(scene) {
    this._scene = scene
    this._mesh = null
    this._count = 0
    this._dummy = new THREE.Object3D()
    this._basePositions = []  // Surface points where tendrils grow from
    this._baseNormals = []
    this._time = 0
  }

  // ------------------------------------------------------------ BUILD

  build(count = 60, length = 0.3, thickness = 0.01, color = '#ffffff') {
    this.dispose()
    this._count = count

    // Capsule geometry — elongated along Y
    const geo = new THREE.CapsuleGeometry(thickness, length, 4, 8)

    // Metallic material — solid, reflective
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 3.0,
    })

    // Set envMap from scene if available
    if (this._scene.environment) {
      mat.envMap = this._scene.environment
    }

    this._mesh = new THREE.InstancedMesh(geo, mat, count)
    this._mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    // Generate random points on a unit sphere surface
    this._basePositions = []
    this._baseNormals = []
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere for even distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i

      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.sin(phi) * Math.sin(theta)
      const z = Math.cos(phi)

      this._basePositions.push(new THREE.Vector3(x, y, z))
      this._baseNormals.push(new THREE.Vector3(x, y, z).normalize())
    }

    this._updateInstances(length)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------ UPDATE

  update(deltaTime, config) {
    if (!this._mesh) return
    this._time += deltaTime

    const length = config?.tendrilLength ?? 0.3
    const speed = config?.speed ?? 0.005

    // Animate tendril positions with subtle noise-driven movement
    for (let i = 0; i < this._count; i++) {
      const base = this._basePositions[i]
      const normal = this._baseNormals[i]

      // Noise-driven length variation
      const noise = Math.sin(this._time * speed * 100 + i * 1.7) * 0.3
        + Math.sin(this._time * speed * 60 + i * 2.3) * 0.2
      const currentLength = length * (0.7 + noise * 0.5)

      // Position: on sphere surface + half the capsule length outward
      const halfLen = currentLength * 0.5
      this._dummy.position.copy(base).multiplyScalar(1.0 + halfLen)

      // Slight angular wobble over time
      const wobbleX = Math.sin(this._time * speed * 40 + i * 3.1) * 0.15
      const wobbleZ = Math.cos(this._time * speed * 35 + i * 2.7) * 0.15
      this._dummy.position.x += wobbleX * currentLength
      this._dummy.position.z += wobbleZ * currentLength

      // Orient along the normal (point outward from sphere)
      this._dummy.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      )

      // Scale Y for length variation
      this._dummy.scale.set(1, 0.5 + currentLength * 2, 1)

      this._dummy.updateMatrix()
      this._mesh.setMatrixAt(i, this._dummy.matrix)
    }

    this._mesh.instanceMatrix.needsUpdate = true
  }

  // ------------------------------------------------------------ CONFIG

  updateConfig(config) {
    if (!config) return

    const count = config.tendrilCount ?? 60
    const length = config.tendrilLength ?? 0.3
    const thickness = config.tendrilThickness ?? 0.01
    const color = config.lightKey ?? config.color ?? '#ffffff'

    // Rebuild if count changed
    if (count !== this._count) {
      this.build(count, length, thickness, color)
    } else if (this._mesh) {
      this._mesh.material.color.set(color)
    }
  }

  // ------------------------------------------------------------ HELPERS

  _updateInstances(length) {
    for (let i = 0; i < this._count; i++) {
      const base = this._basePositions[i]
      const normal = this._baseNormals[i]

      const halfLen = length * 0.5
      this._dummy.position.copy(base).multiplyScalar(1.0 + halfLen)
      this._dummy.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      )
      this._dummy.scale.set(1, 1, 1)
      this._dummy.updateMatrix()
      this._mesh.setMatrixAt(i, this._dummy.matrix)
    }
    this._mesh.instanceMatrix.needsUpdate = true
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
    this._count = 0
    this._basePositions = []
    this._baseNormals = []
  }
}
