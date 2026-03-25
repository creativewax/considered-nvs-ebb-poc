// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ ORB PRESETS
// Based on the disrupted settings that work well.
// Ramped up/down across qualities — disrupted is the most extreme,
// excellent is the calmest. All share the same material approach:
// high clearcoat, some transmission, vivid material colour.

const ORB_PRESETS = {

  excellent: {
    distort: 0.15, frequency: 2.5, surfaceDistort: 0.15, surfaceFrequency: 1.5,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1, twist: 0, twistFrequency: 1.0,
    roughness: 0.05, metalness: 0.4, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.5, transmission: 0.95,
    color: '#78C8AA', lightKey: '#88DDC0', lightFill: '#44AEC6', lightRim: '#E8DCC8',
    tendrilCount: 8, tendrilLength: 0.08, tendrilThickness: 0.005,
  },

  very_good: {
    distort: 0.25, frequency: 2.0, surfaceDistort: 0.2, surfaceFrequency: 1.2,
    speed: 0.003, surfaceSpeed: 0.002, numberOfWaves: 2.5,
    surfacePoleAmount: 1, gooPoleAmount: 1, twist: 0.05, twistFrequency: 0.8,
    roughness: 0.08, metalness: 0.45, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.48, transmission: 0.9,
    color: '#3A9A6A', lightKey: '#3DAA7A', lightFill: '#88DDC0', lightRim: '#44AEC6',
    tendrilCount: 12, tendrilLength: 0.1, tendrilThickness: 0.005,
  },

  good: {
    distort: 0.35, frequency: 1.8, surfaceDistort: 0.3, surfaceFrequency: 0.9,
    speed: 0.004, surfaceSpeed: 0.003, numberOfWaves: 3.0,
    surfacePoleAmount: 0.9, gooPoleAmount: 0.9, twist: 0.1, twistFrequency: 0.7,
    roughness: 0.1, metalness: 0.48, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.46, transmission: 0.85,
    color: '#3898B0', lightKey: '#44AEC6', lightFill: '#3DAA7A', lightRim: '#7BAFAA',
    tendrilCount: 16, tendrilLength: 0.12, tendrilThickness: 0.006,
  },

  moderate: {
    distort: 0.4, frequency: 1.5, surfaceDistort: 0.35, surfaceFrequency: 0.7,
    speed: 0.005, surfaceSpeed: 0.004, numberOfWaves: 3.5,
    surfacePoleAmount: 0.8, gooPoleAmount: 0.8, twist: 0.2, twistFrequency: 0.6,
    roughness: 0.12, metalness: 0.5, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.44, transmission: 0.8,
    color: '#5A9A8A', lightKey: '#7BAFAA', lightFill: '#D4A84B', lightRim: '#44AEC6',
    tendrilCount: 20, tendrilLength: 0.15, tendrilThickness: 0.006,
  },

  fair: {
    distort: 0.48, frequency: 1.2, surfaceDistort: 0.4, surfaceFrequency: 0.5,
    speed: 0.006, surfaceSpeed: 0.005, numberOfWaves: 4.0,
    surfacePoleAmount: 0.7, gooPoleAmount: 0.7, twist: 0.3, twistFrequency: 0.55,
    roughness: 0.15, metalness: 0.52, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.42, transmission: 0.75,
    color: '#C89830', lightKey: '#D4A84B', lightFill: '#E8834A', lightRim: '#7BAFAA',
    tendrilCount: 25, tendrilLength: 0.18, tendrilThickness: 0.007,
  },

  restless: {
    distort: 0.55, frequency: 0.9, surfaceDistort: 0.5, surfaceFrequency: 0.4,
    speed: 0.008, surfaceSpeed: 0.006, numberOfWaves: 5.0,
    surfacePoleAmount: 0.6, gooPoleAmount: 0.6, twist: 0.4, twistFrequency: 0.5,
    roughness: 0.18, metalness: 0.55, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.4, transmission: 0.7,
    color: '#D06830', lightKey: '#E8834A', lightFill: '#D4A84B', lightRim: '#D0566C',
    tendrilCount: 30, tendrilLength: 0.2, tendrilThickness: 0.008,
  },

  poor: {
    distort: 0.62, frequency: 0.7, surfaceDistort: 0.58, surfaceFrequency: 0.3,
    speed: 0.009, surfaceSpeed: 0.007, numberOfWaves: 5.5,
    surfacePoleAmount: 0.5, gooPoleAmount: 0.5, twist: 0.5, twistFrequency: 0.45,
    roughness: 0.2, metalness: 0.55, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.38, transmission: 0.65,
    color: '#B83848', lightKey: '#D0566C', lightFill: '#E8834A', lightRim: '#6B3FA0',
    tendrilCount: 35, tendrilLength: 0.25, tendrilThickness: 0.008,
  },

  very_poor: {
    distort: 0.7, frequency: 0.55, surfaceDistort: 0.65, surfaceFrequency: 0.2,
    speed: 0.01, surfaceSpeed: 0.008, numberOfWaves: 6.0,
    surfacePoleAmount: 0.3, gooPoleAmount: 0.3, twist: 0.7, twistFrequency: 0.35,
    roughness: 0.25, metalness: 0.55, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.35, transmission: 0.6,
    color: '#982040', lightKey: '#8B2252', lightFill: '#D0566C', lightRim: '#6B3FA0',
    tendrilCount: 40, tendrilLength: 0.3, tendrilThickness: 0.009,
  },

  disrupted: {
    distort: 0.75, frequency: 0.5, surfaceDistort: 0.75, surfaceFrequency: 0.15,
    speed: 0.012, surfaceSpeed: 0.01, numberOfWaves: 7.0,
    surfacePoleAmount: 0.2, gooPoleAmount: 0.2, twist: 0.8, twistFrequency: 0.35,
    roughness: 0.25, metalness: 0.6, clearcoat: 0.95, clearcoatRoughness: 0.02,
    envMapIntensity: 0.35, transmission: 0.95,
    color: '#782888', lightKey: '#D0566C', lightFill: '#6B3FA0', lightRim: '#8B2252',
    tendrilCount: 50, tendrilLength: 0.35, tendrilThickness: 0.01,
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
