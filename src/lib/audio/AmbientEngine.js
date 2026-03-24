// src/lib/audio/AmbientEngine.js

// ------------------------------------------------------------ QUALITY PRESETS

const QUALITY_PARAMS = {
  excellent: {
    base: 65,  mid: 130, high: 260, shimmer: 520,
    cutoff: 350, gain: 0.12, detune: 0,
    lfoRate: 0.03, lfoDepth: 4,       // Very slow, subtle modulation
    breatheRate: 0.08, breatheDepth: 0.03,
  },
  good: {
    base: 85,  mid: 170, high: 340, shimmer: 680,
    cutoff: 500, gain: 0.14, detune: 0,
    lfoRate: 0.05, lfoDepth: 6,
    breatheRate: 0.12, breatheDepth: 0.04,
  },
  fair: {
    base: 110, mid: 220, high: 440, shimmer: 800,
    cutoff: 800, gain: 0.16, detune: 0,
    lfoRate: 0.08, lfoDepth: 10,      // More movement
    breatheRate: 0.18, breatheDepth: 0.05,
  },
  poor: {
    base: 160, mid: 320, high: 580, shimmer: 950,
    cutoff: 1200, gain: 0.18, detune: 5,
    lfoRate: 0.15, lfoDepth: 18,      // Agitated, more variation
    breatheRate: 0.25, breatheDepth: 0.07,
  },
}

const DEFAULT_PARAMS = QUALITY_PARAMS.good

// ------------------------------------------------------------ AMBIENT ENGINE
// Creates an evolving soundscape that breathes and shifts, not a static hum.
// Architecture:
//   4 oscillators → individual gains → filter → panner → master gain → output
//   2 LFOs modulate frequency + amplitude for organic movement

export class AmbientEngine {
  constructor() {
    this._ctx = null
    this._masterGain = null
    this._filter = null
    this._panner = null
    this._oscillators = []
    this._oscGains = []
    this._lfoFreq = null
    this._lfoAmp = null
    this._playing = false
    this._animFrame = null
    this._params = DEFAULT_PARAMS
  }

  // ------------------------------------------------------------ LIFECYCLE

  start() {
    if (this._playing) return

    this._startedAt = Date.now()
    this._ctx = new (window.AudioContext || window.webkitAudioContext)()

    if (this._ctx.state === 'suspended') {
      this._ctx.resume()
    }

    const ctx = this._ctx

    // ── OUTPUT CHAIN ──
    this._masterGain = ctx.createGain()
    this._masterGain.gain.value = 0
    this._masterGain.connect(ctx.destination)

    this._panner = ctx.createStereoPanner()
    this._panner.pan.value = 0
    this._panner.connect(this._masterGain)

    this._filter = ctx.createBiquadFilter()
    this._filter.type = 'lowpass'
    this._filter.frequency.value = this._params.cutoff
    this._filter.Q.value = 1.2
    this._filter.connect(this._panner)

    // ── 4 OSCILLATORS with individual gain control ──
    const p = this._params
    const oscConfigs = [
      { type: 'sine',     freq: p.base,    gain: 0.35 },  // Deep drone
      { type: 'triangle', freq: p.mid,     gain: 0.2,  detune: p.detune },  // Mid texture
      { type: 'sine',     freq: p.high,    gain: 0.12 },  // High tone
      { type: 'sine',     freq: p.shimmer, gain: 0.06 },  // Shimmer (barely audible)
    ]

    this._oscillators = []
    this._oscGains = []

    oscConfigs.forEach(({ type, freq, gain, detune }) => {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = freq
      if (detune) osc.detune.value = detune

      const oscGain = ctx.createGain()
      oscGain.gain.value = gain

      osc.connect(oscGain)
      oscGain.connect(this._filter)
      osc.start()

      this._oscillators.push(osc)
      this._oscGains.push(oscGain)
    })

    // ── LFOs for organic movement ──
    // Frequency LFO — slowly shifts oscillator pitches
    this._lfoFreq = ctx.createOscillator()
    this._lfoFreq.type = 'sine'
    this._lfoFreq.frequency.value = p.lfoRate

    const lfoFreqGain = ctx.createGain()
    lfoFreqGain.gain.value = p.lfoDepth
    this._lfoFreq.connect(lfoFreqGain)
    // Connect to each oscillator's frequency
    this._oscillators.forEach(osc => {
      lfoFreqGain.connect(osc.frequency)
    })
    this._lfoFreq.start()
    this._lfoFreqGain = lfoFreqGain

    // Amplitude LFO — breathing volume swell
    this._lfoAmp = ctx.createOscillator()
    this._lfoAmp.type = 'sine'
    this._lfoAmp.frequency.value = p.breatheRate

    const lfoAmpGain = ctx.createGain()
    lfoAmpGain.gain.value = p.breatheDepth
    this._lfoAmp.connect(lfoAmpGain)
    lfoAmpGain.connect(this._masterGain.gain)
    this._lfoAmp.start()
    this._lfoAmpGain = lfoAmpGain

    // ── SLOW STEREO PAN ──
    this._startPanning()

    // ── FADE IN ──
    this._masterGain.gain.setValueAtTime(0, ctx.currentTime)
    this._masterGain.gain.linearRampToValueAtTime(p.gain, ctx.currentTime + 2.0)

    this._playing = true
  }

  stop() {
    if (!this._playing || !this._ctx) return
    if (this._startedAt && Date.now() - this._startedAt < 150) return

    const now = this._ctx.currentTime
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(0, now + 1.0)

    if (this._animFrame) cancelAnimationFrame(this._animFrame)

    setTimeout(() => {
      this._oscillators.forEach(o => { try { o.stop() } catch (_) {} })
      try { this._lfoFreq?.stop() } catch (_) {}
      try { this._lfoAmp?.stop() } catch (_) {}
      this._oscillators = []
      this._oscGains = []
      this._playing = false
    }, 1100)
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      try { this._ctx?.close() } catch (_) {}
      this._ctx = null
      this._masterGain = null
      this._filter = null
      this._panner = null
    }, 1200)
  }

  // ------------------------------------------------------------ QUALITY MORPH

  setQuality(quality) {
    if (!this._playing || !this._ctx) return

    const p = QUALITY_PARAMS[quality] ?? DEFAULT_PARAMS
    this._params = p
    const now = this._ctx.currentTime
    const end = now + 2.0

    const [osc0, osc1, osc2, osc3] = this._oscillators
    if (osc0) this._ramp(osc0.frequency, p.base, now, end)
    if (osc1) this._ramp(osc1.frequency, p.mid, now, end)
    if (osc2) this._ramp(osc2.frequency, p.high, now, end)
    if (osc3) this._ramp(osc3.frequency, p.shimmer, now, end)

    if (osc1) this._ramp(osc1.detune, p.detune, now, end)

    this._ramp(this._filter.frequency, p.cutoff, now, end)
    this._ramp(this._masterGain.gain, p.gain, now, end)

    // Update LFO parameters
    this._ramp(this._lfoFreq.frequency, p.lfoRate, now, end)
    this._ramp(this._lfoFreqGain.gain, p.lfoDepth, now, end)
    this._ramp(this._lfoAmp.frequency, p.breatheRate, now, end)
    this._ramp(this._lfoAmpGain.gain, p.breatheDepth, now, end)
  }

  // ------------------------------------------------------------ STEREO PANNING

  _startPanning() {
    let phase = 0
    const tick = () => {
      if (!this._playing || !this._panner) return
      phase += 0.002
      // Slow sine pan between -0.3 and 0.3
      this._panner.pan.value = Math.sin(phase) * 0.3
      this._animFrame = requestAnimationFrame(tick)
    }
    tick()
  }

  // ------------------------------------------------------------ HELPERS

  _ramp(param, target, now, end) {
    param.setValueAtTime(param.value, now)
    param.linearRampToValueAtTime(target, end)
  }
}
