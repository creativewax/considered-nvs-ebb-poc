// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ ORB PRESETS
// Each preset has unique displacement, colour, and tendril config.
// Tendrils are metallic structures growing from the sphere surface.

const ORB_PRESETS = {

  excellent: {
    distort: 0.06, frequency: 3.0, surfaceDistort: 0.02, surfaceFrequency: 1.5,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1, twist: 0, twistFrequency: 1.0,
    roughness: 0, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 5, transmission: 0.5, ior: 2.0,
    color: '#88DDC0',
    tendrilCount: 20, tendrilLength: 0.15, tendrilThickness: 0.006,
  },

  very_good: {
    distort: 0.15, frequency: 2.2, surfaceDistort: 0.04, surfaceFrequency: 0.9,
    speed: 0.003, surfaceSpeed: 0.002, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1, twist: 0.1, twistFrequency: 0.7,
    roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.5, transmission: 0.2,
    color: '#3DAA7A',
    tendrilCount: 30, tendrilLength: 0.2, tendrilThickness: 0.007,
  },

  good: {
    distort: 0.3, frequency: 1.8, surfaceDistort: 0.08, surfaceFrequency: 0.7,
    speed: 0.004, surfaceSpeed: 0.003, numberOfWaves: 3.5,
    surfacePoleAmount: 1, gooPoleAmount: 1, twist: 0.2, twistFrequency: 0.6,
    roughness: 0.15, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.15,
    envMapIntensity: 4.0, transmission: 0.1,
    color: '#44AEC6',
    tendrilCount: 40, tendrilLength: 0.25, tendrilThickness: 0.008,
  },

  moderate: {
    distort: 0.4, frequency: 1.5, surfaceDistort: 0.12, surfaceFrequency: 0.5,
    speed: 0.005, surfaceSpeed: 0.003, numberOfWaves: 4.0,
    surfacePoleAmount: 0.8, gooPoleAmount: 1, twist: 0.3, twistFrequency: 0.55,
    roughness: 0.12, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.5, transmission: 0,
    color: '#7BAFAA',
    tendrilCount: 50, tendrilLength: 0.3, tendrilThickness: 0.009,
  },

  fair: {
    distort: 0.55, frequency: 1.2, surfaceDistort: 0.15, surfaceFrequency: 0.4,
    speed: 0.006, surfaceSpeed: 0.004, numberOfWaves: 5.0,
    surfacePoleAmount: 0.8, gooPoleAmount: 0.8, twist: 0.4, twistFrequency: 0.5,
    roughness: 0.2, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.25,
    envMapIntensity: 3.5, transmission: 0.2,
    color: '#D4A84B',
    tendrilCount: 60, tendrilLength: 0.35, tendrilThickness: 0.01,
  },

  restless: {
    distort: 0.65, frequency: 0.9, surfaceDistort: 0.2, surfaceFrequency: 0.35,
    speed: 0.008, surfaceSpeed: 0.006, numberOfWaves: 3.5,
    surfacePoleAmount: 0.6, gooPoleAmount: 0.7, twist: 0.5, twistFrequency: 0.45,
    roughness: 0.25, metalness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.3,
    envMapIntensity: 2.5, transmission: 0,
    color: '#E8834A',
    tendrilCount: 75, tendrilLength: 0.4, tendrilThickness: 0.01,
  },

  poor: {
    distort: 0.7, frequency: 0.6, surfaceDistort: 0.25, surfaceFrequency: 0.3,
    speed: 0.009, surfaceSpeed: 0.007, numberOfWaves: 5.0,
    surfacePoleAmount: 0.5, gooPoleAmount: 0.5, twist: 0.6, twistFrequency: 0.4,
    roughness: 0.2, metalness: 0.7, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 3.0, transmission: 0,
    color: '#C23A52',
    tendrilCount: 90, tendrilLength: 0.45, tendrilThickness: 0.011,
  },

  very_poor: {
    distort: 0.75, frequency: 0.45, surfaceDistort: 0.3, surfaceFrequency: 0.25,
    speed: 0.01, surfaceSpeed: 0.008, numberOfWaves: 6.0,
    surfacePoleAmount: 0.3, gooPoleAmount: 0.3, twist: 0.7, twistFrequency: 0.35,
    roughness: 0.4, metalness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.5, transmission: 0,
    color: '#8B2252',
    tendrilCount: 100, tendrilLength: 0.5, tendrilThickness: 0.012,
  },

  disrupted: {
    distort: 0.75, frequency: 0.4, surfaceDistort: 0.35, surfaceFrequency: 0.2,
    speed: 0.012, surfaceSpeed: 0.01, numberOfWaves: 7.0,
    surfacePoleAmount: 0.2, gooPoleAmount: 0.2, twist: 0.8, twistFrequency: 0.35,
    roughness: 0.5, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.5, transmission: 0,
    color: '#5C2D91',
    tendrilCount: 120, tendrilLength: 0.6, tendrilThickness: 0.012,
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
    return {
      ...preset,
      quality,
      colours: QUALITY_COLOURS[quality],
    }
  }
}

export const orbManager = new OrbManager()

if (import.meta.hot) {
  import.meta.hot.dispose(() => orbManager._cleanupEvents())
  import.meta.hot.accept()
}
