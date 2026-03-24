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

const FRAGMENT_SRC = `
  in vec2 vTextureCoord;
  uniform float uTime;

  void main() {
    vec2 uv = vTextureCoord;
    float t = uTime * 0.05;

    /* Layered sine waves for organic colour drift */
    float n1 = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t * 0.7);
    float n2 = sin(uv.y * 4.0 + t * 1.3) * cos(uv.x * 1.5 + t * 0.5);
    float n3 = sin((uv.x + uv.y) * 2.0 - t * 0.8);
    float n4 = sin(uv.x * 1.8 - t * 0.4) * cos(uv.y * 3.2 + t * 0.6);

    /* Palette colours */
    vec3 purple = vec3(0.42, 0.25, 0.63);
    vec3 teal   = vec3(0.27, 0.68, 0.78);
    vec3 orange = vec3(0.91, 0.51, 0.29);
    vec3 coral  = vec3(0.82, 0.34, 0.42);
    vec3 white  = vec3(0.99, 0.99, 0.98);

    /* Start from warm white, gently blend palette colours */
    vec3 col = white;
    col = mix(col, purple, smoothstep(0.0, 0.6, n1) * 0.3);
    col = mix(col, teal,   smoothstep(-0.2, 0.5, n2) * 0.25);
    col = mix(col, orange,  smoothstep(0.1, 0.7, n3) * 0.2);
    col = mix(col, coral,   smoothstep(-0.3, 0.4, n1 * n2) * 0.15);
    col = mix(col, white,   smoothstep(-0.1, 0.6, n4) * 0.3);

    gl_FragColor = vec4(col, 1.0);
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
        antialias: false,
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

      /* Full-screen quad geometry */
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

      /* Animate the time uniform */
      app.ticker.add((ticker) => {
        shader.resources.uniforms.uniforms.uTime += ticker.deltaTime * 0.016
      })

      /* Handle resize */
      const onResize = () => {
        const newW = app.screen.width
        const newH = app.screen.height
        geometry.positions = new Float32Array([0, 0, newW, 0, newW, newH, 0, newH])
      }

      window.addEventListener('resize', onResize)
      app.__resizeHandler = onResize
    }

    init()

    return () => {
      destroyed = true
      if (appRef.current) {
        if (appRef.current.__resizeHandler) {
          window.removeEventListener('resize', appRef.current.__resizeHandler)
        }
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
        zIndex: 0,
      }}
    />
  )
}
