// src/lib/three/HoneycombSystem.js
// Geodesic honeycomb cage around the orb sphere.
// Fibonacci-distributed hex centres connected by glassy struts,
// merged into a single geometry for efficient rendering.

import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// ------------------------------------------------------------ CONFIG

const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const MAX_CENTRES_MOBILE = 30
const MAX_CENTRES_DESKTOP = 80
const STRUT_WIDTH = 0.004
const STRUT_DEPTH = 0.004
const SPHERE_RADIUS = 1.05 // Slightly outside the orb surface

// ------------------------------------------------------------ SEEDED PRNG

function mulberry32(seed) {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ------------------------------------------------------------ FIBONACCI SPHERE

function fibonacciSphere(count) {
  const points = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * i) / (count - 1)
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i

    points.push(new THREE.Vector3(
      radiusAtY * Math.cos(theta) * SPHERE_RADIUS,
      y * SPHERE_RADIUS,
      radiusAtY * Math.sin(theta) * SPHERE_RADIUS
    ))
  }

  return points
}

// ------------------------------------------------------------ NEIGHBOUR FINDING

function findNeighbours(centres, maxNeighbours = 6) {
  const edges = new Set()
  const n = centres.length

  for (let i = 0; i < n; i++) {
    // Sort all other points by distance, take closest ~6
    const dists = []
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      dists.push({ idx: j, dist: centres[i].distanceToSquared(centres[j]) })
    }
    dists.sort((a, b) => a.dist - b.dist)

    const take = Math.min(maxNeighbours, dists.length)
    for (let k = 0; k < take; k++) {
      const j = dists[k].idx
      // Canonical edge key — smaller index first
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      edges.add(key)
    }
  }

  return [...edges].map(key => {
    const [a, b] = key.split('-').map(Number)
    return [a, b]
  })
}

// ------------------------------------------------------------ STRUT GEOMETRY

function buildStrutGeometry(pointA, pointB, edgeIndex, cellIndexA, seed) {
  const midpoint = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(pointB, pointA)
  const length = direction.length()
  direction.normalize()

  const geo = new THREE.BoxGeometry(STRUT_WIDTH, STRUT_DEPTH, length)

  // Orient the box along the edge direction
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)

  const matrix = new THREE.Matrix4()
  matrix.compose(midpoint, quaternion, new THREE.Vector3(1, 1, 1))
  geo.applyMatrix4(matrix)

  // Stamp per-vertex custom attributes
  const vertCount = geo.attributes.position.count
  const cellIndices = new Float32Array(vertCount)
  const edgeTs = new Float32Array(vertCount)
  const noiseSeeds = new Float32Array(vertCount)

  for (let v = 0; v < vertCount; v++) {
    cellIndices[v] = cellIndexA
    // Map vertex z-position along edge to 0–1 parameter
    const pos = new THREE.Vector3()
    pos.fromBufferAttribute(geo.attributes.position, v)
    const projected = pos.clone().sub(pointA)
    edgeTs[v] = Math.max(0, Math.min(1, projected.dot(direction) / length))
    noiseSeeds[v] = seed + edgeIndex * 0.01
  }

  geo.setAttribute('aCellIndex', new THREE.BufferAttribute(cellIndices, 1))
  geo.setAttribute('aEdgeT', new THREE.BufferAttribute(edgeTs, 1))
  geo.setAttribute('aNoiseSeed', new THREE.BufferAttribute(noiseSeeds, 1))

  return geo
}

// ------------------------------------------------------------ HONEYCOMB SYSTEM

export class HoneycombSystem {
  constructor(scene) {
    this._scene = scene
    this._mesh = null
    this._time = 0
    this._lastDensity = 0
    this._lastCompleteness = 0
  }

  // ------------------------------------------------------------ BUILD

  build(config) {
    this.dispose()

    const density = config.honeycombDensity ?? 0.5
    const completeness = config.honeycombCompleteness ?? 0.85

    this._lastDensity = density
    this._lastCompleteness = completeness

    // Centre count scales with density
    const maxCentres = IS_MOBILE ? MAX_CENTRES_MOBILE : MAX_CENTRES_DESKTOP
    const centreCount = Math.max(8, Math.round(density * maxCentres))

    // Distribute hex centres on the sphere
    const centres = fibonacciSphere(centreCount)

    // Find neighbour edges (~6 per centre)
    const edges = findNeighbours(centres, 6)

    // Deterministic edge culling — seeded PRNG
    const rng = mulberry32(42)
    const keptEdges = edges.filter(() => rng() < completeness)

    if (keptEdges.length === 0) return

    // Build individual strut geometries
    const struts = []
    for (let i = 0; i < keptEdges.length; i++) {
      const [a, b] = keptEdges[i]
      const geo = buildStrutGeometry(centres[a], centres[b], i, a, rng())
      struts.push(geo)
    }

    // Merge into a single buffer geometry
    const merged = mergeGeometries(struts, false)
    if (!merged) return

    // Dispose individual strut geometries after merge
    for (const g of struts) g.dispose()

    // Glassy transmission material
    const colour = config.lightKey ?? config.color ?? '#ffffff'
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colour),
      transmission: 0.85,
      ior: 1.45,
      thickness: 0.02,
      roughness: 0.12,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
      transparent: true,
    })

    mat.customProgramCacheKey = () => 'ebb-honeycomb'

    if (this._scene.environment) {
      mat.envMap = this._scene.environment
    }

    this._mesh = new THREE.Mesh(merged, mat)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------ ANIMATE

  update(deltaTime, _config) {
    if (!this._mesh) return
    this._time += deltaTime
    // Vertex shader animation will be added in Task 3
  }

  // ------------------------------------------------------------ CONFIG

  updateConfig(config) {
    if (!config) return

    const density = config.honeycombDensity ?? 0.5
    const completeness = config.honeycombCompleteness ?? 0.85

    // Rebuild when density or completeness shift noticeably
    const densityDelta = Math.abs(density - this._lastDensity)
    const completenessDelta = Math.abs(completeness - this._lastCompleteness)

    if (densityDelta > 0.1 || completenessDelta > 0.1 || !this._mesh) {
      this.build(config)
    } else if (this._mesh) {
      const colour = config.lightKey ?? config.color ?? '#ffffff'
      this._mesh.material.color.set(colour)
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
    this._time = 0
  }
}
