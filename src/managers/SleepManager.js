// src/managers/SleepManager.js

import BaseManager from './BaseManager.js'
import { dataManager } from './DataManager.js'
import { EVENTS } from '../constants/events.js'

// ------------------------------------------------------------
// SLEEP MANAGER — loads and selects sleep records
// ------------------------------------------------------------

class SleepManager extends BaseManager {
  constructor() {
    super()
    this._state = { records: [], selectedRecord: null, isLoading: false }

    this._onEvent(EVENTS.DEVICE_SYNC_COMPLETE, () => this.loadRecords())
  }

  // ------------------------------------------------------------
  // METHODS
  // ------------------------------------------------------------

  async loadRecords() {
    this._setState({ isLoading: true })
    const records = dataManager.getSleepRecords()
    this._setState({ records, isLoading: false })
    this._emit(EVENTS.SLEEP_DATA_LOADED, { records })
  }

  async selectRecord(id) {
    const record = dataManager.getSleepRecord(id)
    this._setState({ selectedRecord: record })
    this._emit(EVENTS.SLEEP_RECORD_SELECTED, record)
  }

  getLatestRecord() {
    const { records } = this._state
    if (!records.length) return null
    return records[0]
  }
}

export const sleepManager = new SleepManager()

// ------------------------------------------------------------
// HMR
// ------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => sleepManager._cleanupEvents())
  import.meta.hot.accept()
}
