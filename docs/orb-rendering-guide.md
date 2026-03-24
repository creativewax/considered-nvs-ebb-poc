# Orb Rendering Guide — Three.js Implementation Reference

> Based on deep analysis of [Blobmixer](https://blobmixer.14islands.com) by 14islands.
> Sources: [GitHub source](https://github.com/connorhvnsen/blob-mixer), [Three.js Forum](https://discourse.threejs.org/t/blobmixer-interactive-meshphysicalmaterial-playground/23883), [Normal recalculation thread](https://discourse.threejs.org/t/calculating-vertex-normals-after-displacement-in-the-vertex-shader/16989)

---

## What Makes Blobmixer Look So Good (Ranked by Impact)

1. **Normal recalculation after vertex displacement** — THE technique. Without it, the deformed surface is lit as a perfect sphere. Neighbour-sampling approach calls the displacement function 3x per vertex.
2. **MeshPhysicalMaterial with clearcoat** — Dual-layer PBR (smooth base + rougher clearcoat) creates the wet, organic look.
3. **High-quality environment map** — A real photograph (not synthetic HDRI) provides naturalistic, varied reflections.
4. **Periodic Perlin noise** — Two-layer system (large "goo" + fine "surface waves") with pole attenuation.
5. **Subtle post-processing** — Bloom on specular highlights, mild vignette.
6. **High geometry resolution** — 256 segments (~130K vertices) for smooth organic curves.

---

## 1. Blobmixer's Stack

- Three.js via React Three Fiber
- MeshPhysicalMaterial extended via `onBeforeCompile`
- Periodic classic Perlin 3D noise for vertex displacement
- Equirectangular environment map (photograph by Jon Ragnarsson)
- @react-three/postprocessing (bloom, vignette, noise, scanlines)
- react-spring for animating material/geometry properties
- zustand for state management

---

## 2. MeshPhysicalMaterial — The Sweet Spot

### Blobmixer's Default Values

```javascript
{
  color:               '#ffffff',
  roughness:           0.14,      // Very smooth — sharp envMap reflections
  metalness:           0,         // Non-metallic (dielectric) — organic look
  clearcoat:           1,         // Full clearcoat — wet/lacquer coating
  clearcoatRoughness:  0.7,       // Rougher top layer, smooth base
  envMapIntensity:     1.0,       // Full-strength environment reflections
  transmission:        0,         // Opaque (push to 1 for glass-like)
  ior:                 1.0,       // Index of refraction
  reflectivity:        0.5,
  opacity:             1,
}
```

### Why This Combination Works

- **roughness: 0.14** — Almost mirror-like base. The environment map reflections are crisp and visible.
- **metalness: 0** — Dielectric material (glass/plastic/organic). Reflections come from clearcoat and envMap, not metallic F0.
- **clearcoat: 1** — Adds a second specular layer, simulating wet or lacquered surface. This is the "organic glow."
- **clearcoatRoughness: 0.7** — The clearcoat itself is somewhat rough, creating a soft halo around sharp base reflections. This dual-layer look is key.
- **envMapIntensity: 1** — The environment map does ALL the heavy lifting for realistic lighting.

### For Ebb's Quality Variants

```javascript
// Good/Excellent sleep — smooth, glassy, serene
{
  roughness: 0.1,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.4,
  envMapIntensity: 1.2,
  transmission: 0.3,     // Slight translucency
  thickness: 0.5,
  ior: 1.4,
}

// Poor sleep — rough, agitated, opaque
{
  roughness: 0.35,
  metalness: 0.05,
  clearcoat: 0.6,
  clearcoatRoughness: 0.9,
  envMapIntensity: 0.8,
  transmission: 0,
}
```

---

## 3. Vertex Displacement — Two-Layer Noise

### The Displacement Function

Blobmixer uses periodic classic Perlin 3D noise (`pnoise`) with two independent layers:

```glsl
#define M_PI 3.1415926538
#define NOISE_PERIOD 10.

float f(vec3 point) {
    // Pole attenuation — smooth displacement at poles
    float yPos = smoothstep(-1., 1., point.y);
    float amount = sin(yPos * M_PI);
    float wavePoleAmount = mix(amount, 1.0, surfacePoleAmount);
    float gooPoleAmount = mix(amount, 1.0, gooPoleAmount);

    // Layer 1: "Goo" — large-scale organic deformation
    float goo = pnoise(
        vec3(point / frequency + mod(time, NOISE_PERIOD)),
        vec3(NOISE_PERIOD)
    ) * pow(distort, 2.0);

    // Layer 2: "Surface" — fine detail, wave-like ridges
    float surfaceNoise = pnoise(
        vec3(point / surfaceFrequency + mod(surfaceTime, NOISE_PERIOD)),
        vec3(NOISE_PERIOD)
    );

    float waves = (
        point.x * sin((point.y + surfaceNoise) * M_PI * numberOfWaves) +
        point.z * cos((point.y + surfaceNoise) * M_PI * numberOfWaves)
    ) * 0.01 * pow(surfaceDistort, 2.0);

    return waves * wavePoleAmount + goo * gooPoleAmount;
}
```

### Key Design Decisions

- **Periodic noise** tiles seamlessly — no visible seams during animation loops
- **Pole attenuation** via `smoothstep`/`sin` prevents ugly pinching at sphere poles
- **Two time uniforms** — `time` (goo speed) and `surfaceTime` (surface speed) allow independent animation rates
- **Squared distort** (`pow(distort, 2.0)`) — makes the amplitude control feel more natural (small values = subtle, large = dramatic)

### For Ebb: Mapping Sleep Quality to Noise

```javascript
// Excellent (85-100) — near-perfect sphere
{ distort: 0.05, frequency: 3.0, surfaceDistort: 0.02, speed: 0.002 }

// Good (70-84) — gentle undulations
{ distort: 0.15, frequency: 2.5, surfaceDistort: 0.05, speed: 0.003 }

// Fair (40-69) — visible deformation
{ distort: 0.35, frequency: 2.0, surfaceDistort: 0.15, speed: 0.005 }

// Poor (0-39) — chaotic mass
{ distort: 0.6, frequency: 1.5, surfaceDistort: 0.3, speed: 0.008 }
```

---

## 4. Normal Recalculation — THE Critical Technique

### The Problem

When vertices are displaced in a vertex shader, normals still point outward as if the surface is a perfect sphere. Lighting is completely wrong — a chaotic blob lit as a smooth sphere looks flat and broken.

### The Solution: Neighbour Sampling

Sample two nearby points, displace them with the same function, compute the cross product:

```glsl
vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z)
        ? vec3(-v.y, v.x, 0.0)
        : vec3(0.0, -v.z, v.y));
}

// In the vertex shader, AFTER computing displacedPosition:

vec3 displacedPosition = position + normalize(normal) * f(position);
vec3 displacedNormal = normalize(normal);

if (fixNormals == 1.0) {
    float offset = 0.5 / 512.0;  // Relative to geometry resolution

    // Generate orthogonal tangent/bitangent from original normal
    vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));

    // Sample two neighbouring points
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;

    // Displace neighbours with the SAME function
    vec3 displacedNeighbour1 = neighbour1 + normal * f(neighbour1);
    vec3 displacedNeighbour2 = neighbour2 + normal * f(neighbour2);

    // Compute new tangent/bitangent from displaced positions
    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

    // Cross product = true surface normal
    displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
}
```

### Performance

- Calls `f()` 3x per vertex (vertex + 2 neighbours)
- Each `f()` call = 2 Perlin noise evaluations
- = 6 noise evaluations per vertex
- With 256x256 sphere (~130K vertices) = ~780K noise calls per frame
- The `fixNormals` toggle allows disabling for perf testing
- **Worth the cost** — the visual difference is dramatic

### Offset Value

`0.5 / 512.0` — chosen relative to the sphere's 256 segments. Approximately the distance between adjacent vertices. Too small = noise; too large = smoothed-out normals.

---

## 5. Environment Map Setup

### Blobmixer's Approach

Uses a real equirectangular photograph (2048px JPEG), converted to a cube render target:

```javascript
// Modern Three.js approach using PMREMGenerator
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

// For .hdr files (recommended for quality)
new RGBELoader().load('studio-soft.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture
  scene.environment = envMap
  material.envMap = envMap
  material.needsUpdate = true
  texture.dispose()
  pmremGenerator.dispose()
})

// For .jpg files (smaller, adequate for this use case)
const textureLoader = new THREE.TextureLoader()
textureLoader.load('environment.jpg', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  scene.environment = texture
  material.envMap = texture
})
```

### HDRI Recommendations for Ebb

- **Soft studio** — even, professional, no harsh hotspots
- **Natural outdoor** — subtle sky gradient, warm tones
- Source: [Poly Haven](https://polyhaven.com/hdris) (free, CC0)
- Keep file size reasonable (1024-2048px JPEG is fine for mobile)

---

## 6. Lighting

Minimal — the environment map does most of the work.

```javascript
// Low ambient fill
const ambient = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambient)

// One soft spotlight for directional highlight
const spot = new THREE.SpotLight(0xffffff, 0.5)
spot.position.set(3, 3, 3)
spot.angle = Math.PI / 4
spot.penumbra = 1      // Fully soft edge
spot.decay = 0.5
scene.add(spot)
```

---

## 7. Post-Processing

### Blobmixer's Pipeline

| Effect | Purpose | Settings |
|--------|---------|----------|
| Bloom | Glow on specular highlights | threshold: 0.1, smoothing: 0.5, opacity: 0.5 |
| Scanline | Film texture | density: 1, opacity: 0.1 |
| Noise | Film grain | blend: MULTIPLY, opacity: 0.1 |
| Vignette | Focus attention | offset: 0.5, darkness: 0.5 |

### For Ebb (clean medical aesthetic)

```javascript
// Keep only bloom + mild vignette. Skip scanlines/noise/glitch.
{
  bloom: {
    luminanceThreshold: 0.15,
    luminanceSmoothing: 0.5,
    intensity: 0.4,       // Subtle — catches clearcoat highlights
  },
  vignette: {
    offset: 0.6,
    darkness: 0.25,       // Very mild
  }
}
```

---

## 8. Renderer Configuration

```javascript
// Blobmixer's config (adapted for Ebb)
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,              // Transparent bg for app overlay
  powerPreference: 'high-performance',
})

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

// Camera — narrow FOV for product-photography feel
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
camera.position.set(0, 0, 4)
```

### Key Details

- **FOV 40** — Narrow, reduces perspective distortion. The orb feels like a photographed object.
- **Pixel ratio capped at 1.5** — Performance guard for retina screens.
- **ACESFilmic tone mapping** — Cinematic tone curve, handles bright highlights gracefully.
- **alpha: true** — Essential for overlaying the orb on the app's white background.

---

## 9. Geometry

```javascript
// High resolution for smooth noise displacement
const geometry = new THREE.SphereGeometry(
  1,     // radius
  256,   // widthSegments
  256    // heightSegments
)
```

256 segments = ~130K vertices. This resolution ensures the noise displacement produces smooth organic curves rather than faceted/low-poly shapes.

---

## 10. Custom Uniforms (from Blobmixer)

```javascript
const uniforms = {
  time:               { value: 0 },      // Primary animation time
  distort:            { value: 0.4 },     // Goo amplitude (0-1)
  radius:             { value: 1 },       // Base sphere radius
  frequency:          { value: 2 },       // Goo noise scale
  speed:              { value: 0.005 },   // Goo animation speed
  surfaceDistort:     { value: 0.1 },     // Surface wave amplitude
  surfaceFrequency:   { value: 3 },       // Surface noise scale
  surfaceTime:        { value: 0 },       // Surface animation time
  surfaceSpeed:       { value: 0.003 },   // Surface animation speed
  numberOfWaves:      { value: 5 },       // Sine wave count on surface
  fixNormals:         { value: 1.0 },     // Toggle normal recalculation
  surfacePoleAmount:  { value: 1.0 },     // Pole attenuation for waves
  gooPoleAmount:      { value: 1.0 },     // Pole attenuation for goo
}
```

### Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate)

  if (material.userData.shader) {
    const u = material.userData.shader.uniforms
    u.time.value += u.speed?.value || 0.005
    u.surfaceTime.value += u.surfaceSpeed?.value || 0.003
  }

  renderer.render(scene, camera)
}
```
