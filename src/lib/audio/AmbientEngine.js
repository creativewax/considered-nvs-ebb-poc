// src/lib/audio/AmbientEngine.js

// ------------------------------------------------------------ QUALITY PRESETS

const QUALITY_PARAMS = {
  excellent: {
    freqs: [65, 98, 196],       // Root + fifth + octave — consonant, warm
    cutoff: 300,
    gain: 0.10,
    detune: 0,
    driftRange: 3,              // Hz of random frequency drift
    driftSpeed: 8,              // Seconds between drift changes
    panRange: 0.2,
  },
  good: {
    freqs: [82, 123, 247],
    cutoff: 450,
    gain: 0.12,
    detune: 0,
    driftRange: 5,
    driftSpeed: 6,
    panRange: 0.3,
  },
  fair: {
    freqs: [110, 165, 277],
    cutoff: 700,
    gain: 0.14,
    detune: 0,
    driftRange: 8,
    driftSpeed: 4,
    panRange: 0.35,
  },
  poor: {
    freqs: [147, 220, 370],      // Higher, more tense intervals
    cutoff: 1100,
    gain: 0.16,
    detune: 6,
    driftRange: 15,              // More erratic drift
    driftSpeed: 2,               // Faster changes
    panRange: 0.5,
  },
}

const DEFAULT_QUALITY = 'good'

// ------------------------------------------------------------ AMBIENT ENGINE
// Creates an evolving soundscape by scheduling random parameter
// changes at intervals — frequency drift, filter sweeps, volume
// swells, and stereo panning. Each "voice" wanders independently.

export class AmbientEngine {
  constructor() {
    this._ctx = null
    this._masterGain = null
    this._filter = null
    this._panner = null
    this._voices = []       // { osc, gain }
    this._playing = false
    this._driftTimers = []
    this._params = QUALITY_PARAMS[DEFAULT_QUALITY]
  }

  // ------------------------------------------------------------ START

  start() {
    if (this._playing) return
    this._startedAt = Date.now()

    this._ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (this._ctx.state === 'suspended') this._ctx.resume()

    const ctx = this._ctx
    const p = this._params

    // ── OUTPUT CHAIN ──
    this._masterGain = ctx.createGain()
    this._masterGain.gain.value = 0
    this._masterGain.connect(ctx.destination)

    this._panner = ctx.createStereoPanner()
    this._panner.pan.value = 0
    this._panner.connect(this._masterGain)

    this._filter = ctx.createBiquadFilter()
    this._filter.type = 'lowpass'
    this._filter.frequency.value = p.cutoff
    this._filter.Q.value = 1.5
    this._filter.connect(this._panner)

    // ── VOICES — each a sine oscillator with its own gain ──
    const voiceGains = [0.3, 0.2, 0.12]
    const types = ['sine', 'triangle', 'sine']

    this._voices = p.freqs.map((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = types[i]
      osc.frequency.value = freq
      if (i === 1) osc.detune.value = p.detune

      const gain = ctx.createGain()
      gain.gain.value = voiceGains[i]

      osc.connect(gain)
      gain.connect(this._filter)
      osc.start()

      return { osc, gain }
    })

    // ── FADE IN ──
    this._masterGain.gain.setValueAtTime(0, ctx.currentTime)
    this._masterGain.gain.linearRampToValueAtTime(p.gain, ctx.currentTime + 2.5)

    // ── START DRIFTING ──
    this._startDrifts()

    this._playing = true
  }

  // ------------------------------------------------------------ STOP

  stop() {
    if (!this._playing || !this._ctx) return
    if (this._startedAt && Date.now() - this._startedAt < 150) return

    this._stopDrifts()

    const now = this._ctx.currentTime
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(0, now + 1.0)

    setTimeout(() => {
      this._voices.forEach(v => { try { v.osc.stop() } catch (_) {} })
      this._voices = []
      this._playing = false
    }, 1100)
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      try { this._ctx?.close() } catch (_) {}
      this._ctx = null
    }, 1200)
  }

  // ------------------------------------------------------------ SET QUALITY

  setQuality(quality) {
    if (!this._playing || !this._ctx) return

    const p = QUALITY_PARAMS[quality] ?? QUALITY_PARAMS[DEFAULT_QUALITY]
    this._params = p
    const now = this._ctx.currentTime
    const end = now + 2.5

    // Crossfade frequencies
    this._voices.forEach((v, i) => {
      if (p.freqs[i]) this._ramp(v.osc.frequency, p.freqs[i], now, end)
    })

    // Detune voice 1
    if (this._voices[1]) this._ramp(this._voices[1].osc.detune, p.detune, now, end)

    // Filter + gain
    this._ramp(this._filter.frequency, p.cutoff, now, end)
    this._ramp(this._masterGain.gain, p.gain, now, end)

    // Restart drifts with new params
    this._stopDrifts()
    this._startDrifts()
  }

  // ------------------------------------------------------------ DRIFTS
  // Random parameter changes scheduled at intervals — this is what
  // makes it sound alive rather than a static hum.

  _startDrifts() {
    const p = this._params

    // ── FREQUENCY DRIFT — each voice wanders randomly ──
    this._voices.forEach((v, i) => {
      const baseFreq = p.freqs[i]
      const drift = () => {
        if (!this._playing || !this._ctx) return
        const target = baseFreq + (Math.random() * 2 - 1) * p.driftRange
        const now = this._ctx.currentTime
        // Random duration between 60-100% of driftSpeed
        const dur = p.driftSpeed * (0.6 + Math.random() * 0.4)
        v.osc.frequency.setValueAtTime(v.osc.frequency.value, now)
        v.osc.frequency.linearRampToValueAtTime(target, now + dur)

        this._driftTimers.push(setTimeout(drift, dur * 1000))
      }
      // Stagger the start of each voice
      this._driftTimers.push(setTimeout(drift, i * 1500 + Math.random() * 2000))
    })

    // ── VOLUME SWELL — gentle random amplitude changes on each voice ──
    this._voices.forEach((v, i) => {
      const baseGain = v.gain.gain.value
      const swell = () => {
        if (!this._playing || !this._ctx) return
        const target = baseGain * (0.5 + Math.random() * 0.8) // 50-130% of base
        const now = this._ctx.currentTime
        const dur = 3 + Math.random() * 5 // 3-8 seconds
        v.gain.gain.setValueAtTime(v.gain.gain.value, now)
        v.gain.gain.linearRampToValueAtTime(target, now + dur)

        this._driftTimers.push(setTimeout(swell, dur * 1000))
      }
      this._driftTimers.push(setTimeout(swell, 2000 + i * 1000 + Math.random() * 3000))
    })

    // ── FILTER SWEEP — slow random cutoff changes ──
    const filterSweep = () => {
      if (!this._playing || !this._ctx) return
      const base = p.cutoff
      const target = base * (0.7 + Math.random() * 0.6) // 70-130% of base
      const now = this._ctx.currentTime
      const dur = 4 + Math.random() * 6
      this._filter.frequency.setValueAtTime(this._filter.frequency.value, now)
      this._filter.frequency.linearRampToValueAtTime(target, now + dur)

      this._driftTimers.push(setTimeout(filterSweep, dur * 1000))
    }
    this._driftTimers.push(setTimeout(filterSweep, 3000))

    // ── STEREO PAN — slow random wandering ──
    const panDrift = () => {
      if (!this._playing || !this._ctx || !this._panner) return
      const target = (Math.random() * 2 - 1) * p.panRange
      const now = this._ctx.currentTime
      const dur = 3 + Math.random() * 5
      this._panner.pan.setValueAtTime(this._panner.pan.value, now)
      this._panner.pan.linearRampToValueAtTime(target, now + dur)

      this._driftTimers.push(setTimeout(panDrift, dur * 1000))
    }
    this._driftTimers.push(setTimeout(panDrift, 1000))
  }

  _stopDrifts() {
    this._driftTimers.forEach(t => clearTimeout(t))
    this._driftTimers = []
  }

  // ------------------------------------------------------------ HELPERS

  _ramp(param, target, now, end) {
    param.setValueAtTime(param.value, now)
    param.linearRampToValueAtTime(target, end)
  }
}
