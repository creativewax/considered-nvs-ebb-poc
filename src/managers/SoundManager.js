// src/managers/SoundManager.js

import * as Tone from 'tone'
import BaseManager from './BaseManager.js'
import { AmbientEngine } from '../lib/audio/AmbientEngine.js'
import { EVENTS } from '../constants/events.js'

// ------------------------------------------------------------
// SOUND MANAGER — owns the AmbientEngine lifecycle
// ------------------------------------------------------------

class SoundManager extends BaseManager {
  constructor() {
    super()
    this._state  = { playing: false, enabled: false, quality: null }
    this._engine = null
    this._refs   = 0          // How many pages currently want sound
    this._stopTimer = null    // Delayed stop — cancelled if a new page mounts quickly

    // When a record is selected, update the engine quality
    this._onEvent(EVENTS.SLEEP_RECORD_SELECTED, (record) => {
      if (record?.quality) {
        this._setState({ quality: record.quality })
        this._engine?.setQuality(record.quality)
      }
    })

    // Mobile browsers suspend AudioContext when the tab is hidden / phone locked.
    // Resume on visibility change so sound comes back when the user returns.
    this._onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && this._state.playing) {
        try {
          const ctx = Tone.getContext()?.rawContext
          if (ctx?.state !== 'running') ctx?.resume()
        } catch (_) {}
      }
    }
    document.addEventListener('visibilitychange', this._onVisibilityChange)
  }

  // ------------------------------------------------------------
  // METHODS
  // ------------------------------------------------------------

  // Toggle — user explicitly enables/disables sound.
  // iOS audio unlock happens synchronously in the component's native
  // touchend handler (via iosUnlock.js) BEFORE this method is called.
  async toggle() {
    if (this._state.enabled) {
      this._setState({ enabled: false })
      this._stopEngine()
    } else {
      this._setState({ enabled: true })
      try { await this._startEngine() } catch (e) {
        console.error('[SoundManager] engine start failed:', e)
      }
    }
  }

  // Claim — page mounts and wants sound. Cancels any pending stop.
  async claim() {
    this._refs++
    if (this._stopTimer) {
      clearTimeout(this._stopTimer)
      this._stopTimer = null
    }
    if (!this._state.enabled || this._state.playing) return
    await this._startEngine()
  }

  // Release — page unmounts. Only stops after a brief grace period
  // so navigating between sound pages doesn't interrupt playback.
  release() {
    this._refs = Math.max(0, this._refs - 1)
    if (this._refs > 0) return

    // Grace period — if another page claims within 200ms, sound continues
    this._stopTimer = setTimeout(() => {
      this._stopTimer = null
      if (this._refs === 0) this._stopEngine()
    }, 200)
  }

  async _startEngine() {
    if (this._state.playing) return

    if (!this._engine) {
      this._engine = new AmbientEngine()
    }

    if (this._state.quality) {
      this._engine._quality = this._state.quality
    }

    await this._engine.start()
    this._setState({ playing: true })
  }

  _stopEngine() {
    if (!this._state.playing) return
    this._engine?.stop()
    this._setState({ playing: false })
  }

  setQuality(quality) {
    this._setState({ quality })
    this._engine?.setQuality(quality)
  }

  dispose() {
    if (this._stopTimer) clearTimeout(this._stopTimer)
    document.removeEventListener('visibilitychange', this._onVisibilityChange)
    this._engine?.dispose()
    this._engine = null
    this._refs = 0
    this._setState({ playing: false, enabled: false })
  }
}

export const soundManager = new SoundManager()

// ------------------------------------------------------------
// HMR
// ------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    soundManager._cleanupEvents()
    soundManager.dispose()
  })
  import.meta.hot.accept()
}
