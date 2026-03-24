// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ ORB PRESETS
// Keyed by quality name. Drama increases as you go down.
// Each preset is a distinct blobmixer-inspired character.

const ORB_PRESETS = {

  excellent: {
    distort: 0.03, frequency: 3.0, surfaceDistort: 0.01, surfaceFrequency: 1.5,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    roughness: 0, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 5, transmission: 0.6, ior: 2.0,
  },

  very_good: {
    distort: 0.08, frequency: 2.5, surfaceDistort: 0.02, surfaceFrequency: 1.0,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 1.5,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.0, transmission: 0.15,
  },

  good: {
    distort: 0.15, frequency: 2.0, surfaceDistort: 0.04, surfaceFrequency: 0.8,
    speed: 0.003, surfaceSpeed: 0.002, numberOfWaves: 3.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    roughness: 0.3, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.2,
    envMapIntensity: 4.5, transmission: 0.1,
  },

  moderate: {
    distort: 0.2, frequency: 2.0, surfaceDistort: 0.05, surfaceFrequency: 0.6,
    speed: 0.003, surfaceSpeed: 0.002, numberOfWaves: 2.5,
    surfacePoleAmount: 0.7, gooPoleAmount: 1,
    roughness: 0.15, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.5, transmission: 0,
  },

  fair: {
    distort: 0.3, frequency: 1.5, surfaceDistort: 0.07, surfaceFrequency: 0.5,
    speed: 0.004, surfaceSpeed: 0.003, numberOfWaves: 4.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    roughness: 0.25, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.3,
    envMapIntensity: 4.0, transmission: 0.5,
  },

  restless: {
    distort: 0.4, frequency: 1.2, surfaceDistort: 0.1, surfaceFrequency: 0.4,
    speed: 0.005, surfaceSpeed: 0.003, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    roughness: 0.31, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.3,
    envMapIntensity: 2.5, transmission: 0,
  },

  poor: {
    distort: 0.5, frequency: 0.7, surfaceDistort: 0.15, surfaceFrequency: 0.3,
    speed: 0.008, surfaceSpeed: 0.004, numberOfWaves: 3.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    roughness: 0.2, metalness: 0.88, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 3.0, transmission: 0,
  },

  very_poor: {
    distort: 0.7, frequency: 0.4, surfaceDistort: 0.3, surfaceFrequency: 0.2,
    speed: 0.01, surfaceSpeed: 0.008, numberOfWaves: 6.0,
    surfacePoleAmount: 0.5, gooPoleAmount: 0.3,
    roughness: 0.6, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.0, transmission: 0,
  },

  disrupted: {
    distort: 0.9, frequency: 0.3, surfaceDistort: 0.5, surfaceFrequency: 0.15,
    speed: 0.012, surfaceSpeed: 0.015, numberOfWaves: 8.0,
    surfacePoleAmount: 0, gooPoleAmount: 0,
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

    console.log(`[OrbManager] Quality: ${quality} → distort: ${preset.distort}, speed: ${preset.speed}`)

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
