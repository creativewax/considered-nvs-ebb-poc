// src/lib/three/OrbScene.js

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
// postprocessing removed — it silently overrides renderer.toneMapping,
// making the orb look flat. Direct rendering with the renderer's own
// ACES tone mapping produces blobmixer-quality results.
import { gsap } from 'gsap'
import { TendrilSystem } from './TendrilSystem'
import noiseGlsl from './shaders/noise.glsl?raw'
import displacementGlsl from './shaders/displacement.glsl?raw'

// ------------------------------------------------------------
// ORB SCENE — full Three.js lifecycle for the sleep orb
// ------------------------------------------------------------

const DEFAULT_UNIFORMS = {
  time:              0,
  distort:           0.4,
  frequency:         2.0,
  surfaceDistort:    0.1,
  surfaceFrequency:  3.0,
  surfaceTime:       0,
  numberOfWaves:     5.0,
  fixNormals:        1.0,
  surfacePoleAmount: 1.0,
  gooPoleAmount:     1.0,
  surfaceSpeed:      0.003,
  twist:             0,
  twistFrequency:    1.0,
}

const TWEENED_UNIFORM_KEYS = [
  'distort', 'frequency', 'surfaceDistort', 'surfaceFrequency',
  'numberOfWaves', 'surfacePoleAmount', 'gooPoleAmount',
  'twist', 'twistFrequency',
]

const TWEENED_MATERIAL_KEYS = [
  'roughness', 'metalness', 'clearcoat', 'clearcoatRoughness',
  'envMapIntensity', 'transmission', 'ior',
]

// ── MOBILE PERFORMANCE SCALING ──
const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const SPHERE_SEGMENTS = IS_MOBILE ? 128 : 256
const PIXEL_RATIO_CAP = IS_MOBILE ? 1.0 : 1.5

export class OrbScene {
  constructor() {
    this._renderer = null
    this._scene = null
    this._camera = null
    this._controls = null
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
    this._renderer?.domElement?.remove()
    this.dispose()
  }

  dispose() {
    this._mesh?.geometry?.dispose()
    this._mesh?.material?.dispose()
    this._tendrils?.dispose()
    this._renderer?.dispose()
    this._scene = null
    this._camera = null
    this._renderer = null
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
  }

  // ------------------------------------------------------------
  // RENDERER
  // ------------------------------------------------------------

  _initRenderer(width, height) {
    const renderer = new THREE.WebGLRenderer({
      antialias: !IS_MOBILE,  // Skip AA on mobile for performance
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0xFDFCFB, 1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 2.5  // High exposure counteracts ACES darkening
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP))
    renderer.setSize(width, height)
    this._renderer = renderer
  }

  // ------------------------------------------------------------
  // SCENE
  // ------------------------------------------------------------

  _initScene() {
    this._scene = new THREE.Scene()
    // Low environmentIntensity: HDRI provides subtle specular reflections only.
    // Point lights handle ALL diffuse colouring — this is why they were invisible
    // before. The env map was fully illuminating the surface, drowning them out.
    this._scene.environmentIntensity = 0.95  // Sharp reflections, adds depth to material
  }

  // ------------------------------------------------------------
  // CAMERA
  // ------------------------------------------------------------

  _initCamera(width, height) {
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0, 3.8)  // Closer — orb fills more of the frame
    this._camera = camera
  }

  // ------------------------------------------------------------
  // GEOMETRY + MATERIAL (onBeforeCompile shader injection)
  // ------------------------------------------------------------

  _initGeometryAndMaterial() {
    const geometry = new THREE.SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS)

    // Metallic base so specular reflections carry light colour (not white).
    // Low clearcoat to avoid adding a white reflective wash on top.
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.5,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.0,
    })

    // CRITICAL: force Three.js to compile OUR modified shader instead of
    // reusing a cached program for standard MeshPhysicalMaterial
    material.customProgramCacheKey = () => 'ebb-orb-displacement'

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
      // 1. beginnormal_vertex — compute displacement + recalculated normal
      // 2. begin_vertex — use displaced position
      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `
          // Apply noise-driven twist BEFORE displacement
          vec3 twistedPosition = applyTwist(position);
          vec3 displacedPosition = twistedPosition + normalize(normal) * f(twistedPosition);

          vec3 objectNormal = normal;
          if (fixNormals == 1.0) {
            float offset = 0.5 / 512.0;
            vec3 tangent = orthogonal(normal);
            vec3 bitangent = normalize(cross(normal, tangent));
            vec3 neighbour1 = applyTwist(position + tangent * offset);
            vec3 neighbour2 = applyTwist(position + bitangent * offset);
            vec3 displacedNeighbour1 = neighbour1 + normal * f(neighbour1);
            vec3 displacedNeighbour2 = neighbour2 + normal * f(neighbour2);
            vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
            vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
            objectNormal = normalize(cross(displacedTangent, displacedBitangent));
          }
        `
      )

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

    // ── TENDRIL SYSTEM — metallic structures growing from the sphere ──
    this._tendrils = new TendrilSystem(this._scene)
  }

  // ------------------------------------------------------------
  // LIGHTS
  // ------------------------------------------------------------

  _initLights() {
    // decay: 0 disables inverse-square falloff — light is uniform everywhere.
    // Without this, lights at distance 4 lose 94% intensity with decay: 2.
    const ambient = new THREE.AmbientLight(0xffffff, 0.1)
    this._scene.add(ambient)

    // Key — upper right
    this._keyLight = new THREE.PointLight(0xffeedd, 70.5)
    this._keyLight.decay = 0
    this._keyLight.position.set(2, 2.5, 2.5)
    this._scene.add(this._keyLight)

    // Fill — left (closer for stronger tint)
    this._fillLight = new THREE.PointLight(0xddccff, 70.5)
    this._fillLight.decay = 0
    this._fillLight.position.set(-2.5, -0.5, 2)
    this._scene.add(this._fillLight)

    // Rim — behind
    this._rimLight = new THREE.PointLight(0xffccaa, 70.5)
    this._rimLight.decay = 0
    this._rimLight.position.set(0.5, -2, -2.5)
    this._scene.add(this._rimLight)
  }

  // ------------------------------------------------------------
  // ENVIRONMENT MAP (programmatic — replaced with HDRI later)
  // ------------------------------------------------------------

  _initEnvironment() {
    // Load a real studio HDRI — naturalistic reflections like blobmixer
    const pmrem = new THREE.PMREMGenerator(this._renderer)
    pmrem.compileEquirectangularShader()

    // Studio HDRI — sharp, controlled reflections with good specular highlights
    new RGBELoader().load(
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
        if (this._tendrils) {
          this._tendrils.setEnvMap(envMap)
        }
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
    controls.autoRotateSpeed = 1.5
    this._controls = controls
    this._isInteracting = false
    this._chromaticAmount = 0

    // Track interaction for chromatic aberration
    controls.addEventListener('start', () => { this._isInteracting = true })
    controls.addEventListener('end', () => { this._isInteracting = false })
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
    // Animate tendrils
    if (this._tendrils && this._lastConfig) {
      this._tendrils.update(0.016, this._lastConfig)
    }


    this._controls?.update()
    this._renderer.render(this._scene, this._camera)
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
    // Set light colours immediately
    if (config.lightKey && this._keyLight) this._keyLight.color.set(config.lightKey)
    if (config.lightFill && this._fillLight) this._fillLight.color.set(config.lightFill)
    if (config.lightRim && this._rimLight) this._rimLight.color.set(config.lightRim)
    // Material colour — must be set here too, HDRI recompile resets it
    if (config.color && this._mesh?.material) {
      this._mesh.material.color.set(config.color)
    }
    // Material properties
    const mat = this._mesh?.material
    if (mat) {
      for (const key of TWEENED_MATERIAL_KEYS) {
        if (config[key] != null) mat[key] = config[key]
      }
    }
  }

  _updateTendrils(config) {
    if (!this._tendrils) return
    this._tendrils.updateConfig(config)
  }

  // ------------------------------------------------------------
  // CONFIG UPDATE — tween uniforms + material for smooth transitions
  // ------------------------------------------------------------

  updateConfig(config) {
    // DEBUG: log what's being applied to the material
    console.log('[OrbScene] Material BEFORE update:', {
      color: this._mesh?.material?.color?.getHexString(),
      roughness: this._mesh?.material?.roughness,
      metalness: this._mesh?.material?.metalness,
      clearcoat: this._mesh?.material?.clearcoat,
    })
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

    // Colour — tween to the preset's orb colour
    console.log('[OrbScene] Colour tween:', config.color, '→', this._mesh?.material?.color?.getHexString())
    if (config.color) {
      const targetCol = new THREE.Color(config.color)
      const tween = gsap.to(mat.color, {
        r: targetCol.r,
        g: targetCol.g,
        b: targetCol.b,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      this._activeTweens.push(tween)
    }

    // Tendril structures
    this._updateTendrils(config)

    // Light colours — paint the orb with gradient blending
    console.log('[OrbScene] Setting light colours:', config.lightKey, config.lightFill, config.lightRim)
    if (config.lightKey && this._keyLight) {
      const kc = new THREE.Color(config.lightKey)
      gsap.to(this._keyLight.color, { r: kc.r, g: kc.g, b: kc.b, duration: 0.8, ease: 'power2.inOut' })
    }
    if (config.lightFill && this._fillLight) {
      const fc = new THREE.Color(config.lightFill)
      gsap.to(this._fillLight.color, { r: fc.r, g: fc.g, b: fc.b, duration: 0.8, ease: 'power2.inOut' })
    }
    if (config.lightRim && this._rimLight) {
      const rc = new THREE.Color(config.lightRim)
      gsap.to(this._rimLight.color, { r: rc.r, g: rc.g, b: rc.b, duration: 0.8, ease: 'power2.inOut' })
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

      const u = this._shader.uniforms
      const baseDistort = this._baseDistort ?? u.distort.value
      const baseSurface = u.surfaceDistort?.value ?? 0.1
      const baseTwist = u.twist?.value ?? 0

      if (this._pulseTween) this._pulseTween.kill()

      // Ripple: push distort + surface + twist outward, then ease back
      const proxy = {
        distort: u.distort.value,
        surfaceDistort: baseSurface,
        twist: baseTwist,
      }

      this._pulseTween = gsap.to(proxy, {
        distort: Math.min(baseDistort + 0.3, 1.2),
        surfaceDistort: baseSurface + 0.15,
        twist: baseTwist + 0.3,
        duration: 0.15,
        ease: 'power2.out',
        onUpdate: () => {
          if (u.distort) u.distort.value = proxy.distort
          if (u.surfaceDistort) u.surfaceDistort.value = proxy.surfaceDistort
          if (u.twist) u.twist.value = proxy.twist
        },
        onComplete: () => {
          this._pulseTween = gsap.to(proxy, {
            distort: baseDistort,
            surfaceDistort: baseSurface,
            twist: baseTwist,
            duration: 0.8,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (u.distort) u.distort.value = proxy.distort
              if (u.surfaceDistort) u.surfaceDistort.value = proxy.surfaceDistort
              if (u.twist) u.twist.value = proxy.twist
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
