// src/lib/audio/AmbientEngine.js

// ------------------------------------------------------------ QUALITY PRESETS

const QUALITY_PARAMS = {
  excellent:  { bandLow: 100, bandHigh: 400,  noiseGain: 0.04, toneGain: 0.02, tonePitch: 65,  lfoRate: 0.04, filterQ: 8,  panRate: 0.02 },
  very_good:  { bandLow: 120, bandHigh: 500,  noiseGain: 0.05, toneGain: 0.02, tonePitch: 73,  lfoRate: 0.05, filterQ: 7,  panRate: 0.03 },
  good:       { bandLow: 140, bandHigh: 600,  noiseGain: 0.05, toneGain: 0.02, tonePitch: 82,  lfoRate: 0.06, filterQ: 6,  panRate: 0.03 },
  moderate:   { bandLow: 160, bandHigh: 700,  noiseGain: 0.06, toneGain: 0.02, tonePitch: 98,  lfoRate: 0.07, filterQ: 5,  panRate: 0.04 },
  fair:       { bandLow: 200, bandHigh: 900,  noiseGain: 0.06, toneGain: 0.03, tonePitch: 110, lfoRate: 0.08, filterQ: 5,  panRate: 0.04 },
  restless:   { bandLow: 250, bandHigh: 1100, noiseGain: 0.07, toneGain: 0.03, tonePitch: 123, lfoRate: 0.1,  filterQ: 4,  panRate: 0.05 },
  poor:       { bandLow: 300, bandHigh: 1400, noiseGain: 0.08, toneGain: 0.03, tonePitch: 147, lfoRate: 0.12, filterQ: 3,  panRate: 0.06 },
  very_poor:  { bandLow: 400, bandHigh: 1800, noiseGain: 0.09, toneGain: 0.04, tonePitch: 165, lfoRate: 0.15, filterQ: 3,  panRate: 0.07 },
  disrupted:  { bandLow: 500, bandHigh: 2200, noiseGain: 0.10, toneGain: 0.04, tonePitch: 185, lfoRate: 0.2,  filterQ: 2,  panRate: 0.08 },
}

// ------------------------------------------------------------ AMBIENT ENGINE
// Filtered noise soundscape — NOT oscillator hums.
// Two filtered noise bands + one quiet sub-tone + LFO sweeps + stereo pan.

export class AmbientEngine {
  constructor() {
    this._ctx = null
    this._masterGain = null
    this._playing = false
    this._startedAt = 0
    this._quality = 'good'
    this._nodes = {}
  }

  // ------------------------------------------------------------ START

  start() {
    if (this._playing) return
    this._startedAt = Date.now()

    this._ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (this._ctx.state === 'suspended') this._ctx.resume()

    const ctx = this._ctx
    const p = QUALITY_PARAMS[this._quality] || QUALITY_PARAMS.good

    // ── MASTER OUTPUT ──
    this._masterGain = ctx.createGain()
    this._masterGain.gain.value = 0
    this._masterGain.connect(ctx.destination)

    const panner = ctx.createStereoPanner()
    panner.pan.value = 0
    panner.connect(this._masterGain)

    // ── NOISE SOURCE — white noise buffer ──
    const bufferSize = ctx.sampleRate * 4  // 4 seconds, looped
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    // ── NOISE BAND 1 — low bandpass (warm wash) ──
    const noise1 = ctx.createBufferSource()
    noise1.buffer = noiseBuffer
    noise1.loop = true

    const filter1 = ctx.createBiquadFilter()
    filter1.type = 'bandpass'
    filter1.frequency.value = p.bandLow
    filter1.Q.value = p.filterQ

    const gain1 = ctx.createGain()
    gain1.gain.value = p.noiseGain

    noise1.connect(filter1)
    filter1.connect(gain1)
    gain1.connect(panner)
    noise1.start()

    // ── NOISE BAND 2 — higher bandpass (shimmer/texture) ──
    const noise2 = ctx.createBufferSource()
    noise2.buffer = noiseBuffer
    noise2.loop = true

    const filter2 = ctx.createBiquadFilter()
    filter2.type = 'bandpass'
    filter2.frequency.value = p.bandHigh
    filter2.Q.value = p.filterQ * 0.7

    const gain2 = ctx.createGain()
    gain2.gain.value = p.noiseGain * 0.4  // Quieter than the low band

    noise2.connect(filter2)
    filter2.connect(gain2)
    gain2.connect(panner)
    noise2.start()

    // ── SUB TONE — very quiet sine underneath for body ──
    const tone = ctx.createOscillator()
    tone.type = 'sine'
    tone.frequency.value = p.tonePitch

    const toneGain = ctx.createGain()
    toneGain.gain.value = p.toneGain

    const toneFilter = ctx.createBiquadFilter()
    toneFilter.type = 'lowpass'
    toneFilter.frequency.value = p.tonePitch * 2

    tone.connect(toneFilter)
    toneFilter.connect(toneGain)
    toneGain.connect(panner)
    tone.start()

    // ── LFO 1 — sweeps filter1 frequency (slow organic movement) ──
    const lfo1 = ctx.createOscillator()
    lfo1.type = 'sine'
    lfo1.frequency.value = p.lfoRate

    const lfo1Gain = ctx.createGain()
    lfo1Gain.gain.value = p.bandLow * 0.5  // Sweep range
    lfo1.connect(lfo1Gain)
    lfo1Gain.connect(filter1.frequency)
    lfo1.start()

    // ── LFO 2 — sweeps filter2 frequency (different rate for variation) ──
    const lfo2 = ctx.createOscillator()
    lfo2.type = 'triangle'
    lfo2.frequency.value = p.lfoRate * 0.7  // Offset rate

    const lfo2Gain = ctx.createGain()
    lfo2Gain.gain.value = p.bandHigh * 0.3
    lfo2.connect(lfo2Gain)
    lfo2Gain.connect(filter2.frequency)
    lfo2.start()

    // ── LFO 3 — slow stereo pan drift ──
    const lfoPan = ctx.createOscillator()
    lfoPan.type = 'sine'
    lfoPan.frequency.value = p.panRate

    const lfoPanGain = ctx.createGain()
    lfoPanGain.gain.value = 0.4  // Pan range ±0.4
    lfoPan.connect(lfoPanGain)
    lfoPanGain.connect(panner.pan)
    lfoPan.start()

    // ── FADE IN ──
    const totalGain = p.noiseGain + p.toneGain
    this._masterGain.gain.setValueAtTime(0, ctx.currentTime)
    this._masterGain.gain.linearRampToValueAtTime(totalGain, ctx.currentTime + 2.5)

    // Store references for cleanup and quality changes
    this._nodes = {
      noise1, noise2, tone,
      filter1, filter2, toneFilter,
      gain1, gain2, toneGain,
      lfo1, lfo2, lfoPan,
      lfo1Gain, lfo2Gain, lfoPanGain,
      panner,
    }

    this._playing = true
  }

  // ------------------------------------------------------------ STOP

  stop() {
    if (!this._playing || !this._ctx) return
    if (Date.now() - this._startedAt < 200) return

    const now = this._ctx.currentTime
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now)
    this._masterGain.gain.linearRampToValueAtTime(0, now + 1.5)

    setTimeout(() => {
      const n = this._nodes
      try { n.noise1?.stop() } catch (_) {}
      try { n.noise2?.stop() } catch (_) {}
      try { n.tone?.stop() } catch (_) {}
      try { n.lfo1?.stop() } catch (_) {}
      try { n.lfo2?.stop() } catch (_) {}
      try { n.lfoPan?.stop() } catch (_) {}
      this._nodes = {}
      this._playing = false
    }, 1600)
  }

  dispose() {
    this.stop()
    setTimeout(() => {
      try { this._ctx?.close() } catch (_) {}
      this._ctx = null
    }, 1800)
  }

  // ------------------------------------------------------------ SET QUALITY

  setQuality(quality) {
    this._quality = quality
    if (!this._playing || !this._ctx) return

    const p = QUALITY_PARAMS[quality] || QUALITY_PARAMS.good
    const n = this._nodes
    const now = this._ctx.currentTime
    const end = now + 2.0

    // Crossfade filter frequencies
    if (n.filter1) this._ramp(n.filter1.frequency, p.bandLow, now, end)
    if (n.filter2) this._ramp(n.filter2.frequency, p.bandHigh, now, end)
    if (n.filter1) this._ramp(n.filter1.Q, p.filterQ, now, end)
    if (n.filter2) this._ramp(n.filter2.Q, p.filterQ * 0.7, now, end)

    // Crossfade gains
    if (n.gain1) this._ramp(n.gain1.gain, p.noiseGain, now, end)
    if (n.gain2) this._ramp(n.gain2.gain, p.noiseGain * 0.4, now, end)
    if (n.toneGain) this._ramp(n.toneGain.gain, p.toneGain, now, end)

    // Crossfade tone pitch
    if (n.tone) this._ramp(n.tone.frequency, p.tonePitch, now, end)
    if (n.toneFilter) this._ramp(n.toneFilter.frequency, p.tonePitch * 2, now, end)

    // Update LFO rates
    if (n.lfo1) this._ramp(n.lfo1.frequency, p.lfoRate, now, end)
    if (n.lfo2) this._ramp(n.lfo2.frequency, p.lfoRate * 0.7, now, end)
    if (n.lfoPan) this._ramp(n.lfoPan.frequency, p.panRate, now, end)

    // Update LFO sweep ranges
    if (n.lfo1Gain) this._ramp(n.lfo1Gain.gain, p.bandLow * 0.5, now, end)
    if (n.lfo2Gain) this._ramp(n.lfo2Gain.gain, p.bandHigh * 0.3, now, end)

    // Update master volume
    const totalGain = p.noiseGain + p.toneGain
    this._ramp(this._masterGain.gain, totalGain, now, end)
  }

  // ------------------------------------------------------------ HELPERS

  _ramp(param, target, now, end) {
    param.setValueAtTime(param.value, now)
    param.linearRampToValueAtTime(target, end)
  }
}
