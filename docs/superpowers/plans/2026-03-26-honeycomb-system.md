# HoneycombSystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fractured honeycomb lattice cage around the orb using merged geometry + GPU vertex shader animation.

**Architecture:** Single merged `BufferGeometry` from many thin box struts arranged in hex cells on a sphere. Per-vertex custom attributes (`aCellIndex`, `aEdgeT`, `aNoiseSeed`) drive all animation in the vertex shader via `onBeforeCompile`. OrbManager RANGES control density, radius, pulse, and completeness based on sleep score.

**Tech Stack:** Three.js (`BufferGeometryUtils.mergeGeometries`, `MeshPhysicalMaterial` with `transmission`, `onBeforeCompile`), GSAP (colour tweens in OrbScene)

**Spec:** `docs/superpowers/specs/2026-03-26-honeycomb-system-design.md`

---

### Task 1: Create HoneycombSystem — geometry generation

**Files:**
- Create: `src/lib/three/HoneycombSystem.js`

This task builds the class skeleton with `build()`, `dispose()`, and all the geometry generation logic. No shader yet — just get the merged mesh into the scene with a basic material so we can see the shape.

- [ ] **Step 1: Create `HoneycombSystem.js` with class skeleton**

```js
// src/lib/three/HoneycombSystem.js
// Fractured honeycomb lattice — merged geometry, GPU-animated.

import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// ------------------------------------------------------------ CONFIG

const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const MAX_CENTRES_MOBILE = 30
const MAX_CENTRES_DESKTOP = 80

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
    const y = 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i
    points.push(new THREE.Vector3(
      Math.cos(theta) * radiusAtY,
      y,
      Math.sin(theta) * radiusAtY,
    ))
  }
  return points
}

// ------------------------------------------------------------ HONEYCOMB SYSTEM

export class HoneycombSystem {
  constructor(scene) {
    this._scene = scene
    this._mesh = null
    this._shader = null
    this._time = 0
    this._lastDensity = -1
    this._lastCompleteness = -1
  }

  // ------------------------------------------------------------ BUILD

  build(config) {
    this.dispose()

    const density = config.honeycombDensity ?? 0.5
    const completeness = config.honeycombCompleteness ?? 0.5
    const radius = config.honeycombRadius ?? 1.2
    this._lastDensity = density
    this._lastCompleteness = completeness

    // Number of hex centres scales with density
    const maxCentres = IS_MOBILE ? MAX_CENTRES_MOBILE : MAX_CENTRES_DESKTOP
    const centreCount = Math.round(12 + density * (maxCentres - 12))

    // Distribute centres on sphere
    const centres = fibonacciSphere(centreCount)

    // Find neighbours — each centre connects to its ~6 nearest
    const neighbours = this._findNeighbours(centres)

    // Generate strut geometries
    const struts = this._generateStruts(centres, neighbours, radius, completeness, density)
    if (!struts.length) return

    // Merge into single geometry
    const merged = mergeGeometries(struts, false)
    struts.forEach(g => g.dispose())

    if (!merged) return

    // Material — glassy/translucent
    const color = config.lightKey ?? config.color ?? '#ffffff'
    const mat = new THREE.MeshPhysicalMaterial({
      transmission: 0.85,
      ior: 1.45,
      thickness: 0.02,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.5,
      color: new THREE.Color(color),
    })

    mat.customProgramCacheKey = () => 'ebb-honeycomb'

    if (this._scene.environment) {
      mat.envMap = this._scene.environment
    }

    this._mesh = new THREE.Mesh(merged, mat)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------ NEIGHBOURS

  _findNeighbours(centres) {
    // For each centre, find the ~6 closest other centres
    const neighbours = []
    for (let i = 0; i < centres.length; i++) {
      const dists = []
      for (let j = 0; j < centres.length; j++) {
        if (i === j) continue
        dists.push({ idx: j, dist: centres[i].distanceTo(centres[j]) })
      }
      dists.sort((a, b) => a.dist - b.dist)
      neighbours.push(dists.slice(0, 6).map(d => d.idx))
    }
    return neighbours
  }

  // ------------------------------------------------------------ STRUT GENERATION

  _generateStruts(centres, neighbours, radius, completeness, density) {
    const struts = []
    const seen = new Set()
    const rng = mulberry32(Math.round(density * 1000) + Math.round(completeness * 1000))

    for (let i = 0; i < centres.length; i++) {
      for (const j of neighbours[i]) {
        // Deduplicate — each edge only once
        const edgeKey = i < j ? `${i}-${j}` : `${j}-${i}`
        if (seen.has(edgeKey)) continue
        seen.add(edgeKey)

        // Cull based on completeness
        if (rng() > completeness) continue

        // Build strut between centres[i] and centres[j] at given radius
        const a = centres[i].clone().multiplyScalar(radius)
        const b = centres[j].clone().multiplyScalar(radius)
        const strut = this._makeStrut(a, b, i, rng())
        if (strut) struts.push(strut)
      }
    }

    return struts
  }

  _makeStrut(pointA, pointB, cellIndex, noiseSeed) {
    const dir = new THREE.Vector3().subVectors(pointB, pointA)
    const length = dir.length()
    if (length < 0.001) return null

    // Thin flat box
    const geo = new THREE.BoxGeometry(0.008, 0.003, length, 1, 1, 2)

    // Stamp custom attributes — EVERY strut must have all three
    const vertCount = geo.attributes.position.count
    const cellIndexArr = new Float32Array(vertCount)
    const edgeTArr = new Float32Array(vertCount)
    const noiseSeedArr = new Float32Array(vertCount)

    const posArr = geo.attributes.position.array
    for (let v = 0; v < vertCount; v++) {
      cellIndexArr[v] = cellIndex
      // aEdgeT: map z position (along strut length) to 0→1
      const z = posArr[v * 3 + 2]
      edgeTArr[v] = (z / length) + 0.5
      noiseSeedArr[v] = noiseSeed
    }

    geo.setAttribute('aCellIndex', new THREE.BufferAttribute(cellIndexArr, 1))
    geo.setAttribute('aEdgeT', new THREE.BufferAttribute(edgeTArr, 1))
    geo.setAttribute('aNoiseSeed', new THREE.BufferAttribute(noiseSeedArr, 1))

    // Orient the box along the direction vector
    const mid = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5)
    const quaternion = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 0, 1)
    quaternion.setFromUnitVectors(up, dir.normalize())

    // Apply transform to geometry (bake position + rotation into vertices)
    const matrix = new THREE.Matrix4()
    matrix.compose(mid, quaternion, new THREE.Vector3(1, 1, 1))
    geo.applyMatrix4(matrix)

    return geo
  }

  // ------------------------------------------------------------ ANIMATE

  update(deltaTime, config) {
    if (!this._mesh) return
    this._time += deltaTime
    // Shader uniforms updated here once shader is wired (Task 2)
  }

  // ------------------------------------------------------------ CONFIG

  updateConfig(config) {
    if (!config) return

    const density = config.honeycombDensity ?? 0.5
    const completeness = config.honeycombCompleteness ?? 0.5

    // Rebuild if density or completeness shifted significantly
    const densityDelta = Math.abs(density - this._lastDensity)
    const completenessDelta = Math.abs(completeness - this._lastCompleteness)

    if (densityDelta > 0.1 || completenessDelta > 0.1 || !this._mesh) {
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

  // ------------------------------------------------------------ DISPOSE

  dispose() {
    if (this._mesh) {
      this._scene.remove(this._mesh)
      this._mesh.geometry.dispose()
      this._mesh.material.dispose()
      this._mesh = null
    }
    this._shader = null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/three/HoneycombSystem.js
git commit -m "feat: add HoneycombSystem geometry generation"
```

---

### Task 2: Wire HoneycombSystem into OrbScene

**Files:**
- Modify: `src/lib/three/OrbScene.js`

Add import, instantiation, and all lifecycle hooks — env map, animate loop, updateConfig, dispose.

- [ ] **Step 1: Add import alongside TendrilSystem**

At `OrbScene.js:10`, after the TendrilSystem import, add:

```js
import { HoneycombSystem } from './HoneycombSystem'
```

- [ ] **Step 2: Instantiate in `_initGeometryAndMaterial()`**

At `OrbScene.js:298`, after `this._tendrils = new TendrilSystem(this._scene)`, add:

```js
    // ── HONEYCOMB SYSTEM — fractured crystalline cage around the sphere ──
    this._honeycomb = new HoneycombSystem(this._scene)
```

- [ ] **Step 3: Pass env map in HDRI load callback**

At `OrbScene.js:355-357`, after the tendrils env map block, add:

```js
        if (this._honeycomb) {
          this._honeycomb.setEnvMap(envMap)
        }
```

- [ ] **Step 4: Add to animation loop**

At `OrbScene.js:414-416`, after the tendrils update block, add:

```js
    // Animate honeycomb
    if (this._honeycomb && this._lastConfig) {
      this._honeycomb.update(0.016, this._lastConfig)
    }
```

- [ ] **Step 5: Add updateConfig call**

At `OrbScene.js:550`, after `this._updateTendrils(config)`, add:

```js
    // Honeycomb lattice
    if (this._honeycomb) {
      this._honeycomb.updateConfig(config)
    }
```

- [ ] **Step 6: Add to dispose()**

At `OrbScene.js:104`, after `this._tendrils?.dispose()`, add:

```js
    this._honeycomb?.dispose()
    this._honeycomb = null
```

- [ ] **Step 7: Verify visually**

Run `npm run dev`, navigate to a sleep record. You should see thin glass-like struts forming a broken hexagonal pattern around the orb. No animation yet (that's Task 3).

- [ ] **Step 8: Commit**

```bash
git add src/lib/three/OrbScene.js
git commit -m "feat: wire HoneycombSystem into OrbScene lifecycle"
```

---

### Task 3: Add vertex shader animation

**Files:**
- Modify: `src/lib/three/HoneycombSystem.js`

Add `onBeforeCompile` to the material to inject per-cell pulsing vertex shader. Wire up uniforms in `update()` and `updateConfig()`.

- [ ] **Step 1: Add `onBeforeCompile` to the material in `build()`**

After the material creation and before `this._mesh = new THREE.Mesh(...)`, inject the shader:

```js
    mat.onBeforeCompile = (shader) => {
      this._shader = shader

      // Custom uniforms
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uPulseRate = { value: config.honeycombPulseRate ?? 0.1 }
      shader.uniforms.uPulseAmount = { value: config.honeycombPulseAmount ?? 0.02 }

      // Declare attributes + uniforms, then replace begin_vertex
      shader.vertexShader = `
        attribute float aCellIndex;
        attribute float aEdgeT;
        attribute float aNoiseSeed;
        uniform float uTime;
        uniform float uPulseRate;
        uniform float uPulseAmount;
      ` + shader.vertexShader

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        /* glsl */ `
          // Per-cell outward pulse — each cell pulses independently
          float cellPhase = aCellIndex * 2.718 + aNoiseSeed * 6.283;
          float pulse = sin(uTime * uPulseRate * 6.2832 + cellPhase);
          pulse = (pulse + 1.0) * 0.5;  // remap to 0→1 (outward only)

          // Taper at strut ends — thinner at tips
          float taper = sin(aEdgeT * 3.14159);
          float scaleFactor = 0.4 + taper * 0.6;

          // Offset position outward from sphere centre
          vec3 dir = normalize(position);
          float displacement = pulse * uPulseAmount * scaleFactor;
          vec3 transformed = position + dir * displacement;
        `
      )
    }
```

- [ ] **Step 2: Wire uniforms in `update()`**

Replace the placeholder `update()` body:

```js
  update(deltaTime, config) {
    if (!this._mesh || !this._shader) return
    this._time += deltaTime
    this._shader.uniforms.uTime.value = this._time
  }
```

- [ ] **Step 3: Update uniforms in `updateConfig()` for non-rebuild changes**

In the `else if (this._mesh)` branch, after the colour update, add uniform updates:

```js
      // Update shader uniforms without rebuild
      if (this._shader) {
        if (config.honeycombPulseRate != null) {
          this._shader.uniforms.uPulseRate.value = config.honeycombPulseRate
        }
        if (config.honeycombPulseAmount != null) {
          this._shader.uniforms.uPulseAmount.value = config.honeycombPulseAmount
        }
      }
```

- [ ] **Step 4: Verify visually**

Run `npm run dev`. The honeycomb struts should now pulse outward individually with different phases. Switch between sleep records — pulse speed and amplitude should change.

- [ ] **Step 5: Commit**

```bash
git add src/lib/three/HoneycombSystem.js
git commit -m "feat: add GPU vertex shader animation to honeycomb"
```

---

### Task 4: Add honeycomb params to OrbManager RANGES

**Files:**
- Modify: `src/managers/OrbManager.js:69` (end of RANGES object)

- [ ] **Step 1: Add 5 new entries to RANGES**

After the `tendrilPulseRate` entry at line 68, add:

```js
  honeycombDensity:       [0.7, 0.3,   ease.inQuad],         // Dense cage → sparse floaters
  honeycombCompleteness:  [0.7, 0.35,  ease.inSine],         // More intact → more broken
  honeycombRadius:        [1.15, 1.3,  ease.outCubic],       // Tight cage → floating away
  honeycombPulseRate:     [0.4, 0.1,   ease.inOutQuad],      // Erratic → calm
  honeycombPulseAmount:   [0.1, 0.02,  ease.outQuad],        // Dramatic → gentle
```

No other changes needed — `_calculateConfig()` iterates RANGES automatically.

- [ ] **Step 2: Verify visually**

Run `npm run dev`. Switch between sleep records with different scores. The honeycomb should:
- **Low score:** Dense, tight cage, fast erratic pulsing
- **High score:** Sparse, floating away, slow gentle pulsing

- [ ] **Step 3: Commit**

```bash
git add src/managers/OrbManager.js
git commit -m "feat: add honeycomb config params to OrbManager RANGES"
```

---

### Task 5: Visual polish and tuning

**Files:**
- Modify: `src/lib/three/HoneycombSystem.js` (tweaks)

This task is for tuning values after seeing the effect live. Expected adjustments:

- [ ] **Step 1: Tune strut dimensions**

The initial `0.008 × 0.003` box dimensions may need adjustment. Try the effect and adjust width/height in `_makeStrut()` for the right visual weight. Thinner = more delicate/crystalline.

- [ ] **Step 2: Tune material transmission**

`transmission: 0.85` may be too transparent or not enough. Adjust while viewing against the orb to find the sweet spot where the glass catches light without disappearing.

- [ ] **Step 3: Tune RANGES values in OrbManager**

The easing curves and min/max values will likely need adjustment after seeing the full spectrum. Pay attention to:
- Does the cage feel too tight at low scores? Bump `honeycombRadius` worst value.
- Is the density range too subtle? Widen the gap between 0.7 and 0.3.
- Does the pulse feel too slow/fast? Adjust `honeycombPulseRate` range.

- [ ] **Step 4: Commit final tuning**

```bash
git add src/lib/three/HoneycombSystem.js src/managers/OrbManager.js
git commit -m "fix: tune honeycomb visual params"
```
