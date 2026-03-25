// src/lib/audio/AmbientEngine.js

// ------------------------------------------------------------ QUALITY PRESETS
// Musical intervals — consonant for good sleep, dissonant for poor

const QUALITY_PARAMS = {
  excellent:  { freqs: [65, 130, 195], gain: 0.08, filterCut: 300 },
  very_good:  { freqs: [73, 146, 220], gain: 0.09, filterCut: 400 },
  good:       { freqs: [82, 164, 247], gain: 0.10, filterCut: 450 },
  moderate:   { freqs: [98, 196, 294], gain: 0.10, filterCut: 500 },
  fair:       { freqs: [110, 220, 330], gain: 0.11, filterCut: 600 },
  restless:   { freqs: [123, 247, 350], gain: 0.12, filterCut: 750 },
  poor:       { freqs: [147, 294, 415], gain: 0.13, filterCut: 900 },
  very_poor:  { freqs: [165, 330, 468], gain: 0.14, filterCut: 1100 },
  disrupted:  { freqs: [185, 370, 525], gain: 0.15, filterCut: 1400 },
}

// ------------------------------------------------------------ AMBIENT ENGINE
// Simple, clean ambient: 3 sine oscillators through a filter.
// Slow LFO on filter cutoff creates gentle movement without random hums.

export class AmbientEngine {
  constructor() {
    this._ctx = null
    this._masterGain = null
    this._filter = null
    this._oscillators = []
    this._lfo = null
    this._lfoGain = null
    this._playing = false
    this._startedAt = 0
    this._quality = 'good'
  }

  start() {
    if (this._playing) return
    this._startedAt = Date.now()

    this._ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (this._ctx.state === 'suspended') this._ctx.resume()

    const ctx = this._ctx
    const p = QUALITY_PARAMS[this._quality] || QUALITY_PARAMS.good

    // Output chain: oscillators → filter → master gain → destination
    this._masterGain = ctx.createGain()
    this._masterGain.gain.value = 0
    this._masterGain.connect(ctx.destination)

    this._filter = ctx.createBiquadFilter()
    this._filter.type = 'lowpass'
    this._filter.frequency.value = p.filterCut
    this._filter.Q.value = 1.5
    this._filter.connect(this._masterGain)

    // Three sine oscillators — root, octave, fifth
    const gains = [0.4, 0.25, 0.15]
    this._oscillators = p.freqs.map((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const g = ctx.createGain()
      g.gain.value = gains[i]

      osc.connect(g)
      g.connect(this._filter)
      osc.start()
      return { osc, gain: g }
    })

    // LFO on filter cutoff — slow, smooth movement (not random)
    this._lfo = ctx.createOscillator()
    this._lfo.type = 'sine'
    this._lfo.frequency.value = 0.08  // Very slow — one cycle every 12.5 seconds

    this._lfoGain = ctx.createGain()
    this._lfoGain.gain.value = p.filterCut * 0.3  // Modulate by 30% of cutoff
    this._lfo.connect(this._lfoGain)
    this._lfoGain.connect(this._filter.frequency)
    this._lfo.start()

    // Fade in
    this._masterGain.gain.setValueAtTime(0, ctx.currentTime)
    this._masterGain.gain.linearRampToValueAtTime(p.gain, ctx.currentTime + 2.0)

    this._playing = true
  }

  stop() {
    if (!this._playing || !this._ctx) return
    if (Date.now() - this._startedAt < 200) return  // Debounce

    const now = this._ctx.currentTime
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(0, now + 1.0)

    setTimeout(() => {
      this._oscillators.forEach(({ osc }) => { try { osc.stop() } catch (_) {} })
      try { this._lfo?.stop() } catch (_) {}
      this._oscillators = []
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

  setQuality(quality) {
    this._quality = quality
    if (!this._playing || !this._ctx) return

    const p = QUALITY_PARAMS[quality] || QUALITY_PARAMS.good
    const now = this._ctx.currentTime
    const end = now + 2.0

    // Tween oscillator frequencies
    this._oscillators.forEach(({ osc }, i) => {
      if (p.freqs[i]) {
        osc.frequency.setValueAtTime(osc.frequency.value, now)
        osc.frequency.linearRampToValueAtTime(p.freqs[i], end)
      }
    })

    // Tween filter cutoff
    this._filter.frequency.setValueAtTime(this._filter.frequency.value, now)
    this._filter.frequency.linearRampToValueAtTime(p.filterCut, end)

    // Tween LFO depth
    this._lfoGain.gain.setValueAtTime(this._lfoGain.gain.value, now)
    this._lfoGain.gain.linearRampToValueAtTime(p.filterCut * 0.3, end)

    // Tween master volume
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(p.gain, end)
  }
}
