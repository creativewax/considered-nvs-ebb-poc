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
const DEFAULT_STRUT_SIZE = 0.006
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

function buildStrutGeometry(pointA, pointB, jointIdxA, jointIdxB, seed, strutSize) {
  const midpoint = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(pointB, pointA)
  const length = direction.length()
  direction.normalize()

  const s = strutSize || DEFAULT_STRUT_SIZE
  const geo = new THREE.BoxGeometry(s, s * 0.6, length)

  // Orient the box along the edge direction
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)

  const matrix = new THREE.Matrix4()
  matrix.compose(midpoint, quaternion, new THREE.Vector3(1, 1, 1))
  geo.applyMatrix4(matrix)

  // Normalised joint directions for shader displacement
  const dirA = pointA.clone().normalize()
  const dirB = pointB.clone().normalize()

  // Stamp per-vertex custom attributes
  const vertCount = geo.attributes.position.count
  const edgeTs = new Float32Array(vertCount)
  const noiseSeeds = new Float32Array(vertCount)
  const jointAs = new Float32Array(vertCount)
  const jointBs = new Float32Array(vertCount)
  const jointDirAs = new Float32Array(vertCount * 3)
  const jointDirBs = new Float32Array(vertCount * 3)

  for (let v = 0; v < vertCount; v++) {
    // Map vertex position along edge to 0→1
    const pos = new THREE.Vector3()
    pos.fromBufferAttribute(geo.attributes.position, v)
    const projected = pos.clone().sub(pointA)
    edgeTs[v] = Math.max(0, Math.min(1, projected.dot(direction) / length))
    noiseSeeds[v] = seed
    // Joint indices — shared joints across struts get the same phase
    jointAs[v] = jointIdxA
    jointBs[v] = jointIdxB
    // Joint displacement directions
    jointDirAs[v * 3]     = dirA.x
    jointDirAs[v * 3 + 1] = dirA.y
    jointDirAs[v * 3 + 2] = dirA.z
    jointDirBs[v * 3]     = dirB.x
    jointDirBs[v * 3 + 1] = dirB.y
    jointDirBs[v * 3 + 2] = dirB.z
  }

  geo.setAttribute('aEdgeT', new THREE.BufferAttribute(edgeTs, 1))
  geo.setAttribute('aNoiseSeed', new THREE.BufferAttribute(noiseSeeds, 1))
  geo.setAttribute('aJointA', new THREE.BufferAttribute(jointAs, 1))
  geo.setAttribute('aJointB', new THREE.BufferAttribute(jointBs, 1))
  geo.setAttribute('aJointDirA', new THREE.BufferAttribute(jointDirAs, 3))
  geo.setAttribute('aJointDirB', new THREE.BufferAttribute(jointDirBs, 3))

  return geo
}

// ------------------------------------------------------------ HONEYCOMB SYSTEM

export class HoneycombSystem {
  constructor(scene) {
    this._scene = scene
    this._mesh = null
    this._shader = null
    this._time = 0
    this._lastDensity = 0
    this._lastCompleteness = 0
    this._lastThickness = 0
  }

  // ------------------------------------------------------------ BUILD

  build(config) {
    this.dispose()

    const density = config.honeycombDensity ?? 0.5
    const completeness = config.honeycombCompleteness ?? 0.85
    const thickness = config.honeycombThickness ?? DEFAULT_STRUT_SIZE

    this._lastDensity = density
    this._lastThickness = thickness
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
    const strutSize = config.honeycombThickness ?? DEFAULT_STRUT_SIZE
    const struts = []
    for (let i = 0; i < keptEdges.length; i++) {
      const [a, b] = keptEdges[i]
      const geo = buildStrutGeometry(centres[a], centres[b], a, b, rng(), strutSize)
      struts.push(geo)
    }

    // Merge into a single buffer geometry
    const merged = mergeGeometries(struts, false)
    if (!merged) return

    // Dispose individual strut geometries after merge
    for (const g of struts) g.dispose()

    // Glassy material — fresnel shader handles alpha, PBR handles reflections
    const colour = config.lightKey ?? config.color ?? '#ffffff'
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colour),
      roughness: 0.06,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 3.5,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    mat.customProgramCacheKey = () => 'ebb-honeycomb'

    mat.onBeforeCompile = (shader) => {
      this._shader = shader

      // Custom uniforms
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uBaseRadius = { value: config.honeycombRadius ?? 1.2 }
      shader.uniforms.uPulseRate = { value: config.honeycombPulseRate ?? 0.1 }
      shader.uniforms.uPulseAmount = { value: config.honeycombPulseAmount ?? 0.02 }

      // Declare attributes + uniforms, then replace begin_vertex
      shader.vertexShader = `
        attribute float aEdgeT;
        attribute float aNoiseSeed;
        attribute float aJointA;
        attribute float aJointB;
        attribute vec3 aJointDirA;
        attribute vec3 aJointDirB;
        uniform float uTime;
        uniform float uBaseRadius;
        uniform float uPulseRate;
        uniform float uPulseAmount;
      ` + shader.vertexShader

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        /* glsl */ `
          // Reposition to configurable radius — scale from build radius to uBaseRadius
          float buildR = length(position);
          float radiusScale = buildR > 0.001 ? uBaseRadius / buildR : 1.0;
          vec3 basePos = position * radiusScale;

          // Per-joint pulse — joints shared across struts get the same phase
          float phaseA = aJointA * 2.718 + aNoiseSeed * 6.283;
          float phaseB = aJointB * 3.141 + aNoiseSeed * 4.669;
          float pulseA = (sin(uTime * uPulseRate * 6.2832 + phaseA) + 1.0) * 0.5;
          float pulseB = (sin(uTime * uPulseRate * 6.2832 + phaseB) + 1.0) * 0.5;

          // Blend between joint A and joint B displacement based on position along strut
          float t = aEdgeT;
          vec3 dispA = aJointDirA * pulseA * uPulseAmount;
          vec3 dispB = aJointDirB * pulseB * uPulseAmount;
          vec3 disp = mix(dispA, dispB, t);

          vec3 transformed = basePos + disp;
        `
      )

      // Fragment shader — fresnel glass effect
      // Edges catch light (bright, opaque), face-on surfaces are subtly visible
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        /* glsl */ `
          // Fresnel — strong at glancing angles (edges), weak face-on
          vec3 viewDir = normalize(vViewPosition);
          vec3 norm = normalize(vNormal);
          float fresnel = 1.0 - abs(dot(viewDir, norm));
          fresnel = pow(fresnel, 1.5);  // softer curve than pow(2)

          // Base visibility so struts never fully vanish + bright edges
          float glassAlpha = mix(0.15, 0.85, fresnel);
          // Additive edge glow — catches light like real glass
          vec3 glassCol = gl_FragColor.rgb * (1.0 + fresnel * 0.8);

          gl_FragColor = vec4(glassCol, glassAlpha);
        `
      )
    }

    if (this._scene.environment) {
      mat.envMap = this._scene.environment
    }

    this._mesh = new THREE.Mesh(merged, mat)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------ ANIMATE

  update(deltaTime, _config) {
    if (!this._mesh || !this._shader) return
    this._time += deltaTime
    this._shader.uniforms.uTime.value = this._time
  }

  // ------------------------------------------------------------ CONFIG

  updateConfig(config) {
    if (!config) return

    const density = config.honeycombDensity ?? 0.5
    const completeness = config.honeycombCompleteness ?? 0.85
    const thickness = config.honeycombThickness ?? DEFAULT_STRUT_SIZE

    // Rebuild when density, completeness, or thickness shift noticeably
    const densityDelta = Math.abs(density - this._lastDensity)
    const completenessDelta = Math.abs(completeness - this._lastCompleteness)
    const thicknessDelta = Math.abs(thickness - this._lastThickness)

    if (densityDelta > 0.1 || completenessDelta > 0.1 || thicknessDelta > 0.002 || !this._mesh) {
      this.build(config)
    } else if (this._mesh) {
      const colour = config.lightKey ?? config.color ?? '#ffffff'
      this._mesh.material.color.set(colour)

      // Update shader uniforms without rebuild
      if (this._shader) {
        if (config.honeycombRadius != null) {
          this._shader.uniforms.uBaseRadius.value = config.honeycombRadius
        }
        if (config.honeycombPulseRate != null) {
          this._shader.uniforms.uPulseRate.value = config.honeycombPulseRate
        }
        if (config.honeycombPulseAmount != null) {
          this._shader.uniforms.uPulseAmount.value = config.honeycombPulseAmount
        }
      }
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
    this._shader = null
    this._time = 0
  }
}
