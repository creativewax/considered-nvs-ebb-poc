// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'

// ------------------------------------------------------------
// ORB MANAGER — maps sleep record metrics to Three.js orb config
// ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // CONFIG CALCULATION
  // ------------------------------------------------------------

  _calculateConfig(record) {
    const { score, quality, deepSleep, remSleep, sleepDuration, awakeTime, avgHeartRate, hrv } = record
    const totalStages = record.lightSleep + record.deepSleep + record.remSleep
    const deepPct = totalStages > 0 ? deepSleep / totalStages : 0
    const remPct  = totalStages > 0 ? remSleep  / totalStages : 0

    // 0 (worst) → 1 (best)
    const normalised = score / 100

    return {
      // Displacement — more chaotic as score drops
      distort:          0.05 + (1 - normalised) * 0.55,
      frequency:        1.5  + normalised * 1.5,
      surfaceDistort:   0.02 + (1 - normalised) * 0.28,
      speed:            0.002 + (1 - normalised) * 0.006,
      surfaceSpeed:     0.001 + (1 - normalised) * 0.004,

      // Material
      roughness:          0.1 + (1 - normalised) * 0.25,
      clearcoat:          0.6 + normalised * 0.4,
      clearcoatRoughness: 0.4 + (1 - normalised) * 0.5,
      envMapIntensity:    0.8 + normalised * 0.4,
      // Slight translucency only for good sleep scores
      transmission: normalised > 0.7 ? (normalised - 0.7) * 1.0 : 0,

      // Colour
      quality,
      colours: QUALITY_COLOURS[quality],

      // Scale — larger for longer sleep, target is 8h (480 min)
      scale: 0.8 + Math.min(sleepDuration / 480, 1) * 0.4,

      // Tendrils — more REM = more tendrils
      tendrilCount: Math.round(remPct * 30),
      tendrilChaos: 1 - normalised,

      // Pulse — derived from heart rate and HRV
      pulseRate:      avgHeartRate ? 60 / avgHeartRate : 1.0,
      movementSmooth: hrv ? Math.min(hrv / 60, 1) : 0.5,

      // CSU surface effect — updated when log entries are checked
      csuSeverity: 0,
    }
  }
}

export const orbManager = new OrbManager()

// ------------------------------------------------------------
// HMR
// ------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => orbManager._cleanupEvents())
  import.meta.hot.accept()
}
