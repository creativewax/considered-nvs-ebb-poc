// src/lib/audio/AmbientEngine.js

// ------------------------------------------------------------
// AMBIENT ENGINE — Web Audio API drone that morphs with sleep quality
// ------------------------------------------------------------

const QUALITY_PARAMS = {
  excellent: { base: 80,  mid: 160, high: 320, cutoff: 400,  gain: 0.15, detune: 0   },
  good:      { base: 100, mid: 200, high: 400, cutoff: 600,  gain: 0.18, detune: 0   },
  fair:      { base: 140, mid: 280, high: 500, cutoff: 900,  gain: 0.20, detune: 0   },
  poor:      { base: 200, mid: 400, high: 700, cutoff: 1400, gain: 0.22, detune: 3   },
}

const DEFAULT_PARAMS = QUALITY_PARAMS.good

export class AmbientEngine {
  constructor() {
    this._ctx         = null
    this._masterGain  = null
    this._oscillators = []
    this._filter      = null
    this._playing     = false
  }

  // ------------------------------------------------------------
  // LIFECYCLE
  // ------------------------------------------------------------

  // Must be called from a user gesture — creates AudioContext lazily
  start() {
    if (this._playing) return

    this._startedAt  = Date.now()
    this._ctx        = new (window.AudioContext || window.webkitAudioContext)()

    // Resume suspended AudioContext (browser autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume()
    }

    this._masterGain = this._ctx.createGain()
    this._filter     = this._ctx.createBiquadFilter()

    this._filter.type            = 'lowpass'
    this._filter.frequency.value = DEFAULT_PARAMS.cutoff
    this._filter.Q.value         = 0.7

    this._masterGain.gain.value  = 0
    this._masterGain.connect(this._ctx.destination)
    this._filter.connect(this._masterGain)

    // Low sine — base drone
    const osc0 = this._createOscillator('sine',     DEFAULT_PARAMS.base, 0)
    // Mid triangle — texture
    const osc1 = this._createOscillator('triangle', DEFAULT_PARAMS.mid,  DEFAULT_PARAMS.detune)
    // High sine — shimmer
    const osc2 = this._createOscillator('sine',     DEFAULT_PARAMS.high, 0)

    this._oscillators = [osc0, osc1, osc2]
    this._oscillators.forEach(o => o.start())

    // Fade in gently
    this._masterGain.gain.setValueAtTime(0, this._ctx.currentTime)
    this._masterGain.gain.linearRampToValueAtTime(DEFAULT_PARAMS.gain, this._ctx.currentTime + 1.0)

    this._playing = true
  }

  stop() {
    if (!this._playing || !this._ctx) return

    // Debounce — ignore stop() within 150ms of start() (AnimatePresence remount)
    if (this._startedAt && Date.now() - this._startedAt < 150) return

    const now = this._ctx.currentTime
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(0, now + 0.5)

    setTimeout(() => {
      this._oscillators.forEach(o => {
        try { o.stop() } catch (_) {}
      })
      this._oscillators = []
      this._playing = false
    }, 550)
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      try { this._ctx?.close() } catch (_) {}
      this._ctx        = null
      this._masterGain = null
      this._filter     = null
    }, 600)
  }

  // ------------------------------------------------------------
  // QUALITY MORPH
  // ------------------------------------------------------------

  setQuality(quality) {
    if (!this._playing || !this._ctx) return

    const params = QUALITY_PARAMS[quality] ?? DEFAULT_PARAMS
    const now    = this._ctx.currentTime
    const end    = now + 1.5

    const [osc0, osc1, osc2] = this._oscillators

    // Crossfade oscillator frequencies
    if (osc0) this._rampFreq(osc0, params.base,  now, end)
    if (osc1) this._rampFreq(osc1, params.mid,   now, end)
    if (osc2) this._rampFreq(osc2, params.high,  now, end)

    // Detune mid oscillator for dissonance on poor quality
    if (osc1) {
      osc1.detune.setValueAtTime(osc1.detune.value, now)
      osc1.detune.linearRampToValueAtTime(params.detune, end)
    }

    // Filter cutoff brightness
    this._filter.frequency.setValueAtTime(this._filter.frequency.value, now)
    this._filter.frequency.linearRampToValueAtTime(params.cutoff, end)

    // Master volume
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(params.gain, end)
  }

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  _createOscillator(type, frequency, detuneCents) {
    const osc       = this._ctx.createOscillator()
    osc.type        = type
    osc.frequency.value = frequency
    osc.detune.value    = detuneCents
    osc.connect(this._filter)
    return osc
  }

  _rampFreq(osc, targetFreq, now, end) {
    osc.frequency.setValueAtTime(osc.frequency.value, now)
    osc.frequency.linearRampToValueAtTime(targetFreq, end)
  }
}
