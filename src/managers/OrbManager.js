// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------ ORB PRESETS
// Each preset has:
// - Distinct distort/twist values (BOOSTED — old values were too compressed by pow())
// - Unique material colour matching the design palette
// - Tendril config for the outer wispy mesh

const ORB_PRESETS = {

  // ── EXCELLENT: pristine glass sphere, light teal ──
  excellent: {
    distort: 0.06, frequency: 3.0, surfaceDistort: 0.02, surfaceFrequency: 1.5,
    speed: 0.002, surfaceSpeed: 0.001, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0, twistFrequency: 1.0,
    roughness: 0, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 5, transmission: 0.5, ior: 2.0,
    color: '#88DDC0',
    tendrilDistort: 0.1, tendrilOpacity: 0.06,
  },

  // ── VERY GOOD: smooth, subtle glow, soft green ──
  very_good: {
    distort: 0.15, frequency: 2.2, surfaceDistort: 0.04, surfaceFrequency: 0.9,
    speed: 0.003, surfaceSpeed: 0.002, numberOfWaves: 2.0,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0.1, twistFrequency: 0.7,
    roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.5, transmission: 0.2,
    color: '#3DAA7A',
    tendrilDistort: 0.2, tendrilOpacity: 0.08,
  },

  // ── GOOD: gentle undulations, green-teal ──
  good: {
    distort: 0.3, frequency: 1.8, surfaceDistort: 0.08, surfaceFrequency: 0.7,
    speed: 0.004, surfaceSpeed: 0.003, numberOfWaves: 3.5,
    surfacePoleAmount: 1, gooPoleAmount: 1,
    twist: 0.2, twistFrequency: 0.6,
    roughness: 0.15, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.15,
    envMapIntensity: 4.0, transmission: 0.1,
    color: '#44AEC6',
    tendrilDistort: 0.35, tendrilOpacity: 0.1,
  },

  // ── MODERATE: flowing waves, warm teal ──
  moderate: {
    distort: 0.4, frequency: 1.5, surfaceDistort: 0.12, surfaceFrequency: 0.5,
    speed: 0.005, surfaceSpeed: 0.003, numberOfWaves: 4.0,
    surfacePoleAmount: 0.8, gooPoleAmount: 1,
    twist: 0.3, twistFrequency: 0.55,
    roughness: 0.12, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1,
    envMapIntensity: 3.5, transmission: 0,
    color: '#7BAFAA',
    tendrilDistort: 0.5, tendrilOpacity: 0.12,
  },

  // ── FAIR: noticeable distortion, amber ──
  fair: {
    distort: 0.55, frequency: 1.2, surfaceDistort: 0.15, surfaceFrequency: 0.4,
    speed: 0.006, surfaceSpeed: 0.004, numberOfWaves: 5.0,
    surfacePoleAmount: 0.8, gooPoleAmount: 0.8,
    twist: 0.4, twistFrequency: 0.5,
    roughness: 0.2, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.25,
    envMapIntensity: 3.5, transmission: 0.2,
    color: '#D4A84B',
    tendrilDistort: 0.65, tendrilOpacity: 0.15,
  },

  // ── RESTLESS: blobby, twisting, warm orange ──
  restless: {
    distort: 0.7, frequency: 0.9, surfaceDistort: 0.2, surfaceFrequency: 0.35,
    speed: 0.008, surfaceSpeed: 0.006, numberOfWaves: 3.5,
    surfacePoleAmount: 0.6, gooPoleAmount: 0.7,
    twist: 0.6, twistFrequency: 0.45,
    roughness: 0.25, metalness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.3,
    envMapIntensity: 2.5, transmission: 0,
    color: '#E8834A',
    tendrilDistort: 0.8, tendrilOpacity: 0.18,
  },

  // ── POOR: heavy metallic distortion, deep orange-red ──
  poor: {
    distort: 0.85, frequency: 0.6, surfaceDistort: 0.3, surfaceFrequency: 0.3,
    speed: 0.01, surfaceSpeed: 0.007, numberOfWaves: 5.0,
    surfacePoleAmount: 0.5, gooPoleAmount: 0.5,
    twist: 0.8, twistFrequency: 0.4,
    roughness: 0.2, metalness: 0.7, clearcoat: 1, clearcoatRoughness: 0,
    envMapIntensity: 3.0, transmission: 0,
    color: '#D0566C',
    tendrilDistort: 1.0, tendrilOpacity: 0.22,
  },

  // ── VERY POOR: extreme spiky chaos, deep red-purple ──
  very_poor: {
    distort: 1.0, frequency: 0.4, surfaceDistort: 0.4, surfaceFrequency: 0.2,
    speed: 0.012, surfaceSpeed: 0.01, numberOfWaves: 7.0,
    surfacePoleAmount: 0.3, gooPoleAmount: 0.3,
    twist: 1.0, twistFrequency: 0.35,
    roughness: 0.5, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.0, transmission: 0,
    color: '#993355',
    tendrilDistort: 1.2, tendrilOpacity: 0.25,
  },

  // ── DISRUPTED: maximum chaos, deep purple ──
  disrupted: {
    distort: 1.2, frequency: 0.3, surfaceDistort: 0.5, surfaceFrequency: 0.15,
    speed: 0.015, surfaceSpeed: 0.015, numberOfWaves: 10.0,
    surfacePoleAmount: 0, gooPoleAmount: 0,
    twist: 1.5, twistFrequency: 0.3,
    roughness: 0.6, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.1,
    envMapIntensity: 2.0, transmission: 0,
    color: '#6B3FA0',
    tendrilDistort: 1.5, tendrilOpacity: 0.3,
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

    console.log(`[OrbManager] Quality: ${quality} → distort: ${preset.distort}, twist: ${preset.twist}, color: ${preset.color}`)

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
