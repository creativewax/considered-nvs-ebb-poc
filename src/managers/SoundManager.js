// src/managers/SoundManager.js

import BaseManager from './BaseManager.js'

// ------------------------------------------------------------
// SOUND MANAGER — stub; Web Audio wired in Phase 9
// ------------------------------------------------------------

class SoundManager extends BaseManager {
  constructor() {
    super()
    this._state = { playing: false, quality: null }
  }

  // ------------------------------------------------------------
  // METHODS (stubs)
  // ------------------------------------------------------------

  play() {
    this._setState({ playing: true })
  }

  stop() {
    this._setState({ playing: false })
  }

  setQuality(quality) {
    this._setState({ quality })
  }
}

export const soundManager = new SoundManager()

// ------------------------------------------------------------
// HMR
// ------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => soundManager._cleanupEvents())
  import.meta.hot.accept()
}
