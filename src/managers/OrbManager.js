// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ BLOBMIXER PRESETS
// Extracted from blobmixer source (store.js). Each has a unique character.
// Values converted to our shader scale:
//   blobmixer speed ÷ 200 → our speed
//   blobmixer surfaceDistort ÷ 20 → our surfaceDistort
//   blobmixer surfaceFrequency × 0.6 → our surfaceFrequency
//   blobmixer frequency stays same (already 0-3 range in our shader)

const BLOBMIXER_PRESETS = {
  // ── Score 95-100: "Freshwater" — pristine glass sphere, barely deformed ──
  freshwater: {
    name: 'Freshwater',
    distort:           0.05,
    frequency:         0.03,
    surfaceDistort:    0.087,   // 1.73 ÷ 20
    surfaceFrequency:  0.91,    // 1.51 × 0.6
    speed:             0.015,   // 3 ÷ 200
    surfaceSpeed:      0.0033,  // 0.66 ÷ 200
    numberOfWaves:     2.14,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0,
    metalness:         0.5,
    clearcoat:         0,
    clearcoatRoughness: 0,
    envMapIntensity:   5,
    transmission:      1,
    ior:               2.33,
  },

  // ── Score 85-94: "Blackhole" — smooth, dark elegance, subtle wobble ──
  blackhole: {
    name: 'Blackhole',
    distort:           0.1,
    frequency:         0.23,
    surfaceDistort:    0,
    surfaceFrequency:  0.28,    // 0.46 × 0.6
    speed:             0.0028,  // 0.56 ÷ 200
    surfaceSpeed:      0.0017,  // 0.34 ÷ 200
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.2,
    metalness:         0,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   0.18,
    transmission:      0,
  },

  // ── Score 70-84: "Silkworm" — soft organic deformation, silky surface ──
  silkworm: {
    name: 'Silkworm',
    distort:           0.5,
    frequency:         2.01,
    surfaceDistort:    0.057,   // 1.13 ÷ 20
    surfaceFrequency:  0.52,    // 0.86 × 0.6
    speed:             0.0,
    surfaceSpeed:      0.0024,  // 0.48 ÷ 200
    numberOfWaves:     3.09,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.42,
    metalness:         0,
    clearcoat:         0,
    clearcoatRoughness: 0,
    envMapIntensity:   4.62,
    reflectivity:      0.53,
    transmission:      0,
  },

  // ── Score 55-69: "Ghost" — flowing, translucent, wave ridges ──
  ghost: {
    name: 'Ghost',
    distort:           0.7,
    frequency:         0.58,
    surfaceDistort:    0.072,   // 1.43 ÷ 20
    surfaceFrequency:  0.22,    // 0.36 × 0.6
    speed:             0.0,
    surfaceSpeed:      0.0034,  // 0.68 ÷ 200
    numberOfWaves:     5.5,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.31,
    metalness:         0.28,
    clearcoat:         1,
    clearcoatRoughness: 0.26,
    envMapIntensity:   5,
    transmission:      1,
  },

  // ── Score 40-54: "Slimebag" — blobby organic, rolling surface ──
  slimebag: {
    name: 'Slimebag',
    distort:           0.52,
    frequency:         1.52,
    surfaceDistort:    0.15,    // 3 ÷ 20
    surfaceFrequency:  0.38,    // 0.64 × 0.6
    speed:             0.0017,  // 0.33 ÷ 200
    surfaceSpeed:      0.0017,
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.31,
    metalness:         0.1,
    clearcoat:         0,
    clearcoatRoughness: 0,
    envMapIntensity:   0.95,
    ior:               2.33,
    transmission:      0,
  },

  // ── Score 25-39: "Firefly" — agitated, rough, fast surface ──
  firefly: {
    name: 'Firefly',
    distort:           0.26,
    frequency:         0.49,
    surfaceDistort:    0.12,    // 2.4 ÷ 20
    surfaceFrequency:  0.11,    // 0.19 × 0.6
    speed:             0.0098,  // 1.95 ÷ 200
    surfaceSpeed:      0.0074,  // 1.47 ÷ 200
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     0,       // No pole attenuation = more distortion at poles
    roughness:         1,
    metalness:         0,
    clearcoat:         0,
    clearcoatRoughness: 0,
    envMapIntensity:   0,
    transmission:      0,
  },

  // ── Score 10-24: "Rosebud" — extreme surface waves, organic chaos ──
  rosebud: {
    name: 'Rosebud',
    distort:           0.38,
    frequency:         0.09,
    surfaceDistort:    0.2,     // 3.97 ÷ 20
    surfaceFrequency:  0.31,    // 0.51 × 0.6
    speed:             0.005,   // 1 ÷ 200
    surfaceSpeed:      0.0005,  // 0.1 ÷ 200
    numberOfWaves:     6.13,
    surfacePoleAmount: 0.51,
    gooPoleAmount:     0.45,
    roughness:         1,
    metalness:         0,
    clearcoat:         0,
    clearcoatRoughness: 0.14,
    envMapIntensity:   0,
    transmission:      0,
  },

  // ── Score 0-9: "Devour" — extreme surface chaos, dark, distressed ──
  devour: {
    name: 'Devour',
    distort:           0,
    frequency:         1.19,
    surfaceDistort:    0.5,     // 10 ÷ 20
    surfaceFrequency:  0.11,    // 0.19 × 0.6
    speed:             0.0015,  // 0.29 ÷ 200
    surfaceSpeed:      0.01,    // 1.99 ÷ 200
    numberOfWaves:     0.07,
    surfacePoleAmount: 0,
    gooPoleAmount:     1,
    roughness:         0.86,
    metalness:         0.28,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   0.87,
    transmission:      0,
  },
}

// Score ranges → preset mapping
const SCORE_RANGES = [
  { min: 95,  preset: 'freshwater' },
  { min: 85,  preset: 'blackhole' },
  { min: 70,  preset: 'silkworm' },
  { min: 55,  preset: 'ghost' },
  { min: 40,  preset: 'slimebag' },
  { min: 25,  preset: 'firefly' },
  { min: 10,  preset: 'rosebud' },
  { min: 0,   preset: 'devour' },
]

// ------------------------------------------------------------ INTERPOLATION

function lerp(a, b, t) {
  return a + (b - a) * t
}

function getPresetForScore(score) {
  const clamped = Math.max(0, Math.min(100, score))

  // Find the range we're in and the next range up
  let currentRange = SCORE_RANGES[SCORE_RANGES.length - 1]
  let nextRange = null

  for (let i = 0; i < SCORE_RANGES.length; i++) {
    if (clamped >= SCORE_RANGES[i].min) {
      currentRange = SCORE_RANGES[i]
      nextRange = i > 0 ? SCORE_RANGES[i - 1] : null
      break
    }
  }

  const current = BLOBMIXER_PRESETS[currentRange.preset]

  // If at the top of the range or no next range, use preset directly
  if (!nextRange) return { ...current }

  // Interpolate between current and next preset based on position within range
  const next = BLOBMIXER_PRESETS[nextRange.preset]
  const rangeSize = nextRange.min - currentRange.min
  const t = rangeSize > 0 ? (clamped - currentRange.min) / rangeSize : 0

  const result = { name: current.name }
  const keys = new Set([...Object.keys(current), ...Object.keys(next)])
  for (const key of keys) {
    if (key === 'name') continue
    const a = current[key] ?? 0
    const b = next[key] ?? a
    result[key] = lerp(a, b, t)
  }

  return result
}

// ------------------------------------------------------------ ORB MANAGER

class OrbManager extends BaseManager {
  constructor() {
    super()
    this._state = { config: null }

    this._onEvent(EVENTS.SLEEP_RECORD_SELECTED, (record) => {
      if (record) {
        const config = this._calculateConfig(record)
        this._setState({ config })
        this._emit(EVENTS.ORB_CONFIG_UPDATED, config)
      }
    })
  }

  _calculateConfig(record) {
    const { score, quality } = record
    const preset = getPresetForScore(score)

    console.log(`[OrbManager] Score: ${score} → Preset: ${preset.name}`)

    return {
      ...preset,
      quality,
      colours: QUALITY_COLOURS[quality],
    }
  }
}

export const orbManager = new OrbManager()

// ------------------------------------------------------------ HMR

if (import.meta.hot) {
  import.meta.hot.dispose(() => orbManager._cleanupEvents())
  import.meta.hot.accept()
}
