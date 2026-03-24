// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ BLOBMIXER PRESETS
// Ordered from most chaotic (worst sleep) to most serene (best sleep).
// Each has a completely distinct visual character.

const BLOBMIXER_PRESETS = {
  // ── 0-7: "Severely Disrupted" — maximum chaos, every param cranked ──
  disrupted: {
    name: 'Disrupted',
    label: 'Severely Disrupted',
    distort:           0.9,     // Extreme goo deformation
    frequency:         0.3,     // Low freq = huge bulging lobes
    surfaceDistort:    0.5,     // Maximum surface waves
    surfaceFrequency:  0.15,    // Large rolling surface chaos
    speed:             0.012,   // Fast animation
    surfaceSpeed:      0.015,   // Fast surface movement
    numberOfWaves:     8.0,     // Many ridges
    surfacePoleAmount: 0,       // Full distortion at poles too
    gooPoleAmount:     0,
    roughness:         0.7,
    metalness:         0.2,
    clearcoat:         0.8,
    clearcoatRoughness: 0.1,
    envMapIntensity:   2.0,
    transmission:      0,
  },

  // ── 8-15: "Lipsync" — spiky ridges, extreme surface texture ──
  lipsync: {
    name: 'Lipsync',
    label: 'Very Poor',
    distort:           0.7,
    frequency:         0.26,
    surfaceDistort:    0.45,
    surfaceFrequency:  2.35,    // High freq = many fine spikes
    speed:             0.008,
    surfaceSpeed:      0.012,
    numberOfWaves:     6.0,
    surfacePoleAmount: 0,
    gooPoleAmount:     0.3,
    roughness:         0.6,
    metalness:         0.3,
    clearcoat:         1,
    clearcoatRoughness: 0.1,
    envMapIntensity:   2.5,
    transmission:      0,
  },

  // ── 16-25: "Firefly" — rough, agitated, fast, organic ──
  firefly: {
    name: 'Firefly',
    label: 'Poor',
    distort:           0.55,
    frequency:         0.49,
    surfaceDistort:    0.3,
    surfaceFrequency:  0.2,
    speed:             0.01,
    surfaceSpeed:      0.008,
    numberOfWaves:     4.0,
    surfacePoleAmount: 0.5,
    gooPoleAmount:     0,
    roughness:         0.8,
    metalness:         0,
    clearcoat:         0.3,
    clearcoatRoughness: 0.5,
    envMapIntensity:   1.5,
    transmission:      0,
  },

  // ── 26-35: "T-1000" — metallic blob, heavy distortion ──
  t1000: {
    name: 'T-1000',
    label: 'Below Average',
    distort:           0.5,
    frequency:         0.7,
    surfaceDistort:    0.15,
    surfaceFrequency:  0.3,
    speed:             0.008,
    surfaceSpeed:      0.004,
    numberOfWaves:     3.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.2,
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
    distort:           0.4,
    frequency:         1.2,
    surfaceDistort:    0.1,
    surfaceFrequency:  0.4,
    speed:             0.005,
    surfaceSpeed:      0.003,
    numberOfWaves:     2.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.31,
    metalness:         0.1,
    clearcoat:         0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity:   2.5,
    transmission:      0,
  },

  // ── 46-55: "Ghost" — translucent, flowing ridges ──
  ghost: {
    name: 'Ghost',
    label: 'Fair',
    distort:           0.3,
    frequency:         1.5,
    surfaceDistort:    0.07,
    surfaceFrequency:  0.5,
    speed:             0.004,
    surfaceSpeed:      0.003,
    numberOfWaves:     4.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.25,
    metalness:         0.15,
    clearcoat:         1,
    clearcoatRoughness: 0.3,
    envMapIntensity:   4.0,
    transmission:      0.5,
  },

  // ── 56-65: "Molten" — warm metallic, gentle waves ──
  molten: {
    name: 'Molten',
    label: 'Moderate',
    distort:           0.2,
    frequency:         2.0,
    surfaceDistort:    0.05,
    surfaceFrequency:  0.6,
    speed:             0.003,
    surfaceSpeed:      0.002,
    numberOfWaves:     2.5,
    surfacePoleAmount: 0.7,
    gooPoleAmount:     1,
    roughness:         0.15,
    metalness:         0.6,
    clearcoat:         1,
    clearcoatRoughness: 0.1,
    envMapIntensity:   3.5,
    transmission:      0,
  },

  // ── 66-75: "Silkworm" — soft organic, gentle undulations ──
  silkworm: {
    name: 'Silkworm',
    label: 'Good',
    distort:           0.15,
    frequency:         2.0,
    surfaceDistort:    0.04,
    surfaceFrequency:  0.8,
    speed:             0.003,
    surfaceSpeed:      0.002,
    numberOfWaves:     3.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.3,
    metalness:         0,
    clearcoat:         0.7,
    clearcoatRoughness: 0.2,
    envMapIntensity:   4.5,
    reflectivity:      0.5,
    transmission:      0.1,
  },

  // ── 76-85: "Blackhole" — smooth, elegant, minimal ──
  blackhole: {
    name: 'Blackhole',
    label: 'Very Good',
    distort:           0.08,
    frequency:         2.5,
    surfaceDistort:    0.02,
    surfaceFrequency:  1.0,
    speed:             0.002,
    surfaceSpeed:      0.001,
    numberOfWaves:     1.5,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.12,
    metalness:         0,
    clearcoat:         1,
    clearcoatRoughness: 0.1,
    envMapIntensity:   3.0,
    transmission:      0.15,
  },

  // ── 86-100: "Freshwater" — pristine glass sphere, serene ──
  freshwater: {
    name: 'Freshwater',
    label: 'Excellent',
    distort:           0.03,
    frequency:         3.0,
    surfaceDistort:    0.01,
    surfaceFrequency:  1.5,
    speed:             0.002,
    surfaceSpeed:      0.001,
    numberOfWaves:     2.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0,
    metalness:         0.3,
    clearcoat:         1,
    clearcoatRoughness: 0,
    envMapIntensity:   5,
    transmission:      0.6,
    ior:               2.0,
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
  { min: 0,  preset: 'disrupted' },
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
