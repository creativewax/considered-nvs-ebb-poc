// src/hooks/useLogs.js

import { useManagerSubscription } from './useManagerSubscription'
import { logManager } from '../managers/LogManager'

// ------------------------------------------------------------
// USE LOGS — subscribe to LogManager state
// ------------------------------------------------------------

export function useLogs() {
  const state = useManagerSubscription(logManager)

  return {
    ...state,
    loadEntries: (recordId) => logManager.loadEntries(recordId),
    addEntry:    (entry) => logManager.addEntry(entry),
  }
}
