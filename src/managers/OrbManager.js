// src/managers/OrbManager.js

import BaseManager from './BaseManager.js'
import { EVENTS } from '../constants/events.js'
import { QUALITY_COLOURS } from '../constants/colours.js'
import { scoreToQuality } from '../constants/sleep.js'

// ------------------------------------------------------------ EASING FUNCTIONS

function lerp(min, max, t) {
  return min + (max - min) * t
}

// Each property uses a different easing so values don't move in lockstep
const ease = {
  // Aggressive — changes mostly at the low end
  inQuart:     (t) => t * t * t * t,
  inCubic:     (t) => t * t * t,
  inQuad:      (t) => t * t,
  inSine:      (t) => 1 - Math.cos(t * Math.PI * 0.5),

  // Gentle — changes mostly at the high end
  outQuart:    (t) => 1 - Math.pow(1 - t, 4),
  outCubic:    (t) => 1 - Math.pow(1 - t, 3),
  outQuad:     (t) => 1 - (1 - t) * (1 - t),
  outSine:     (t) => 1 - Math.sin(t * Math.PI * 0.5),

  // Balanced
  inOutQuart:  (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  inOutCubic:  (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inOutQuad:   (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  inOutSine:   (t) => t < 0.5 ? 1 - Math.cos(t * Math.PI * 0.5) : Math.sin((t - 0.5) * Math.PI * 0.5) + 1,

  // Linear
  linear:      (t) => t,

  // Custom — steep at extremes, flat in middle
  bellCurve:   (t) => Math.sin(t * Math.PI) * 0.5 + t * 0.5,
}

// ------------------------------------------------------------ PROPERTY RANGES
// [worst (score 0), best (score 100), easingFn]

const RANGES = {
  distort:            [0.75, 0.12,  ease.inCubic],     // Drops fast then levels off
  frequency:          [0.5, 2.5,    ease.inQuad],        // Rises slowly then jumps at high scores
  surfaceDistort:     [0.75, 0.12,  ease.inSine],      // Drops very fast early
  surfaceFrequency:   [0.15, 1.5,   ease.inCubic],       // Stays low then rises late
  speed:              [0.012, 0.002, ease.linear],        // Steady linear change
  surfaceSpeed:       [0.01, 0.001,  ease.outQuad],       // Calms quickly
  numberOfWaves:      [7.0, 2.0,    ease.inOutCubic],     // Balanced S-curve
  surfacePoleAmount:  [0.2, 1.0,    ease.inQuart],        // Stays restricted then opens late
  gooPoleAmount:      [0.2, 1.0,    ease.inCubic],        // Similar but offset from above
  twist:              [0.8, 0.0,    ease.outCubic],        // Drops fast — twist is dramatic at low end
  twistFrequency:     [0.35, 1.0,   ease.bellCurve],      // Peaks in middle range
  roughness:          [0.25, 0.05,  ease.inOutQuad],       // Gentle S-curve
  metalness:          [0.6, 0.4,    ease.linear],          // Subtle linear shift
  clearcoat:          [0.95, 0.95,  ease.linear],          // Constant
  clearcoatRoughness: [0.02, 0.02,  ease.linear],          // Constant
  envMapIntensity:    [0.35, 0.5,   ease.inQuad],          // Reflections increase at high scores
  transmission:       [0.95, 0.95,  ease.linear],          // Constant
  tendrilCount:       [50, 8,       ease.inQuad],        // Drops fast — few tendrils for good sleep
  tendrilLength:      [0.35, 0.08,  ease.inSine],        // Shorter quickly
  tendrilThickness:   [0.01, 0.005, ease.inOutQuad],       // Gentle thinning
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

    // Normalise score to 0-1
    const normalised = Math.max(0, Math.min(100, score)) / 100

    // Each property uses its own easing function
    const config = {}
    for (const [key, [worst, best, easeFn]] of Object.entries(RANGES)) {
      const eased = easeFn(normalised)
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
