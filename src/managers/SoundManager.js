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
    this._state  = { playing: false, quality: null }
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

  play() {
    if (this._state.playing) return

    if (!this._engine) {
      this._engine = new AmbientEngine()
    }

    this._engine.start()

    // Apply any pending quality immediately after engine starts
    if (this._state.quality) {
      this._engine.setQuality(this._state.quality)
    }

    this._setState({ playing: true })
  }

  stop() {
    if (!this._state.playing) return

    // Engine handles debounce internally — if stop arrives too soon
    // after start (AnimatePresence remount), it will be ignored
    this._engine?.stop()

    // Check if engine actually stopped (debounce may have blocked it)
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
    this._setState({ playing: false })
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
