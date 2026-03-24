// src/managers/DeviceManager.js

import BaseManager from './BaseManager.js'
import { dataManager } from './DataManager.js'
import { EVENTS } from '../constants/events.js'

// ------------------------------------------------------------
// DEVICE MANAGER — handles connection state and sync simulation
// ------------------------------------------------------------

class DeviceManager extends BaseManager {
  constructor() {
    super()
    this._state = { connected: false, syncing: false, syncProgress: 0, lastSync: null }
    this._syncInterval = null

    this._onEvent(EVENTS.DEVICE_SYNC_REQUESTED, () => this.requestSync())
  }

  // ------------------------------------------------------------
  // METHODS
  // ------------------------------------------------------------

  connect() {
    this._setState({ connected: true })
    this._emit(EVENTS.DEVICE_STATUS_CHANGED, { connected: true })
  }

  requestSync() {
    if (this._state.syncing) return

    this._setState({ syncing: true, syncProgress: 0 })

    // Simulate a 3-second sync — 100ms ticks, 30 ticks to reach 100%
    this._syncInterval = setInterval(() => {
      const progress = Math.min(this._state.syncProgress + (100 / 30), 100)
      this._setState({ syncProgress: progress })
      this._emit(EVENTS.DEVICE_SYNC_PROGRESS, { progress })

      if (progress >= 100) {
        clearInterval(this._syncInterval)
        this._syncInterval = null

        const lastSync = new Date()
        dataManager.revealSyncedRecords()
        dataManager.setDeviceStatus({ connected: true, lastSync })

        this._setState({ syncing: false, syncProgress: 100, lastSync })
        this._emit(EVENTS.DEVICE_SYNC_COMPLETE, { lastSync })
      }
    }, 100)
  }
}

export const deviceManager = new DeviceManager()

// ------------------------------------------------------------
// HMR
// ------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (deviceManager._syncInterval) clearInterval(deviceManager._syncInterval)
    deviceManager._cleanupEvents()
  })
  import.meta.hot.accept()
}
