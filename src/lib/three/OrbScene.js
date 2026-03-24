// src/lib/three/OrbScene.js

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { EffectComposer, RenderPass, EffectPass, BloomEffect, VignetteEffect } from 'postprocessing'
import { gsap } from 'gsap'
import noiseGlsl from './shaders/noise.glsl?raw'
import displacementGlsl from './shaders/displacement.glsl?raw'

// ------------------------------------------------------------
// ORB SCENE — full Three.js lifecycle for the sleep orb
// ------------------------------------------------------------

const DEFAULT_UNIFORMS = {
  time:              0,
  distort:           1.0,       // EXAGGERATED for testing — should be very obvious
  frequency:         2.0,
  surfaceDistort:    0.3,       // EXAGGERATED for testing
  surfaceFrequency:  3.0,
  surfaceTime:       0,
  numberOfWaves:     5.0,
  fixNormals:        1.0,
  surfacePoleAmount: 1.0,
  gooPoleAmount:     1.0,
  surfaceSpeed:      0.003,
}

const TWEENED_UNIFORM_KEYS = [
  'distort', 'frequency', 'surfaceDistort', 'surfaceFrequency', 'numberOfWaves',
]

const TWEENED_MATERIAL_KEYS = [
  'roughness', 'clearcoat', 'clearcoatRoughness', 'envMapIntensity', 'transmission',
]

export class OrbScene {
  constructor() {
    this._renderer = null
    this._scene = null
    this._camera = null
    this._controls = null
    this._composer = null
    this._mesh = null
    this._shader = null
    this._rafId = null
    this._speed = 0.005
    this._surfaceSpeed = 0.003
    this._container = null
    this._activeTweens = []
    this._baseDistort = null   // baseline distort value between config updates
    this._onTap = null         // bound tap handler for cleanup
    this._lastConfig = null    // cached config to re-apply after shader recompilation
  }

  // ------------------------------------------------------------
  // LIFECYCLE
  // ------------------------------------------------------------

  mount(container) {
    this._container = container
    const { width, height } = container.getBoundingClientRect()

    this._initRenderer(width, height)
    this._initScene()
    this._initCamera(width, height)
    this._initGeometryAndMaterial()
    this._initLights()
    this._initEnvironment()
    this._initControls()
    this._initPostProcessing()

    container.appendChild(this._renderer.domElement)
    this._initTapInteraction()
    this._animate()
  }

  unmount() {
    if (this._rafId) cancelAnimationFrame(this._rafId)
    this._rafId = null
    this._killTweens()
    if (this._onTap && this._renderer?.domElement) {
      this._renderer.domElement.removeEventListener('click', this._onTap)
    }
    this._controls?.dispose()
    this._composer?.dispose()
    this._renderer?.domElement?.remove()
    this.dispose()
  }

  dispose() {
    this._mesh?.geometry?.dispose()
    this._mesh?.material?.dispose()
    this._renderer?.dispose()
    this._scene = null
    this._camera = null
    this._renderer = null
    this._composer = null
    this._mesh = null
    this._shader = null
    this._container = null
  }

  resize() {
    if (!this._container || !this._renderer) return
    const { width, height } = this._container.getBoundingClientRect()
    this._camera.aspect = width / height
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(width, height)
    this._composer.setSize(width, height)
  }

  // ------------------------------------------------------------
  // RENDERER
  // ------------------------------------------------------------

  _initRenderer(width, height) {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0xFDFCFB, 1)  // Match page bg — prevents iOS compositor mismatch
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height)
    this._renderer = renderer
  }

  // ------------------------------------------------------------
  // SCENE
  // ------------------------------------------------------------

  _initScene() {
    this._scene = new THREE.Scene()
  }

  // ------------------------------------------------------------
  // CAMERA
  // ------------------------------------------------------------

  _initCamera(width, height) {
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0, 4)
    this._camera = camera
  }

  // ------------------------------------------------------------
  // GEOMETRY + MATERIAL (onBeforeCompile shader injection)
  // ------------------------------------------------------------

  _initGeometryAndMaterial() {
    const geometry = new THREE.SphereGeometry(1, 256, 256)

    // Match blobmixer's MeshPhysicalMaterial setup exactly:
    // Low roughness (0.14) + full clearcoat + moderate clearcoat roughness
    // = wet, organic, dual-layer PBR look
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.14,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.7,
      envMapIntensity: 1.0,
      reflectivity: 0.5,
    })

    // Shader injection — prepend noise + displacement, replace vertex chunks
    material.onBeforeCompile = (shader) => {
      this._shader = shader

      // Add custom uniforms
      for (const [key, val] of Object.entries(DEFAULT_UNIFORMS)) {
        shader.uniforms[key] = { value: val }
      }

      // Check what chunks exist in the vertex shader
      const hasBeginVertex = shader.vertexShader.includes('#include <begin_vertex>')
      const hasBeginNormal = shader.vertexShader.includes('#include <beginnormal_vertex>')
      console.log('[OrbScene] onBeforeCompile fired. begin_vertex:', hasBeginVertex, 'beginnormal_vertex:', hasBeginNormal)

      // Prepend noise and displacement functions to vertex shader
      shader.vertexShader = noiseGlsl + '\n' + displacementGlsl + '\n' + shader.vertexShader

      // ── STRATEGY: replace TWO chunks ──
      // 1. beginnormal_vertex — set objectNormal BEFORE defaultnormal uses it
      // 2. begin_vertex — set displaced position

      // Step 1: Replace beginnormal_vertex to compute displaced normal early
      // The default chunk is: vec3 objectNormal = normal;
      // We add our displacement + normal recalculation here
      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `
          // ── CUSTOM DISPLACEMENT + NORMAL ──
          vec3 displacedPosition = position + normalize(normal) * f(position);

          vec3 objectNormal = normal;
          if (fixNormals == 1.0) {
            float offset = 0.5 / 512.0;
            vec3 tangent = orthogonal(normal);
            vec3 bitangent = normalize(cross(normal, tangent));
            vec3 neighbour1 = position + tangent * offset;
            vec3 neighbour2 = position + bitangent * offset;
            vec3 displacedNeighbour1 = neighbour1 + normal * f(neighbour1);
            vec3 displacedNeighbour2 = neighbour2 + normal * f(neighbour2);
            vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
            vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
            objectNormal = normalize(cross(displacedTangent, displacedBitangent));
          }
        `
      )

      // Step 2: Replace begin_vertex to use displaced position
      // The default chunk is: vec3 transformed = vec3( position );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        /* glsl */ `
          vec3 transformed = displacedPosition;
        `
      )

      // Verify our code is actually in the compiled shader
      const hasDisplacement = shader.vertexShader.includes('displacedPosition')
      const hasF = shader.vertexShader.includes('f(position)')
      console.log('[OrbScene] Shader patched. Has displacement:', hasDisplacement, 'Has f():', hasF)

      // Re-apply cached config after shader recompilation (e.g. after HDRI load)
      if (this._lastConfig) {
        this._applyConfigToShader(this._lastConfig)
      }
    }

    this._mesh = new THREE.Mesh(geometry, material)
    this._scene.add(this._mesh)
  }

  // ------------------------------------------------------------
  // LIGHTS
  // ------------------------------------------------------------

  _initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    this._scene.add(ambient)

    const spot = new THREE.SpotLight(0xffffff, 1.5)
    spot.position.set(3, 4, 5)
    spot.angle = Math.PI / 3
    spot.penumbra = 1
    spot.decay = 0.3
    this._scene.add(spot)
  }

  // ------------------------------------------------------------
  // ENVIRONMENT MAP (programmatic — replaced with HDRI later)
  // ------------------------------------------------------------

  _initEnvironment() {
    // Load a real studio HDRI — naturalistic reflections like blobmixer
    const pmrem = new THREE.PMREMGenerator(this._renderer)
    pmrem.compileEquirectangularShader()

    new HDRLoader().load(
      '/env/studio.hdr',
      (texture) => {
        // Guard: scene may have been disposed if React unmounted during load
        if (!this._scene || !this._mesh) {
          console.warn('[OrbScene] HDRI loaded but scene already disposed')
          texture.dispose()
          pmrem.dispose()
          return
        }
        console.log('[OrbScene] HDRI loaded successfully')
        const envMap = pmrem.fromEquirectangular(texture).texture
        this._scene.environment = envMap
        this._mesh.material.envMap = envMap
        this._mesh.material.needsUpdate = true
        texture.dispose()
        pmrem.dispose()
      },
      undefined,
      (err) => {
        console.error('[OrbScene] Failed to load HDRI:', err)
        if (!this._scene || !this._mesh) { pmrem.dispose(); return }
        // Fallback: programmatic environment
        const fallbackScene = new THREE.Scene()
        fallbackScene.background = new THREE.Color(0x888888)
        const l = new THREE.PointLight(0xffffff, 30, 30)
        l.position.set(5, 5, 5)
        fallbackScene.add(l)
        const envMap = pmrem.fromScene(fallbackScene).texture
        this._scene.environment = envMap
        this._mesh.material.envMap = envMap
        this._mesh.material.needsUpdate = true
        fallbackScene.clear()
        pmrem.dispose()
      }
    )
  }

  // ------------------------------------------------------------
  // ORBIT CONTROLS
  // ------------------------------------------------------------

  _initControls() {
    const controls = new OrbitControls(this._camera, this._renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.0
    this._controls = controls
  }

  // ------------------------------------------------------------
  // POST-PROCESSING
  // ------------------------------------------------------------

  _initPostProcessing() {
    const composer = new EffectComposer(this._renderer)
    composer.addPass(new RenderPass(this._scene, this._camera))

    const bloom = new BloomEffect({
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.5,
      intensity: 0.5,
    })

    const vignette = new VignetteEffect({
      offset: 0.6,
      darkness: 0.25,
    })

    composer.addPass(new EffectPass(this._camera, bloom, vignette))
    this._composer = composer
  }

  // ------------------------------------------------------------
  // ANIMATION LOOP
  // ------------------------------------------------------------

  _animate = () => {
    this._rafId = requestAnimationFrame(this._animate)

    if (this._shader) {
      this._shader.uniforms.time.value += this._speed
      this._shader.uniforms.surfaceTime.value += this._surfaceSpeed
    }

    this._controls?.update()
    this._composer.render()
  }

  // ------------------------------------------------------------
  // APPLY CONFIG TO SHADER (immediate, no tween — used after recompilation)
  // ------------------------------------------------------------

  _applyConfigToShader(config) {
    if (!this._shader) return
    for (const key of TWEENED_UNIFORM_KEYS) {
      if (config[key] != null && this._shader.uniforms[key]) {
        this._shader.uniforms[key].value = config[key]
      }
    }
    if (config.speed != null) this._speed = config.speed
    if (config.surfaceSpeed != null) this._surfaceSpeed = config.surfaceSpeed
  }

  // ------------------------------------------------------------
  // CONFIG UPDATE — tween uniforms + material for smooth transitions
  // ------------------------------------------------------------

  updateConfig(config) {
    if (!config || !this._mesh) return
    console.log('[OrbScene] updateConfig:', config.quality, 'distort:', config.distort)
    this._lastConfig = config

    this._killTweens()

    // Speed values are set directly (not tweened)
    if (config.speed != null) this._speed = config.speed
    if (config.surfaceSpeed != null) this._surfaceSpeed = config.surfaceSpeed

    // Track baseline distort so tap-pulse can return to it after a config update
    if (config.distort != null) this._baseDistort = config.distort

    // Tween uniforms
    if (this._shader) {
      const uniformTarget = {}
      for (const key of TWEENED_UNIFORM_KEYS) {
        if (config[key] != null) uniformTarget[key] = config[key]
      }

      if (Object.keys(uniformTarget).length) {
        // Build a proxy object with current values
        const current = {}
        for (const key of Object.keys(uniformTarget)) {
          current[key] = this._shader.uniforms[key]?.value ?? 0
        }

        const tween = gsap.to(current, {
          ...uniformTarget,
          duration: 0.8,
          ease: 'power2.inOut',
          onUpdate: () => {
            for (const key of Object.keys(uniformTarget)) {
              if (this._shader?.uniforms[key]) {
                this._shader.uniforms[key].value = current[key]
              }
            }
          },
        })
        this._activeTweens.push(tween)
      }
    }

    // Tween material properties
    const mat = this._mesh.material
    const matTarget = {}
    for (const key of TWEENED_MATERIAL_KEYS) {
      if (config[key] != null) matTarget[key] = config[key]
    }

    if (Object.keys(matTarget).length) {
      const tween = gsap.to(mat, {
        ...matTarget,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      this._activeTweens.push(tween)
    }

    // Colour — tween the material colour to the quality primary
    if (config.colours?.primary) {
      const targetCol = new THREE.Color(config.colours.primary)
      const tween = gsap.to(mat.color, {
        r: targetCol.r,
        g: targetCol.g,
        b: targetCol.b,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      this._activeTweens.push(tween)
    }

    // Scale
    if (config.scale != null) {
      const tween = gsap.to(this._mesh.scale, {
        x: config.scale,
        y: config.scale,
        z: config.scale,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      this._activeTweens.push(tween)
    }
  }

  // ------------------------------------------------------------
  // TAP INTERACTION — brief distort pulse on click/tap
  // ------------------------------------------------------------

  _initTapInteraction() {
    this._onTap = () => {
      if (!this._shader) return

      const base    = this._baseDistort ?? this._shader.uniforms.distort.value
      const pulseTo = Math.min(base + 0.15, 1.0)

      // Kill any existing pulse tweens but not config tweens — use a dedicated ref
      if (this._pulseTween) this._pulseTween.kill()

      const proxy = { distort: this._shader.uniforms.distort.value }

      this._pulseTween = gsap.to(proxy, {
        distort: pulseTo,
        duration: 0.12,
        ease: 'power2.out',
        onUpdate: () => {
          if (this._shader?.uniforms?.distort) {
            this._shader.uniforms.distort.value = proxy.distort
          }
        },
        onComplete: () => {
          // Ease back to the baseline
          this._pulseTween = gsap.to(proxy, {
            distort: base,
            duration: 0.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (this._shader?.uniforms?.distort) {
                this._shader.uniforms.distort.value = proxy.distort
              }
            },
          })
        },
      })
    }

    this._renderer.domElement.addEventListener('click', this._onTap)
  }

  _killTweens() {
    this._activeTweens.forEach((t) => t.kill())
    this._activeTweens = []
    if (this._pulseTween) {
      this._pulseTween.kill()
      this._pulseTween = null
    }
  }
}
