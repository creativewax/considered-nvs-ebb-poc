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
  // Barely deformed, high transmission, very smooth. Like a crystal ball.
  excellent: {
    distort:           0.08,
    frequency:         3.0,
    surfaceDistort:    0.02,
    surfaceFrequency:  4.0,
    speed:             0.002,
    surfaceSpeed:      0.001,
    numberOfWaves:     3.0,
    roughness:         0.05,
    clearcoat:         1.0,
    clearcoatRoughness: 0.2,
    envMapIntensity:   1.5,
    transmission:      0.4,
  },

  // ── GOOD: gentle organic undulations, flowing tendrils ──
  // Smooth flowing surface with graceful wave patterns. Calm and alive.
  good: {
    distort:           0.25,
    frequency:         2.0,
    surfaceDistort:    0.08,
    surfaceFrequency:  2.5,
    speed:             0.004,
    surfaceSpeed:      0.002,
    numberOfWaves:     5.0,
    roughness:         0.12,
    clearcoat:         1.0,
    clearcoatRoughness: 0.5,
    envMapIntensity:   1.2,
    transmission:      0.15,
  },

  // ── FAIR: visible deformation, some turbulence ──
  // Twisted surface with ridge-like waves. Unsettled but still coherent.
  fair: {
    distort:           0.5,
    frequency:         1.5,
    surfaceDistort:    0.25,
    surfaceFrequency:  1.8,
    speed:             0.006,
    surfaceSpeed:      0.004,
    numberOfWaves:     8.0,      // More wave ridges — creates unique texture
    roughness:         0.2,
    clearcoat:         0.8,
    clearcoatRoughness: 0.6,
    envMapIntensity:   1.0,
    transmission:      0,
  },

  // ── POOR: chaotic, heavily distorted, agitated ──
  // Extreme deformation, fast movement, spiky ridges. Visual distress.
  poor: {
    distort:           0.85,
    frequency:         1.0,      // Low frequency = large blobby bulges
    surfaceDistort:    0.45,
    surfaceFrequency:  1.2,
    speed:             0.01,
    surfaceSpeed:      0.007,
    numberOfWaves:     12.0,     // Many ridges — chaotic surface texture
    roughness:         0.35,
    clearcoat:         0.5,
    clearcoatRoughness: 0.9,
    envMapIntensity:   0.7,
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
