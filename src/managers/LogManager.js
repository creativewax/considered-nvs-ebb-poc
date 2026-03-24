// src/managers/LogManager.js

import BaseManager from './BaseManager.js'
import { dataManager } from './DataManager.js'
import { EVENTS } from '../constants/events.js'

// ------------------------------------------------------------
// LOG MANAGER — loads and adds log entries for sleep records
// ------------------------------------------------------------

class LogManager extends BaseManager {
  constructor() {
    super()
    this._state = { entries: [], isAdding: false }

    this._onEvent(EVENTS.SLEEP_RECORD_SELECTED, (record) => {
      if (record?.id) this.loadEntries(record.id)
    })
  }

  // ------------------------------------------------------------
  // METHODS
  // ------------------------------------------------------------

  async loadEntries(sleepRecordId) {
    const entries = dataManager.getLogEntries(sleepRecordId)
    this._setState({ entries })
    this._emit(EVENTS.LOG_ENTRIES_LOADED, { entries, sleepRecordId })
  }

  async addEntry(entry) {
    this._setState({ isAdding: true })
    dataManager.addLogEntry(entry)
    await this.loadEntries(entry.sleepRecordId)
    this._setState({ isAdding: false })
    this._emit(EVENTS.LOG_ENTRY_ADDED, entry)
  }
}

export const logManager = new LogManager()

// ------------------------------------------------------------
// HMR
// ------------------------------------------------------------

if (import.meta.hot) {
  import.meta.hot.dispose(() => logManager._cleanupEvents())
  import.meta.hot.accept()
}
