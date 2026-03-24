// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ ORB PRESETS
// Keyed by quality name. Drama + twist increase as you go down.

const ORB_PRESETS = {

  excellent: {
    distort: 0.03, frequency: 3.0, surfaceDistort: 0.01, surfaceFrequency: 1.5,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0, twistFrequency: 1.0,
    roughness: 0, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 5, transmission: 0.6, ior: 2.0,
  },

  very_good: {
    distort: 0.08, frequency: 2.5, surfaceDistort: 0.02, surfaceFrequency: 1.0,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 1.5,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0.05, twistFrequency: 0.8,
    roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.0, transmission: 0.15,
  },

  good: {
    distort: 0.2, frequency: 1.8, surfaceDistort: 0.06, surfaceFrequency: 0.7,
    speed: 0.004, surfaceSpeed: 0.003, numberOfWaves: 3.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0.12, twistFrequency: 0.7,
    roughness: 0.2, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.2,
    envMapIntensity: 4.0, transmission: 0.1,
  },

  moderate: {
    distort: 0.25, frequency: 1.5, surfaceDistort: 0.08, surfaceFrequency: 0.5,
    speed: 0.004, surfaceSpeed: 0.003, numberOfWaves: 3.5,
    surfacePoleAmount: 0.8, gooPoleAmount: 1,
    twist: 0.2, twistFrequency: 0.6,
    roughness: 0.15, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.5, transmission: 0,
  },

  fair: {
    distort: 0.35, frequency: 1.2, surfaceDistort: 0.1, surfaceFrequency: 0.4,
    speed: 0.005, surfaceSpeed: 0.004, numberOfWaves: 4.5,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0.3, twistFrequency: 0.5,
    roughness: 0.25, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.3,
    envMapIntensity: 4.0, transmission: 0.3,
  },

  restless: {
    distort: 0.45, frequency: 0.9, surfaceDistort: 0.15, surfaceFrequency: 0.35,
    speed: 0.007, surfaceSpeed: 0.005, numberOfWaves: 3.0,
    surfacePoleAmount: 0.8, gooPoleAmount: 0.8,
    twist: 0.45, twistFrequency: 0.5,
    roughness: 0.3, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.3,
    envMapIntensity: 2.5, transmission: 0,
  },

  poor: {
    distort: 0.55, frequency: 0.6, surfaceDistort: 0.2, surfaceFrequency: 0.3,
    speed: 0.009, surfaceSpeed: 0.006, numberOfWaves: 4.0,
    surfacePoleAmount: 0.6, gooPoleAmount: 0.6,
    twist: 0.6, twistFrequency: 0.4,
    roughness: 0.2, metalness: 0.88, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 3.0, transmission: 0,
  },

  very_poor: {
    distort: 0.75, frequency: 0.4, surfaceDistort: 0.35, surfaceFrequency: 0.2,
    speed: 0.011, surfaceSpeed: 0.009, numberOfWaves: 6.0,
    surfacePoleAmount: 0.3, gooPoleAmount: 0.3,
    twist: 0.8, twistFrequency: 0.35,
    roughness: 0.6, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.0, transmission: 0,
  },

  disrupted: {
    distort: 0.9, frequency: 0.3, surfaceDistort: 0.5, surfaceFrequency: 0.15,
    speed: 0.014, surfaceSpeed: 0.015, numberOfWaves: 8.0,
    surfacePoleAmount: 0, gooPoleAmount: 0,
    twist: 1.2, twistFrequency: 0.3,
    roughness: 0.7, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.0, transmission: 0,
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

  _calculateConfig(record) {
    const { quality } = record
    const preset = ORB_PRESETS[quality] || ORB_PRESETS.fair

    console.log(`[OrbManager] Quality: ${quality} → distort: ${preset.distort}, twist: ${preset.twist}, speed: ${preset.speed}`)

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
