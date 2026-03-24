// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ BLOBMIXER PRESETS
// Ordered from most chaotic (worst sleep) to most serene (best sleep).
// Each has a completely distinct visual character.

const BLOBMIXER_PRESETS = {
  // ── 0-7: "Discobrain" — frantic surface chaos, spiky, distressed ──
  discobrain: {
    name: 'Discobrain',
    label: 'Severely Disrupted',
    distort:           0,
    frequency:         0.06,
    surfaceDistort:    0.155,
    surfaceFrequency:  0.17,
    speed:             0.005,
    surfaceSpeed:      0.004,
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0,
    metalness:         0,
    clearcoat:         1,
    clearcoatRoughness: 0.14,
    envMapIntensity:   3.0,
    transmission:      0,
  },

  // ── 8-15: "Lipsync" — extreme spiky ridges, dark, agitated ──
  lipsync: {
    name: 'Lipsync',
    label: 'Very Poor',
    distort:           0.21,
    frequency:         0.26,
    surfaceDistort:    0.5,
    surfaceFrequency:  2.35,
    speed:             0.005,
    surfaceSpeed:      0.015,
    numberOfWaves:     0.07,
    surfacePoleAmount: 0,
    gooPoleAmount:     0,
    roughness:         0.86,
    metalness:         0.28,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   2.5,
    transmission:      0,
  },

  // ── 16-25: "Firefly" — rough, fast movement, no clearcoat ──
  firefly: {
    name: 'Firefly',
    label: 'Poor',
    distort:           0.26,
    frequency:         0.49,
    surfaceDistort:    0.12,
    surfaceFrequency:  0.11,
    speed:             0.01,
    surfaceSpeed:      0.007,
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     0,
    roughness:         1,
    metalness:         0,
    clearcoat:         0,
    clearcoatRoughness: 0,
    envMapIntensity:   1.5,
    transmission:      0,
  },

  // ── 26-35: "T-1000" — metallic, blobby, liquid metal ──
  t1000: {
    name: 'T-1000',
    label: 'Below Average',
    distort:           0.63,
    frequency:         0.92,
    surfaceDistort:    0.09,
    surfaceFrequency:  0.3,
    speed:             0.008,
    surfaceSpeed:      0.002,
    numberOfWaves:     2.71,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.27,
    metalness:         0.88,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   3.0,
    transmission:      0,
  },

  // ── 36-45: "Slimebag" — blobby, organic, rolling ──
  slimebag: {
    name: 'Slimebag',
    label: 'Restless',
    distort:           0.52,
    frequency:         1.52,
    surfaceDistort:    0.15,
    surfaceFrequency:  0.38,
    speed:             0.004,
    surfaceSpeed:      0.003,
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.31,
    metalness:         0.1,
    clearcoat:         0,
    clearcoatRoughness: 0,
    envMapIntensity:   2.5,
    ior:               2.33,
    transmission:      0,
  },

  // ── 46-55: "Ghost" — flowing, translucent, wave ridges ──
  ghost: {
    name: 'Ghost',
    label: 'Fair',
    distort:           0.7,
    frequency:         0.58,
    surfaceDistort:    0.072,
    surfaceFrequency:  0.22,
    speed:             0.004,
    surfaceSpeed:      0.0034,
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

  // ── 56-65: "Molten" — warm metallic, subtle waves ──
  molten: {
    name: 'Molten',
    label: 'Moderate',
    distort:           0,
    frequency:         2.11,
    surfaceDistort:    0.075,
    surfaceFrequency:  0.26,
    speed:             0.003,
    surfaceSpeed:      0.001,
    numberOfWaves:     2.2,
    surfacePoleAmount: 0,
    gooPoleAmount:     1,
    roughness:         0.2,
    metalness:         0.8,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   3.0,
    transmission:      0,
  },

  // ── 66-75: "Silkworm" — soft organic, silky ──
  silkworm: {
    name: 'Silkworm',
    label: 'Good',
    distort:           0.5,
    frequency:         2.01,
    surfaceDistort:    0.057,
    surfaceFrequency:  0.52,
    speed:             0.003,
    surfaceSpeed:      0.0024,
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

  // ── 76-85: "Blackhole" — smooth, elegant, minimal distortion ──
  blackhole: {
    name: 'Blackhole',
    label: 'Very Good',
    distort:           0.1,
    frequency:         0.23,
    surfaceDistort:    0.02,
    surfaceFrequency:  0.28,
    speed:             0.003,
    surfaceSpeed:      0.002,
    numberOfWaves:     1,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.2,
    metalness:         0,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   2.0,
    transmission:      0,
  },

  // ── 86-100: "Freshwater" — pristine glass sphere ──
  freshwater: {
    name: 'Freshwater',
    label: 'Excellent',
    distort:           0.05,
    frequency:         0.03,
    surfaceDistort:    0.087,
    surfaceFrequency:  0.91,
    speed:             0.005,
    surfaceSpeed:      0.003,
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
}

// Score ranges — chaotic at bottom, serene at top
const SCORE_RANGES = [
  { min: 86, preset: 'freshwater' },
  { min: 76, preset: 'blackhole' },
  { min: 66, preset: 'silkworm' },
  { min: 56, preset: 'molten' },
  { min: 46, preset: 'ghost' },
  { min: 36, preset: 'slimebag' },
  { min: 26, preset: 't1000' },
  { min: 16, preset: 'firefly' },
  { min: 8,  preset: 'lipsync' },
  { min: 0,  preset: 'discobrain' },
]

// ------------------------------------------------------------ INTERPOLATION

function lerp(a, b, t) {
  return a + (b - a) * t
}

function getPresetForScore(score) {
  const clamped = Math.max(0, Math.min(100, score))

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

  if (!nextRange) return { ...current }

  const next = BLOBMIXER_PRESETS[nextRange.preset]
  const rangeSize = nextRange.min - currentRange.min
  const t = rangeSize > 0 ? (clamped - currentRange.min) / rangeSize : 0

  const result = { name: current.name, label: current.label }
  const keys = new Set([...Object.keys(current), ...Object.keys(next)])
  for (const key of keys) {
    if (key === 'name' || key === 'label') continue
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

    console.log(`[OrbManager] Score: ${score} → ${preset.name} (${preset.label})`)

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
