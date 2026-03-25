// src/managers/SoundManager.js

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

    // When a record is selected, update the engine quality
    this._onEvent(EVENTS.SLEEP_RECORD_SELECTED, (record) => {
      if (record?.quality) {
        this._setState({ quality: record.quality })
        this._engine?.setQuality(record.quality)
      }
    })
  }

  // ------------------------------------------------------------
  // METHODS
  // ------------------------------------------------------------

  // Toggle — user explicitly enables/disables sound
  async toggle() {
    if (this._state.enabled) {
      this._setState({ enabled: false })
      this._stopEngine()
    } else {
      this._setState({ enabled: true })
      await this._startEngine()
    }
  }

  // Resume — called by pages on mount, only starts if user previously enabled
  async resume() {
    if (!this._state.enabled || this._state.playing) return
    await this._startEngine()
  }

  // Pause — called by pages on unmount, fades out but keeps enabled flag
  pause() {
    this._stopEngine()
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
    if (this._engine?._playing) return
    this._setState({ playing: false })
  }

  setQuality(quality) {
    this._setState({ quality })
    this._engine?.setQuality(quality)
  }

  dispose() {
    this._engine?.dispose()
    this._engine = null
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
