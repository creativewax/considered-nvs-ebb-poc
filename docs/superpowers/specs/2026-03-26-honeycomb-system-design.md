# HoneycombSystem — Merged Geometry + GPU Vertex Shader

> Fractured honeycomb lattice forming a crystalline cage around the orb.
> Single merged mesh, all animation on the GPU via `onBeforeCompile` vertex shader.

## Motivation

The existing `TendrilSystem` uses `InstancedMesh` with per-instance CPU matrix updates each frame (up to ~4,800 calculations/tick). This new system takes a different approach: merge all geometry at build time, stamp per-vertex attributes, and let a vertex shader handle all animation on the GPU. Zero CPU per-frame work.

Visually it contrasts the organic metal tendrils — geometric crystalline cage vs flowing ribbon chains.

## Architecture

### New File: `src/lib/three/HoneycombSystem.js`

Same public interface as `TendrilSystem`:

```
build(config)           — generate + merge hex geometry, create mesh
update(deltaTime, config) — advance time uniform only (shader does the rest)
updateConfig(config)    — update uniforms, rebuild if density/completeness changed significantly
setEnvMap(envMap)       — pass env map to material
dispose()              — remove mesh, dispose geometry + material
```

### Geometry Generation (build-time only)

1. **Distribute hex centres** — fibonacci sphere distribution for even spacing. Number of centres controlled by `honeycombDensity` config param (mapped to ~20-80 centres).

2. **Generate edges** — for each centre, create 6 edge struts as thin `BoxGeometry` segments positioned/rotated between the centre and its 6 neighbours. Each strut is a flat box (width × height × depth ≈ `0.008 × 0.003 × length`), giving a thin rectangular cross-section.

3. **Cull edges** — randomly remove edges based on `honeycombCompleteness` (0.3 = 70% removed, 0.7 = 30% removed). Use a simple mulberry32 seeded PRNG (seed from density + completeness) so the same config produces the same pattern.

4. **Stamp per-vertex attributes** before merging. **Every strut geometry must have all three attributes set** — `mergeGeometries` fails silently if any geometry is missing an attribute:
   - `aCellIndex` (float) — which hex cell this vertex belongs to (for per-cell pulse offset)
   - `aEdgeT` (float) — 0→1 position along the strut (for tapering at ends)
   - `aNoiseSeed` (float) — unique per-edge random value (for variation)

5. **Merge** — `BufferGeometryUtils.mergeGeometries()` into a single `BufferGeometry`.

### Material — Glassy/Translucent

```js
MeshPhysicalMaterial({
  transmission: 0.85,
  ior: 1.45,
  thickness: 0.02,
  roughness: 0.1,
  metalness: 0,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
  envMapIntensity: 1.5,
  color: config.lightKey ?? config.color ?? '#ffffff',  // sleep-quality palette with fallback
})
```

Uses `onBeforeCompile` to inject vertex shader. `customProgramCacheKey` set to `'ebb-honeycomb'` to prevent shader cache collisions with the orb material.

**Note:** `transmission` materials trigger a double render pass (transmissive buffer + final). With merged geometry this is still only 2 draw calls total — acceptable. The orb sitting directly behind the cage gives the refraction something to work with.

### Vertex Shader (GPU animation)

Injected via `onBeforeCompile`, same pattern as the orb's displacement shader.

**Uniforms:**
- `uTime` (float) — elapsed time
- `uBaseRadius` (float) — distance from orb centre (from `honeycombRadius`)
- `uPulseRate` (float) — speed of per-cell pulse
- `uPulseAmount` (float) — amplitude of per-cell outward pulse

**Vertex logic:**
```glsl
// Read per-vertex attributes
attribute float aCellIndex;
attribute float aEdgeT;
attribute float aNoiseSeed;

// Per-cell outward pulse — each cell pulses independently
float cellPhase = aCellIndex * 2.718 + aNoiseSeed;
float pulse = sin(uTime * uPulseRate * 6.2832 + cellPhase);
pulse = (pulse + 1.0) * 0.5;  // remap to 0→1 (outward only)

// Taper at strut ends
float taper = sin(aEdgeT * 3.14159);
float scale = 0.4 + taper * 0.6;

// Offset position outward from sphere centre
vec3 dir = normalize(position);
vec3 displaced = position + dir * (pulse * uPulseAmount);

// Apply scale (thinner at ends)
vec3 transformed = displaced;
// Scale applied via the normal direction
```

The exact GLSL will be refined during implementation — this captures the intent.

### Rebuild vs Uniform-Only Updates

**Triggers rebuild** (geometry changes):
- `honeycombDensity` changes by more than 0.1
- `honeycombCompleteness` changes by more than 0.1

**Uniform-only** (no rebuild):
- `honeycombRadius`, `honeycombPulseRate`, `honeycombPulseAmount`
- Colour changes (material.color)

## OrbManager Integration

### New RANGES Entries

Added to the existing `RANGES` object in `OrbManager.js`:

```js
// [worst (score 0), best (score 100), easingFn]
honeycombDensity:       [0.7, 0.3,   ease.inQuad],       // Dense cage → sparse floaters
honeycombCompleteness:  [0.7, 0.35,  ease.inSine],       // More intact → more broken
honeycombRadius:        [1.15, 1.3,  ease.outCubic],     // Tight cage → floating away (1.15 min clears max orb displacement)
honeycombPulseRate:     [0.4, 0.1,   ease.inOutQuad],    // Erratic → calm
honeycombPulseAmount:   [0.1, 0.02,  ease.outQuad],      // Dramatic → gentle
```

These flow through `_calculateConfig()` identically to existing tendril params — score → easing → lerp. No special handling needed.

## OrbScene Integration

### Constructor / Init

```js
this._tendrils = new TendrilSystem(this._scene)    // existing
this._honeycomb = new HoneycombSystem(this._scene)  // new
```

### Lifecycle Hooks

- `_initGeometryAndMaterial()` — instantiate HoneycombSystem after TendrilSystem
- `_initEnvironment()` — pass env map to honeycomb on HDRI load
- `_animate()` — call `this._honeycomb.update(0.016, this._lastConfig)`
- `updateConfig()` — call `this._honeycomb.updateConfig(config)`
- `dispose()` / `unmount()` — call `this._honeycomb.dispose()` then null the reference (`this._honeycomb = null`)

**Guards:** `setEnvMap` must use optional chaining (`this._mesh?.material`) since it may be called before `build()` (HDRI loads asynchronously). Same pattern as TendrilSystem.

### Existing TendrilSystem Material Change

Update `TendrilSystem` material to match the orb's metallic look (option A from design):

```js
// Current: already metallic. Confirm it uses same lightKey colour.
// No material changes needed — it already picks up config.lightKey.
```

## Mobile Performance

- `IS_MOBILE` check: cap hex centres at ~30 on mobile (vs ~80 desktop)
- Merged geometry = single draw call regardless of complexity
- Vertex shader runs on GPU — no CPU overhead scales with device count
- `CUBES_PER_PATH` equivalent doesn't exist here — strut segment count is fixed at build time

## File Changes Summary

| File | Change |
|------|--------|
| `src/lib/three/HoneycombSystem.js` | **New** — full class |
| `src/lib/three/OrbScene.js` | Add honeycomb lifecycle (instantiate, update, dispose, env map) |
| `src/managers/OrbManager.js` | Add 5 honeycomb entries to RANGES |

## Success Criteria

- Honeycomb renders as a fractured geometric cage around the orb
- Glassy/translucent material with sharp crystalline reflections
- Per-cell pulsing animation runs entirely on GPU
- Sleep score smoothly controls density, radius, pulse rate/amount, completeness
- No visible performance regression on mobile (single draw call)
- Colour shifts with sleep quality palette (via config.lightKey)
