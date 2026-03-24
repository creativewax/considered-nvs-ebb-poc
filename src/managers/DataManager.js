// src/managers/DataManager.js

import { allRecords } from '../data/sleepRecords.js'
import { allEntries } from '../data/logEntries.js'
import { getInsightsForRecord } from '../data/insights.js'

// ------------------------------------------------------------
// DATA MANAGER
// Plain singleton — no event system, no subscribe pattern.
// Wraps seed data and controls the reveal progression.
// ------------------------------------------------------------

class DataManager {
  constructor() {
    this._sleepRecords = [...allRecords]
    this._logEntries = [...allEntries]
    // Only 4 records visible initially — more revealed after sync
    this._revealedCount = 4
    this._deviceStatus = { connected: false, lastSync: null }
  }

  // ------------------------------------------------------------
  // SLEEP RECORDS
  // ------------------------------------------------------------

  getSleepRecords() {
    return this._sleepRecords
      .slice(0, this._revealedCount)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  getSleepRecord(id) {
    return this._sleepRecords.find(r => r.id === id) || null
  }

  // ------------------------------------------------------------
  // LOG ENTRIES
  // ------------------------------------------------------------

  getLogEntries(sleepRecordId) {
    return this._logEntries.filter(e => e.sleepRecordId === sleepRecordId)
  }

  addLogEntry(entry) {
    this._logEntries.push(entry)
  }

  // ------------------------------------------------------------
  // INSIGHTS
  // ------------------------------------------------------------

  getInsights(sleepRecordId) {
    return getInsightsForRecord(sleepRecordId)
  }

  // ------------------------------------------------------------
  // DEVICE + SYNC
  // ------------------------------------------------------------

  revealSyncedRecords() {
    this._revealedCount = this._sleepRecords.length
  }

  getDeviceStatus() {
    return { ...this._deviceStatus }
  }

  setDeviceStatus(status) {
    this._deviceStatus = { ...this._deviceStatus, ...status }
  }
}

export const dataManager = new DataManager()

// ------------------------------------------------------------
// HMR — replace singleton in place so managers stay in sync
// ------------------------------------------------------------
if (import.meta.hot) {
  import.meta.hot.accept()
}
