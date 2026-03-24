// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ ORB PRESETS
// Each quality has a UNIQUE CHARACTER — not just "more chaos".
// Inspired by blobmixer's approach: distinct combinations of
// goo distortion, surface waves, wave count, and material properties
// create totally different visual personalities.

const ORB_PRESETS = {
  // ── EXCELLENT: near-perfect sphere, glass-like, serene ──
  // Barely deformed. You can still see it's a sphere. Crystal ball feel.
  excellent: {
    distort:           0.06,
    frequency:         3.0,
    surfaceDistort:    0.01,
    surfaceFrequency:  4.0,
    speed:             0.002,
    surfaceSpeed:      0.001,
    numberOfWaves:     3.0,
    roughness:         0.05,
    clearcoat:         1.0,
    clearcoatRoughness: 0.15,
    envMapIntensity:   1.8,
    transmission:      0.3,
  },

  // ── GOOD: gentle organic undulations ──
  // Clearly a sphere with soft organic bumps. Calm, flowing.
  good: {
    distort:           0.18,
    frequency:         2.2,
    surfaceDistort:    0.05,
    surfaceFrequency:  3.0,
    speed:             0.003,
    surfaceSpeed:      0.002,
    numberOfWaves:     4.0,
    roughness:         0.1,
    clearcoat:         1.0,
    clearcoatRoughness: 0.4,
    envMapIntensity:   1.5,
    transmission:      0.1,
  },

  // ── FAIR: noticeable deformation, surface ridges ──
  // Still spherical but clearly disturbed. Wave ridges create texture.
  fair: {
    distort:           0.35,
    frequency:         1.8,
    surfaceDistort:    0.15,
    surfaceFrequency:  2.0,
    speed:             0.005,
    surfaceSpeed:      0.003,
    numberOfWaves:     7.0,
    roughness:         0.18,
    clearcoat:         0.85,
    clearcoatRoughness: 0.55,
    envMapIntensity:   1.2,
    transmission:      0,
  },

  // ── POOR: heavily distorted, agitated ──
  // Lost its spherical shape. Blobby bulges, spiky ridges, fast movement.
  poor: {
    distort:           0.6,
    frequency:         1.2,
    surfaceDistort:    0.3,
    surfaceFrequency:  1.5,
    speed:             0.008,
    surfaceSpeed:      0.005,
    numberOfWaves:     10.0,
    roughness:         0.28,
    clearcoat:         0.6,
    clearcoatRoughness: 0.8,
    envMapIntensity:   0.9,
    transmission:      0,
  },
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

  // ------------------------------------------------------------ CONFIG

  _calculateConfig(record) {
    const { quality } = record
    const preset = ORB_PRESETS[quality] || ORB_PRESETS.good

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
