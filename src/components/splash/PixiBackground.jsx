// src/components/splash/PixiBackground.jsx

import { useEffect, useRef } from 'react'
import { Application, Mesh, MeshGeometry, Shader, GlProgram } from 'pixi.js'

// ------------------------------------------------------------ BLOB SETTINGS
// Tweak these to adjust the organic shape appearance

export const BLOB_SETTINGS = {
  // Shape
  noiseScale:     0.65,   // Lobe count — lower = fewer/broader, higher = more/bumpier
  baseRadius:     0.75,   // Overall blob size (0-1 UV space)
  noiseAmount:    0.35,   // How far lobes extend in/out
  octaves:        3,      // Shape smoothness — 1 = very smooth, 3+ = textured
  breatheSpeed:   0.15,   // How fast the shape breathes

  // Edge
  edgeSoftness:   0.0,  // Edge crispness — lower = sharper

  // Inner cutout (where white circle sits)
  innerRadius:    0.65,
  innerSoftness:  0.005,

  // Colours (#hex → vec3 RGB 0-1)
  colour1: [0.243, 0.227, 0.431],  // #3E3A6E — purple/indigo
  colour2: [0.922, 0.667, 0.306],  // #EBAA4E — gold
  colour3: [0.902, 0.435, 0.396],  // #E66F65 — coral

  // Colour zones
  blendWidth:     2.0,    // Colour boundary softness — lower = sharper zones
  driftSpeed:     0.5,   // How fast colour zones rotate

  // Vividness
  saturation:     1.4,    // Colour boost — 1.0 = natural, higher = richer

  // Page background (#FDFCFB baked into shader — prevents iOS compositor mismatch)
  pageBg: [0.992, 0.988, 0.984],  // #FDFCFB
}

// ------------------------------------------------------------ VERTEX SHADER

const VERTEX_SRC = `
  in vec2 aPosition;
  in vec2 aUV;
  out vec2 vTextureCoord;

  uniform mat3 uProjectionMatrix;
  uniform mat3 uWorldTransformMatrix;
  uniform mat3 uTransformMatrix;

  void main() {
    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aUV;
  }
`

// ------------------------------------------------------------ FRAGMENT SHADER
// Polar-coordinate noise-modulated blob with fBm and angular colour blending.
// Creates an organic shape defined by control points on a circle whose radii
// modulate via a 3D simplex noise flow field, connected with smooth interpolation.

const FRAGMENT_SRC = `
  in vec2 vTextureCoord;
  uniform float uTime;
  uniform vec2 uResolution;

  // ── SETTINGS (injected as uniforms) ──
  uniform float uNoiseScale;
  uniform float uBaseRadius;
  uniform float uNoiseAmount;
  uniform float uBreatheSpeed;
  uniform float uEdgeSoftness;
  uniform float uInnerRadius;
  uniform float uInnerSoftness;
  uniform vec3 uColour1;
  uniform vec3 uColour2;
  uniform vec3 uColour3;
  uniform float uBlendWidth;
  uniform float uDriftSpeed;
  uniform float uSaturation;
  uniform vec3 uPageBg;

  #define PI 3.14159265359
  #define TWO_PI 6.28318530718

  // ── SIMPLEX 3D NOISE (Ashima Arts / Ian McEwan) ──

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // ── FRACTAL BROWNIAN MOTION (2 octaves — smoother, fewer bumps) ──

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    float frequency = 1.0;
    for (int i = 0; i < 2; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.45;
    }
    return value;
  }

  // ── BLOB BOUNDARY ──
  // Lower noiseScale = fewer, broader lobes (smoother silhouette)

  float getBlobRadius(float angle, float time) {
    vec3 nc = vec3(
      cos(angle) * uNoiseScale,
      sin(angle) * uNoiseScale,
      time * uBreatheSpeed
    );
    return uBaseRadius + fbm(nc) * uNoiseAmount;
  }

  // ── ANGULAR COLOUR — 3 defined zones at 1/3 intervals ──
  // Each colour owns a sector, with a narrow blend at the boundaries

  vec3 getColour(float angle, float time) {
    // Slowly rotate the colour zones
    float drift = time * uDriftSpeed;

    // Normalise angle to 0..TWO_PI
    float a = mod(angle + PI + drift, TWO_PI);

    // Three sectors, each ~2.09 radians (120 degrees)
    float sector = TWO_PI / 3.0;
    float blendWidth = uBlendWidth;

    // Distance into each sector (0 = centre of sector, increases toward edges)
    float d0 = abs(mod(a - sector * 0.0 + PI, TWO_PI) - PI);
    float d1 = abs(mod(a - sector * 1.0 + PI, TWO_PI) - PI);
    float d2 = abs(mod(a - sector * 2.0 + PI, TWO_PI) - PI);

    // Weights — sharper falloff (pow 2) for more defined zones
    float w0 = pow(1.0 - smoothstep(0.0, sector * 0.5 + blendWidth, d0), 2.0);
    float w1 = pow(1.0 - smoothstep(0.0, sector * 0.5 + blendWidth, d1), 2.0);
    float w2 = pow(1.0 - smoothstep(0.0, sector * 0.5 + blendWidth, d2), 2.0);

    float total = w0 + w1 + w2 + 0.001;
    return (uColour1 * w0 + uColour2 * w1 + uColour3 * w2) / total;
  }

  // ── MAIN ──

  void main() {
    vec2 uv = (vTextureCoord - 0.5) * 2.0;

    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    float t = uTime;

    // Blob boundary at this angle
    float blobR = getBlobRadius(angle, t);

    // Sharp edge
    float mask = smoothstep(blobR + uEdgeSoftness, blobR - uEdgeSoftness, dist);

    // Cut out inner circle (where the white circle sits)
    float innerCut = smoothstep(uInnerRadius - uInnerSoftness, uInnerRadius + uInnerSoftness, dist);

    // Final mask: outside inner circle, inside blob boundary
    float finalMask = mask * innerCut;

    // Rich colour from angular blend
    vec3 colour = getColour(angle, t);

    // Boost saturation to keep colours deep and vivid
    float grey = dot(colour, vec3(0.299, 0.587, 0.114));
    colour = mix(vec3(grey), colour, uSaturation);

    // Blend with page background — fully opaque output eliminates
    // iOS compositor mismatch between WebGL and DOM layers
    vec3 final = mix(uPageBg, colour, finalMask);
    gl_FragColor = vec4(final, 1.0);
  }
`

// ------------------------------------------------------------ COMPONENT

export default function PixiBackground() {
  const containerRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let destroyed = false

    async function init() {
      const app = new Application()

      await app.init({
        resizeTo: container,
        backgroundAlpha: 1,
        backgroundColor: 0xFDFCFB,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio, 2),
        autoDensity: true,
      })

      if (destroyed) {
        app.destroy(true)
        return
      }

      appRef.current = app
      container.appendChild(app.canvas)

      const w = app.screen.width
      const h = app.screen.height

      const geometry = new MeshGeometry({
        positions: new Float32Array([0, 0, w, 0, w, h, 0, h]),
        uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
      })

      const glProgram = GlProgram.from({
        vertex: VERTEX_SRC,
        fragment: FRAGMENT_SRC,
      })

      const s = BLOB_SETTINGS
      const shader = Shader.from({
        gl: glProgram,
        resources: {
          uniforms: {
            uTime:          { value: 0, type: 'f32' },
            uResolution:    { value: new Float32Array([w, h]), type: 'vec2<f32>' },
            uNoiseScale:    { value: s.noiseScale, type: 'f32' },
            uBaseRadius:    { value: s.baseRadius, type: 'f32' },
            uNoiseAmount:   { value: s.noiseAmount, type: 'f32' },
            uBreatheSpeed:  { value: s.breatheSpeed, type: 'f32' },
            uEdgeSoftness:  { value: s.edgeSoftness, type: 'f32' },
            uInnerRadius:   { value: s.innerRadius, type: 'f32' },
            uInnerSoftness: { value: s.innerSoftness, type: 'f32' },
            uColour1:       { value: new Float32Array(s.colour1), type: 'vec3<f32>' },
            uColour2:       { value: new Float32Array(s.colour2), type: 'vec3<f32>' },
            uColour3:       { value: new Float32Array(s.colour3), type: 'vec3<f32>' },
            uBlendWidth:    { value: s.blendWidth, type: 'f32' },
            uDriftSpeed:    { value: s.driftSpeed, type: 'f32' },
            uSaturation:    { value: s.saturation, type: 'f32' },
            uPageBg:        { value: new Float32Array(s.pageBg), type: 'vec3<f32>' },
          },
        },
      })

      const quad = new Mesh({ geometry, shader })
      app.stage.addChild(quad)

      // Animate
      app.ticker.add((ticker) => {
        try {
          shader.resources.uniforms.uniforms.uTime += ticker.deltaTime * 0.016
        } catch {
          try {
            shader.resources.uniforms.uTime += ticker.deltaTime * 0.016
          } catch { /* shader disposed */ }
        }
      })

      // Handle resize
      const onResize = () => {
        const newW = app.screen.width
        const newH = app.screen.height
        geometry.positions = new Float32Array([0, 0, newW, 0, newW, newH, 0, newH])
        try {
          shader.resources.uniforms.uniforms.uResolution = new Float32Array([newW, newH])
        } catch {
          try {
            shader.resources.uniforms.uResolution = new Float32Array([newW, newH])
          } catch { /* disposed */ }
        }
      }

      window.addEventListener('resize', onResize)
      app.__resizeCleanup = () => window.removeEventListener('resize', onResize)
    }

    init()

    return () => {
      destroyed = true
      if (appRef.current) {
        appRef.current.__resizeCleanup?.()
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  )
}
