// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ BLOBMIXER-DERIVED PRESETS
// These are based on REAL blobmixer presets from their source code.
// We pick 5 anchor points across the 0-100 score range and interpolate.
// Note: blobmixer uses different scales for some values. Key mappings:
//   blobmixer speed ~1.0 = our speed ~0.005 (they use higher tick rates)
//   blobmixer distort is already 0-1 range (same as ours)
//   blobmixer surfaceDistort 0-10 range = our 0-0.5 range (÷20)
//   blobmixer frequency 0-5 range = our 0-3 range (×0.6)

const SCORE_ANCHORS = [
  // Score 0-15: "Devour" inspired — extreme surface chaos, dark, agitated
  {
    score: 0,
    distort:           0.65,
    frequency:         0.7,     // Low = big blobby distortions
    surfaceDistort:    0.5,     // High surface waves
    surfaceFrequency:  0.12,    // Low freq = large rolling waves
    speed:             0.008,
    surfaceSpeed:      0.01,
    numberOfWaves:     0.5,     // Very few waves — big undulations
    surfacePoleAmount: 0,
    gooPoleAmount:     1,
    roughness:         0.35,
    metalness:         0.1,
    clearcoat:         0.5,
    clearcoatRoughness: 0.86,
    envMapIntensity:   0.9,
    transmission:      0,
  },

  // Score 25: "Slimebag" inspired — blobby, organic, chaotic surface
  {
    score: 25,
    distort:           0.52,
    frequency:         0.9,
    surfaceDistort:    0.15,
    surfaceFrequency:  0.4,
    speed:             0.005,
    surfaceSpeed:      0.005,
    numberOfWaves:     3.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.25,
    metalness:         0.05,
    clearcoat:         0.7,
    clearcoatRoughness: 0.7,
    envMapIntensity:   1.0,
    transmission:      0,
  },

  // Score 50: "Ghost" inspired — flowing, translucent, wave ridges
  {
    score: 50,
    distort:           0.35,
    frequency:         1.2,
    surfaceDistort:    0.07,
    surfaceFrequency:  0.8,
    speed:             0.004,
    surfaceSpeed:      0.003,
    numberOfWaves:     5.5,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.14,
    metalness:         0,
    clearcoat:         1.0,
    clearcoatRoughness: 0.5,
    envMapIntensity:   1.3,
    transmission:      0.15,
  },

  // Score 75: "Blackhole" inspired — smooth, subtle, elegant deformation
  {
    score: 75,
    distort:           0.15,
    frequency:         1.8,
    surfaceDistort:    0.03,
    surfaceFrequency:  1.5,
    speed:             0.003,
    surfaceSpeed:      0.002,
    numberOfWaves:     3.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.1,
    metalness:         0,
    clearcoat:         1.0,
    clearcoatRoughness: 0.3,
    envMapIntensity:   1.5,
    transmission:      0.1,
  },

  // Score 100: "Freshwater" inspired — near-perfect sphere, glass, pristine
  {
    score: 100,
    distort:           0.05,
    frequency:         3.0,
    surfaceDistort:    0.01,
    surfaceFrequency:  2.0,
    speed:             0.002,
    surfaceSpeed:      0.001,
    numberOfWaves:     2.0,
    surfacePoleAmount: 1,
    gooPoleAmount:     1,
    roughness:         0.02,
    metalness:         0,
    clearcoat:         1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity:   2.0,
    transmission:      0.4,
    ior:               1.5,
  },
]

// ------------------------------------------------------------ INTERPOLATION
// Smoothly blend between the two nearest anchor presets based on score

function lerp(a, b, t) {
  return a + (b - a) * t
}

function interpolatePresets(score) {
  const clamped = Math.max(0, Math.min(100, score))

  // Find the two anchors to interpolate between
  let lower = SCORE_ANCHORS[0]
  let upper = SCORE_ANCHORS[SCORE_ANCHORS.length - 1]

  for (let i = 0; i < SCORE_ANCHORS.length - 1; i++) {
    if (clamped >= SCORE_ANCHORS[i].score && clamped <= SCORE_ANCHORS[i + 1].score) {
      lower = SCORE_ANCHORS[i]
      upper = SCORE_ANCHORS[i + 1]
      break
    }
  }

  // How far between the two anchors (0-1)
  const range = upper.score - lower.score
  const t = range > 0 ? (clamped - lower.score) / range : 0

  // Interpolate every numeric property
  const result = {}
  const keys = new Set([...Object.keys(lower), ...Object.keys(upper)])
  for (const key of keys) {
    if (key === 'score') continue
    const a = lower[key] ?? 0
    const b = upper[key] ?? a
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

    // Interpolate between blobmixer-derived anchor presets based on exact score
    const preset = interpolatePresets(score)

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
