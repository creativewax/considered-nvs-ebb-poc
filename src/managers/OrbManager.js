// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'
import { scoreToQuality } from '../constants/sleep.js'

// ------------------------------------------------------------ EASING
// Score 0-100 → eased 0-1 (0 = worst, 1 = best)

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerp(min, max, t) {
  return min + (max - min) * t
}

// ------------------------------------------------------------ PROPERTY RANGES
// [worst (score 0), best (score 100)]

const RANGES = {
  distort:            [0.75, 0.12],
  frequency:          [0.5, 2.5],
  surfaceDistort:     [0.75, 0.12],
  surfaceFrequency:   [0.15, 1.5],
  speed:              [0.012, 0.002],
  surfaceSpeed:       [0.01, 0.001],
  numberOfWaves:      [7.0, 2.0],
  surfacePoleAmount:  [0.2, 1.0],
  gooPoleAmount:      [0.2, 1.0],
  twist:              [0.8, 0.0],
  twistFrequency:     [0.35, 1.0],
  roughness:          [0.25, 0.05],
  metalness:          [0.6, 0.4],
  clearcoat:          [0.95, 0.95],
  clearcoatRoughness: [0.02, 0.02],
  envMapIntensity:    [0.35, 0.5],
  transmission:       [0.95, 0.95],
  tendrilCount:       [50, 8],
  tendrilLength:      [0.35, 0.08],
  tendrilThickness:   [0.01, 0.005],
}

// ------------------------------------------------------------ COLOUR STOPS
// Scored from worst → best. Interpolate between nearest two.

const COLOUR_STOPS = [
  { score: 0,   color: '#782888', lightKey: '#D0566C', lightFill: '#6B3FA0', lightRim: '#8B2252' },
  { score: 12,  color: '#982040', lightKey: '#8B2252', lightFill: '#D0566C', lightRim: '#6B3FA0' },
  { score: 25,  color: '#B83848', lightKey: '#D0566C', lightFill: '#E8834A', lightRim: '#6B3FA0' },
  { score: 40,  color: '#D06830', lightKey: '#E8834A', lightFill: '#D4A84B', lightRim: '#D0566C' },
  { score: 50,  color: '#C89830', lightKey: '#D4A84B', lightFill: '#E8834A', lightRim: '#7BAFAA' },
  { score: 60,  color: '#5A9A8A', lightKey: '#7BAFAA', lightFill: '#D4A84B', lightRim: '#44AEC6' },
  { score: 70,  color: '#3898B0', lightKey: '#44AEC6', lightFill: '#3DAA7A', lightRim: '#7BAFAA' },
  { score: 80,  color: '#3A9A6A', lightKey: '#3DAA7A', lightFill: '#88DDC0', lightRim: '#44AEC6' },
  { score: 90,  color: '#78C8AA', lightKey: '#88DDC0', lightFill: '#44AEC6', lightRim: '#E8DCC8' },
  { score: 100, color: '#78C8AA', lightKey: '#88DDC0', lightFill: '#44AEC6', lightRim: '#E8DCC8' },
]

// Interpolate hex colours
function lerpColor(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`
}

function getColoursForScore(score) {
  const clamped = Math.max(0, Math.min(100, score))
  let lower = COLOUR_STOPS[0]
  let upper = COLOUR_STOPS[COLOUR_STOPS.length - 1]

  for (let i = 0; i < COLOUR_STOPS.length - 1; i++) {
    if (clamped >= COLOUR_STOPS[i].score && clamped <= COLOUR_STOPS[i + 1].score) {
      lower = COLOUR_STOPS[i]
      upper = COLOUR_STOPS[i + 1]
      break
    }
  }

  const range = upper.score - lower.score
  const t = range > 0 ? (clamped - lower.score) / range : 0

  return {
    color: lerpColor(lower.color, upper.color, t),
    lightKey: lerpColor(lower.lightKey, upper.lightKey, t),
    lightFill: lerpColor(lower.lightFill, upper.lightFill, t),
    lightRim: lerpColor(lower.lightRim, upper.lightRim, t),
  }
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

    // Ease the score: cubic easing makes mid-range changes more gradual
    // and extremes more dramatic
    const normalised = Math.max(0, Math.min(100, score)) / 100
    const eased = easeInOutCubic(normalised)

    // Interpolate all numeric properties between worst and best
    const config = {}
    for (const [key, [worst, best]] of Object.entries(RANGES)) {
      config[key] = lerp(worst, best, eased)
    }

    // Interpolate colours between nearest stops
    const colours = getColoursForScore(score)
    Object.assign(config, colours)

    config.quality = quality
    config.colours = QUALITY_COLOURS[quality]

    return config
  }
}

export const orbManager = new OrbManager()

if (import.meta.hot) {
  import.meta.hot.dispose(() => orbManager._cleanupEvents())
  import.meta.hot.accept()
}
