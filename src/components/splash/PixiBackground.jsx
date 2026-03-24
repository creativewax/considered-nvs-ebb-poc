// src/components/splash/PixiBackground.jsx

import { useEffect, useRef } from 'react'
import { Application, Mesh, MeshGeometry, Shader, GlProgram } from 'pixi.js'

// ------------------------------------------------------------ SHADERS

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

// Organic coloured lobes radiating from centre — like flower petals
// Each lobe is a directional blob defined by angle + noise distortion
const FRAGMENT_SRC = `
  in vec2 vTextureCoord;
  uniform float uTime;

  #define PI 3.14159265359

  // Simple 2D noise from sine combinations
  float noise(vec2 p, float t) {
    return sin(p.x * 2.3 + t * 0.4) * cos(p.y * 1.7 - t * 0.3)
         + sin(p.y * 3.1 + t * 0.5) * cos(p.x * 2.8 + t * 0.2);
  }

  // Soft lobe at a given angle with organic distortion
  float lobe(vec2 uv, float angle, float spread, float radius, float t) {
    float a = atan(uv.y, uv.x);
    float d = length(uv);

    // Organic edge distortion
    float n = noise(uv * 3.0, t + angle) * 0.08;

    // Angular falloff — how wide the petal is
    float angleDiff = mod(a - angle + PI, 2.0 * PI) - PI;
    float angularFalloff = smoothstep(spread, 0.0, abs(angleDiff));

    // Radial falloff — extends from centre to radius
    float radialFalloff = smoothstep(radius + n, 0.1, d);

    return angularFalloff * radialFalloff;
  }

  void main() {
    // Centre the UV coords (-1 to 1 range)
    vec2 uv = (vTextureCoord - 0.5) * 2.0;
    float t = uTime;

    // Palette — matching the design colours
    vec3 purple = vec3(0.42, 0.247, 0.627);   // #6B3FA0
    vec3 teal   = vec3(0.176, 0.353, 0.306);   // #2D5A4E
    vec3 orange = vec3(0.91, 0.514, 0.29);     // #E8834A
    vec3 coral  = vec3(0.816, 0.337, 0.424);   // #D0566C
    vec3 gold   = vec3(0.82, 0.66, 0.32);      // warm yellow

    // Start transparent
    vec4 col = vec4(0.0);

    // 5 lobes at different angles, slowly drifting
    float drift = t * 0.15;

    float l1 = lobe(uv, -2.4 + drift * 0.3, 0.7, 0.85, t);
    float l2 = lobe(uv,  -0.8 + drift * 0.2, 0.65, 0.9, t);
    float l3 = lobe(uv,  0.5 - drift * 0.25, 0.6, 0.8, t);
    float l4 = lobe(uv,  1.8 + drift * 0.15, 0.7, 0.85, t);
    float l5 = lobe(uv,  3.2 - drift * 0.2, 0.55, 0.75, t);

    // Blend lobes with their colours — strong, not washed out
    col.rgb += purple * l1 * 0.9;
    col.rgb += teal   * l2 * 0.85;
    col.rgb += orange * l3 * 0.9;
    col.rgb += coral  * l4 * 0.85;
    col.rgb += gold   * l5 * 0.7;

    // Alpha follows the combined lobe intensity
    float totalIntensity = l1 + l2 + l3 + l4 + l5;
    col.a = smoothstep(0.0, 0.3, totalIntensity) * 0.85;

    // Soften where lobes overlap to avoid blowout
    col.rgb = min(col.rgb, vec3(1.0));

    gl_FragColor = col;
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
        backgroundAlpha: 0,
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

      const shader = Shader.from({
        gl: glProgram,
        resources: {
          uniforms: {
            uTime: { value: 0, type: 'f32' },
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
          // Fallback uniform path for different pixi versions
          try {
            shader.resources.uniforms.uTime += ticker.deltaTime * 0.016
          } catch { /* shader disposed */ }
        }
      })
    }

    init()

    return () => {
      destroyed = true
      if (appRef.current) {
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
