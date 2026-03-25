// src/lib/audio/AmbientEngine.js

import * as Tone from 'tone'

// ------------------------------------------------------------ QUALITY PRESETS
// Four layers: pad synth, shimmer, filtered noise, sub-bass pulse.
// Excellent = warm, open, spacious. Poor/disrupted = darker, dissonant, agitated.

const PRESETS = {
  excellent: {
    // Pad — warm major chord, minimal detune
    padNotes:    ['C3', 'E3', 'G3', 'B3'],
    padDetune:   6,
    padVolume:   -18,
    padAttack:   4,
    padRelease:  8,
    // Shimmer — gentle high sparkle
    shimmerNote: 'C5',
    shimmerVol:  -28,
    shimmerMod:  0.5,
    // Noise bed — very quiet, low cutoff
    noiseVol:    -32,
    noiseCutoff: 400,
    // Sub-bass pulse — silent for good scores
    subVol:      -Infinity,
    subPitch:    'C1',
    subRate:     0,
    // Effects — big reverb, lush chorus
    reverbDecay:   6,
    reverbWet:     0.7,
    chorusDepth:   0.6,
    chorusFreq:    0.3,
    delayFeedback: 0.3,
    delayWet:      0.2,
    distortion:    0,
    // Modulation — slow and dreamy
    lfoRate:       0.04,
    panRate:       0.02,
  },
  very_good: {
    padNotes:    ['C3', 'E3', 'G3', 'B3'],
    padDetune:   5,
    padVolume:   -18,
    padAttack:   3.5,
    padRelease:  7,
    shimmerNote: 'C5',
    shimmerVol:  -29,
    shimmerMod:  0.6,
    noiseVol:    -31,
    noiseCutoff: 450,
    subVol:      -Infinity,
    subPitch:    'C1',
    subRate:     0,
    reverbDecay:   5.5,
    reverbWet:     0.65,
    chorusDepth:   0.55,
    chorusFreq:    0.35,
    delayFeedback: 0.28,
    delayWet:      0.18,
    distortion:    0,
    lfoRate:       0.045,
    panRate:       0.025,
  },
  good: {
    padNotes:    ['C3', 'E3', 'G3'],
    padDetune:   4,
    padVolume:   -19,
    padAttack:   3,
    padRelease:  6,
    shimmerNote: 'G4',
    shimmerVol:  -30,
    shimmerMod:  0.8,
    noiseVol:    -30,
    noiseCutoff: 500,
    subVol:      -Infinity,
    subPitch:    'C1',
    subRate:     0,
    reverbDecay:   5,
    reverbWet:     0.6,
    chorusDepth:   0.5,
    chorusFreq:    0.4,
    delayFeedback: 0.25,
    delayWet:      0.15,
    distortion:    0,
    lfoRate:       0.05,
    panRate:       0.03,
  },
  moderate: {
    padNotes:    ['C3', 'Eb3', 'G3'],
    padDetune:   8,
    padVolume:   -19,
    padAttack:   2.5,
    padRelease:  5,
    shimmerNote: 'Eb4',
    shimmerVol:  -30,
    shimmerMod:  1.2,
    noiseVol:    -28,
    noiseCutoff: 600,
    subVol:      -Infinity,
    subPitch:    'C1',
    subRate:     0,
    reverbDecay:   4,
    reverbWet:     0.5,
    chorusDepth:   0.4,
    chorusFreq:    0.5,
    delayFeedback: 0.2,
    delayWet:      0.12,
    distortion:    0,
    lfoRate:       0.06,
    panRate:       0.04,
  },
  fair: {
    padNotes:    ['C3', 'Eb3', 'Gb3'],
    padDetune:   14,
    padVolume:   -20,
    padAttack:   2,
    padRelease:  4.5,
    shimmerNote: 'Gb4',
    shimmerVol:  -30,
    shimmerMod:  1.8,
    noiseVol:    -27,
    noiseCutoff: 750,
    subVol:      -36,
    subPitch:    'C1',
    subRate:     0.15,
    reverbDecay:   3.5,
    reverbWet:     0.45,
    chorusDepth:   0.35,
    chorusFreq:    0.6,
    delayFeedback: 0.18,
    delayWet:      0.1,
    distortion:    0.02,
    lfoRate:       0.07,
    panRate:       0.045,
  },
  restless: {
    // Tritone cluster — C + Gb is the devil's interval
    padNotes:    ['C3', 'Eb3', 'Gb3', 'A3'],
    padDetune:   22,
    padVolume:   -19,
    padAttack:   1.5,
    padRelease:  3.5,
    shimmerNote: 'A4',
    shimmerVol:  -28,
    shimmerMod:  2.5,
    noiseVol:    -25,
    noiseCutoff: 950,
    subVol:      -30,
    subPitch:    'C1',
    subRate:     0.25,
    reverbDecay:   2.5,
    reverbWet:     0.35,
    chorusDepth:   0.25,
    chorusFreq:    0.8,
    delayFeedback: 0.15,
    delayWet:      0.08,
    distortion:    0.05,
    lfoRate:       0.1,
    panRate:       0.055,
  },
  poor: {
    // Heavy tritone + minor 2nd cluster
    padNotes:    ['C3', 'Db3', 'Gb3'],
    padDetune:   35,
    padVolume:   -18,
    padAttack:   1.2,
    padRelease:  3,
    shimmerNote: 'Db5',
    shimmerVol:  -26,
    shimmerMod:  3.5,
    noiseVol:    -23,
    noiseCutoff: 1200,
    subVol:      -26,
    subPitch:    'C1',
    subRate:     0.35,
    reverbDecay:   2,
    reverbWet:     0.3,
    chorusDepth:   0.2,
    chorusFreq:    1.0,
    delayFeedback: 0.12,
    delayWet:      0.06,
    distortion:    0.1,
    lfoRate:       0.14,
    panRate:       0.065,
  },
  very_poor: {
    // Stacked dissonance — minor 2nds and tritones
    padNotes:    ['C3', 'Db3', 'E3', 'Gb3'],
    padDetune:   45,
    padVolume:   -18,
    padAttack:   1,
    padRelease:  2.5,
    shimmerNote: 'E5',
    shimmerVol:  -25,
    shimmerMod:  5.0,
    noiseVol:    -22,
    noiseCutoff: 1500,
    subVol:      -24,
    subPitch:    'Db1',
    subRate:     0.45,
    reverbDecay:   1.5,
    reverbWet:     0.25,
    chorusDepth:   0.15,
    chorusFreq:    1.2,
    delayFeedback: 0.1,
    delayWet:      0.05,
    distortion:    0.15,
    lfoRate:       0.18,
    panRate:       0.075,
  },
  disrupted: {
    // Maximum tension — chromatic cluster, heavy sub throb
    padNotes:    ['C3', 'Db3', 'D3', 'Gb3'],
    padDetune:   60,
    padVolume:   -17,
    padAttack:   0.8,
    padRelease:  2,
    shimmerNote: 'G5',
    shimmerVol:  -24,
    shimmerMod:  7.0,
    noiseVol:    -20,
    noiseCutoff: 1800,
    subVol:      -22,
    subPitch:    'Db1',
    subRate:     0.6,
    reverbDecay:   1,
    reverbWet:     0.2,
    chorusDepth:   0.1,
    chorusFreq:    1.5,
    delayFeedback: 0.08,
    delayWet:      0.04,
    distortion:    0.2,
    lfoRate:       0.22,
    panRate:       0.09,
  },
}

// ------------------------------------------------------------ CROSSFADE TIME
const MORPH_TIME = 3

// ------------------------------------------------------------ AMBIENT ENGINE
// Four-layer generative soundscape driven by Tone.js.
// Layer 1: PolySynth pad (chords, warmth/dissonance)
// Layer 2: FMSynth shimmer (texture, metallic edge at low scores)
// Layer 3: Filtered noise bed (air, hiss, presence)
// Layer 4: Sub-bass pulse (ominous throb for poor scores)
// All routed through distortion, chorus, delay, reverb, auto-panner.

export class AmbientEngine {
  constructor() {
    this._playing  = false
    this._quality  = 'good'
    this._startedAt = 0
    this._nodes    = null
    this._stopTimer = null   // Pending dispose timeout
    this._stopping = false   // True during fade-out, before dispose
  }

  // ------------------------------------------------------------ START

  async start() {
    // If mid-fade-out, cancel the dispose and fade back in
    if (this._stopping && this._nodes) {
      clearTimeout(this._stopTimer)
      this._stopTimer = null
      this._stopping = false
      this._playing = true
      this._startedAt = Date.now()
      this._nodes.master.gain.rampTo(1, MORPH_TIME)
      return
    }

    if (this._playing) return
    this._startedAt = Date.now()

    // Tone.start() handles Chrome autoplay — must be called from user gesture
    await Tone.start()

    const p = PRESETS[this._quality] || PRESETS.good

    // ── EFFECTS CHAIN ──
    const reverb = new Tone.Reverb({ decay: p.reverbDecay, wet: p.reverbWet })
    await reverb.generate()

    const distort = new Tone.Distortion({ distortion: p.distortion, wet: p.distortion > 0 ? 0.3 : 0 })

    const chorus = new Tone.Chorus({
      frequency: p.chorusFreq,
      delayTime: 3.5,
      depth: p.chorusDepth,
      wet: 0.5,
    }).start()

    const delay = new Tone.FeedbackDelay({
      delayTime: '4n',
      feedback: p.delayFeedback,
      wet: p.delayWet,
    })

    const panner = new Tone.AutoPanner({ frequency: p.panRate, depth: 0.4 }).start()
    const master = new Tone.Gain(0).toDestination()

    // Chain: sources → distort → chorus → delay → reverb → panner → master
    distort.connect(chorus)
    chorus.connect(delay)
    delay.connect(reverb)
    reverb.connect(panner)
    panner.connect(master)

    // ── PAD SYNTH — sustained chords ──
    const pad = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 6,
      voice: Tone.Synth,
      options: {
        oscillator: { type: 'sine4', spread: p.padDetune },
        envelope: {
          attack:  p.padAttack,
          decay:   2,
          sustain: 0.8,
          release: p.padRelease,
        },
        volume: p.padVolume,
      },
    })

    // ── PAD FILTER — LFO sweeps for organic movement ──
    const padFilter = new Tone.Filter({ frequency: 600, type: 'lowpass', rolloff: -12 })
    const filterLfo = new Tone.LFO(p.lfoRate, 200, 800).start()
    filterLfo.connect(padFilter.frequency)
    pad.connect(padFilter)
    padFilter.connect(distort)

    // ── SHIMMER — FM texture ──
    const shimmer = new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: p.shimmerMod,
      oscillator: { type: 'sine' },
      modulation: { type: 'triangle' },
      envelope: {
        attack:  3,
        decay:   1,
        sustain: 0.6,
        release: 5,
      },
      volume: p.shimmerVol,
    }).connect(distort)

    // ── NOISE BED — filtered air ──
    const noise = new Tone.Noise('pink').start()
    const noiseFilter = new Tone.AutoFilter({
      frequency: p.lfoRate,
      baseFrequency: p.noiseCutoff,
      octaves: 1.5,
      depth: 0.6,
    }).start()
    const noiseGain = new Tone.Gain(Tone.dbToGain(p.noiseVol))
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(distort)

    // ── SUB-BASS PULSE — ominous throb for low scores ──
    const sub = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack:  0.4,
        decay:   0.6,
        sustain: 0.3,
        release: 1.5,
      },
      volume: p.subVol,
    }).connect(master) // Sub bypasses effects — straight to master for clean low end

    // Sub-bass LFO triggers periodic pulses via amplitude tremolo
    const subLfo = new Tone.LFO(p.subRate, 0, 1).start()
    const subTremolo = new Tone.Gain(0)
    subLfo.connect(subTremolo.gain)

    // Only route sub through tremolo if sub is active
    if (p.subVol > -60) {
      sub.connect(subTremolo)
      subTremolo.connect(master)
      sub.triggerAttack(p.subPitch, Tone.now(), 0.6)
    }

    // Store references
    this._nodes = {
      pad, shimmer, noise, noiseFilter, noiseGain,
      sub, subLfo, subTremolo,
      distort, chorus, delay, reverb, panner, master,
      filterLfo, padFilter,
    }

    // ── TRIGGER INITIAL NOTES ──
    pad.triggerAttack(p.padNotes, Tone.now(), 0.5)
    shimmer.triggerAttack(p.shimmerNote, Tone.now(), 0.3)

    // ── FADE IN ──
    master.gain.rampTo(1, MORPH_TIME)

    this._playing = true
  }

  // ------------------------------------------------------------ STOP

  stop() {
    if ((!this._playing && !this._stopping) || !this._nodes) return
    if (Date.now() - this._startedAt < 200) return

    // If already stopping, don't double-stop
    if (this._stopping) return

    this._nodes.master.gain.rampTo(0, 2)
    this._playing = false
    this._stopping = true

    // Nodes stay alive during fade-out so start() can cancel and fade back in
    const nodes = this._nodes
    this._stopTimer = setTimeout(() => {
      this._stopTimer = null
      this._stopping = false

      try { nodes.pad.releaseAll() } catch (_) {}
      try { nodes.shimmer.triggerRelease() } catch (_) {}
      try { nodes.noise.stop() } catch (_) {}
      try { nodes.sub.triggerRelease() } catch (_) {}

      Object.values(nodes).forEach(node => {
        try { node.dispose() } catch (_) {}
      })

      // Only null nodes if they haven't been replaced by a new start()
      if (this._nodes === nodes) this._nodes = null
    }, 2500)
  }

  // ------------------------------------------------------------ DISPOSE

  dispose() {
    if (this._stopTimer) clearTimeout(this._stopTimer)
    this._stopping = false

    if (this._nodes) {
      Object.values(this._nodes).forEach(node => {
        try { node.dispose() } catch (_) {}
      })
      this._nodes = null
    }

    this._playing = false
  }

  // ------------------------------------------------------------ SET QUALITY

  setQuality(quality) {
    this._quality = quality
    if (!this._playing || !this._nodes) return

    const p = PRESETS[quality] || PRESETS.good
    const {
      pad, shimmer, sub, subLfo,
      noiseFilter, noiseGain,
      distort, chorus, delay, reverb, panner,
      filterLfo, padFilter,
    } = this._nodes
    const t = Tone.now()

    // ── MORPH PAD ──
    pad.releaseAll(t)
    pad.set({
      oscillator: { spread: p.padDetune },
      envelope: { attack: p.padAttack, release: p.padRelease },
      volume: p.padVolume,
    })
    pad.triggerAttack(p.padNotes, t + 0.5, 0.5)

    // ── MORPH SHIMMER ──
    shimmer.triggerRelease(t)
    shimmer.set({ modulationIndex: p.shimmerMod, volume: p.shimmerVol })
    shimmer.triggerAttack(p.shimmerNote, t + 0.5, 0.3)

    // ── MORPH NOISE ──
    noiseFilter.set({ baseFrequency: p.noiseCutoff, frequency: p.lfoRate })
    noiseGain.gain.linearRampTo(Tone.dbToGain(p.noiseVol), MORPH_TIME)

    // ── MORPH SUB-BASS ──
    sub.set({ volume: p.subVol })
    subLfo.set({ frequency: Math.max(p.subRate, 0.01) })
    if (p.subVol > -60) {
      try { sub.triggerRelease(t) } catch (_) {}
      sub.triggerAttack(p.subPitch, t + 0.3, 0.6)
    } else {
      try { sub.triggerRelease(t) } catch (_) {}
    }

    // ── MORPH EFFECTS ──
    distort.set({ distortion: p.distortion, wet: p.distortion > 0 ? 0.3 : 0 })
    reverb.set({ decay: p.reverbDecay, wet: p.reverbWet })
    chorus.set({ frequency: p.chorusFreq, depth: p.chorusDepth })
    delay.set({ feedback: p.delayFeedback, wet: p.delayWet })
    panner.set({ frequency: p.panRate })

    // ── MORPH LFO ──
    filterLfo.set({ frequency: p.lfoRate })
    padFilter.frequency.linearRampTo(p.noiseCutoff * 0.8, MORPH_TIME)
  }
}
